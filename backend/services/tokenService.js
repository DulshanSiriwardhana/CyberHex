import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import RevokedToken from '../models/RevokedToken.js';
import { config } from '../utils/env.js';

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';
const ACCESS_TOKEN_EXPIRY_SEC = 15 * 60;
const REFRESH_TOKEN_EXPIRY_SEC = 7 * 24 * 60 * 60;

export function generateAccessToken(payload) {
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
    issuer: 'cyberhex',
    subject: payload.userId,
  });
}

export function generateRefreshToken(payload) {
  const family = crypto.randomUUID();
  const token = jwt.sign(
    { ...payload, tokenFamily: family },
    config.JWT_REFRESH_SECRET || config.JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY, issuer: 'cyberhex', subject: payload.userId }
  );
  return { token, family };
}

export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, config.JWT_SECRET, { issuer: 'cyberhex' });
  } catch {
    return null;
  }
}

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

export async function revokeAllUserTokens(userId) {

  await RevokedToken.updateMany(
    { userId, expiresAt: { $gt: new Date() } },
    { $set: { revokedAll: true } }
  );
}

export async function isTokenRevoked(token) {
  const hashed = hashToken(token);
  const revoked = await RevokedToken.findOne({ token: hashed });
  return !!revoked;
}

export async function rotateRefreshToken(oldRefreshToken) {
  const decoded = verifyRefreshToken(oldRefreshToken);
  if (!decoded) return null;

  if (await isTokenRevoked(oldRefreshToken)) {

    await revokeAllUserTokens(decoded.userId);
    return null;
  }

  await revokeToken(oldRefreshToken, decoded.userId);

  const payload = { userId: decoded.userId, email: decoded.email, role: decoded.role };
  const accessToken = generateAccessToken(payload);
  const refreshResult = generateRefreshToken(payload);

  return {
    accessToken,
    refreshToken: refreshResult.token,
    family: refreshResult.family,
  };
}

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
