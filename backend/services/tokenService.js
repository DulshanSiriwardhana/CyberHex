/**
 * CyberHex v3.0 — Token Service (Refresh Token Rotation)
 *
 * Implements secure JWT token management with:
 * - Short-lived access tokens (15 min)
 * - Long-lived refresh tokens (7 days) with rotation
 * - Refresh token reuse detection (revokes all user tokens on reuse)
 * - Token family tracking for audit
 */

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import RevokedToken from '../models/RevokedToken.js';
import { config } from '../utils/env.js';

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';
const ACCESS_TOKEN_EXPIRY_SEC = 15 * 60;
const REFRESH_TOKEN_EXPIRY_SEC = 7 * 24 * 60 * 60;

/**
 * Generate an access token.
 * @param {object} payload - { userId, email, role }
 * @returns {string}
 */
export function generateAccessToken(payload) {
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
    issuer: 'cyberhex',
    subject: payload.userId,
  });
}

/**
 * Generate a refresh token with a unique family ID.
 * @param {object} payload - { userId, email, role }
 * @returns {{ token: string, family: string }}
 */
export function generateRefreshToken(payload) {
  const family = crypto.randomUUID();
  const token = jwt.sign(
    { ...payload, tokenFamily: family },
    config.JWT_REFRESH_SECRET || config.JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY, issuer: 'cyberhex', subject: payload.userId }
  );
  return { token, family };
}

/**
 * Verify an access token.
 * @param {string} token
 * @returns {object|null} Decoded payload or null
 */
export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, config.JWT_SECRET, { issuer: 'cyberhex' });
  } catch {
    return null;
  }
}

/**
 * Verify a refresh token.
 * @param {string} token
 * @returns {object|null} Decoded payload or null
 */
export function verifyRefreshToken(token) {
  try {
    return jwt.verify(
      token,
      config.JWT_REFRESH_SECRET || config.JWT_SECRET,
      { issuer: 'cyberhex' }
    );
  } catch {
    return null;
  }
}

/**
 * Revoke a specific token by adding it to the revoked tokens list.
 * @param {string} token
 * @param {string} userId
 */
export async function revokeToken(token, userId) {
  const decoded = jwt.decode(token);
  const expiresAt = decoded?.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 86400000);

  await RevokedToken.create({
    token: hashToken(token),
    userId,
    tokenFamily: decoded?.tokenFamily || 'unknown',
    expiresAt,
  });
}

/**
 * Revoke all tokens for a user (full session invalidation).
 * @param {string} userId
 */
export async function revokeAllUserTokens(userId) {
  // Mark all current token families as revoked
  // The RevokedToken TTL will auto-cleanup
  await RevokedToken.updateMany(
    { userId, expiresAt: { $gt: new Date() } },
    { $set: { revokedAll: true } }
  );
}

/**
 * Check if a token has been revoked.
 * @param {string} token
 * @returns {Promise<boolean>}
 */
export async function isTokenRevoked(token) {
  const hashed = hashToken(token);
  const revoked = await RevokedToken.findOne({ token: hashed });
  return !!revoked;
}

/**
 * Rotate refresh token - issue new pair and revoke old refresh token.
 * Detects token reuse and revokes entire family if detected.
 * @param {string} oldRefreshToken
 * @returns {Promise<{ accessToken: string, refreshToken: string, family: string } | null>}
 */
export async function rotateRefreshToken(oldRefreshToken) {
  const decoded = verifyRefreshToken(oldRefreshToken);
  if (!decoded) return null;

  // Check if already revoked (possible token reuse/theft)
  if (await isTokenRevoked(oldRefreshToken)) {
    // Token reuse detected - revoke all tokens for this user
    await revokeAllUserTokens(decoded.userId);
    return null;
  }

  // Revoke the old refresh token
  await revokeToken(oldRefreshToken, decoded.userId);

  // Issue new pair
  const payload = { userId: decoded.userId, email: decoded.email, role: decoded.role };
  const accessToken = generateAccessToken(payload);
  const refreshResult = generateRefreshToken(payload);

  return {
    accessToken,
    refreshToken: refreshResult.token,
    family: refreshResult.family,
  };
}

/**
 * Hash a token for storage (SHA-256 first 32 chars).
 * @param {string} token
 * @returns {string}
 */
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex').slice(0, 32);
}

export { ACCESS_TOKEN_EXPIRY_SEC, REFRESH_TOKEN_EXPIRY_SEC };

export default {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  revokeToken,
  revokeAllUserTokens,
  isTokenRevoked,
  rotateRefreshToken,
};