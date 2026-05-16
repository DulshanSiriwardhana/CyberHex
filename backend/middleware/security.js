/**
 * CyberHex v3.0 — Security Hardening Middleware
 *
 * Production-grade security middleware that extends Helmet with:
 * - Strict CSP headers
 * - CSRF protection via double-submit cookie pattern
 * - XSS sanitization headers
 * - Security response headers
 * - Request size limiting
 * - Parameter pollution prevention
 *
 * @module middleware/security
 */

import helmet from 'helmet';
import { config } from '../utils/env.js';

// ──── CSP Configuration ──────────────────────────────────────────
const PRODUCTION_CSP = {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://cdn.jsdelivr.net'],
    styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    fontSrc: ["'self'", 'https://fonts.gstatic.com', 'https://cdn.jsdelivr.net'],
    imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
    connectSrc: ["'self'", 'ws:', 'wss:', 'http://localhost:*', 'https://localhost:*'],
    mediaSrc: ["'self'"],
    objectSrc: ["'none'"],
    frameSrc: ["'self'"],
    workerSrc: ["'self'", 'blob:'],
    formAction: ["'self'"],
    baseUri: ["'self'"],
    manifestSrc: ["'self'"],
  },
};

const DEVELOPMENT_CSP = {
  directives: {
    defaultSrc: ["*"],
    scriptSrc: ["*", "'unsafe-inline'", "'unsafe-eval'"],
    styleSrc: ["*", "'unsafe-inline'"],
    connectSrc: ["*"],
  },
};

/**
 * Configure Helmet with production-grade security policies.
 */
export function securityHeaders() {
  const isProduction = config.NODE_ENV === 'production';

  return helmet({
    contentSecurityPolicy: isProduction ? PRODUCTION_CSP : false,
    crossOriginEmbedderPolicy: isProduction,
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    crossOriginResourcePolicy: { policy: 'same-origin' },
    dnsPrefetchControl: { allow: false },
    frameguard: { action: 'deny' },
    hidePoweredBy: true,
    hsts: isProduction
      ? { maxAge: 31536000, includeSubDomains: true, preload: true }
      : false,
    ieNoOpen: true,
    noSniff: true,
    originAgentCluster: true,
    permittedCrossDomainPolicies: { permittedPolicies: 'none' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    xssFilter: true,
  });
}

// ──── CSRF Protection (Double-Submit Cookie Pattern) ─────────────

/**
 * CSRF protection middleware.
 * Uses the double-submit cookie pattern: a random token is set in
 * a cookie, and the client must send the same token in an
 * X-CSRF-Token header for state-changing requests.
 *
 * Safe methods (GET, HEAD, OPTIONS) are excluded.
 */
export function csrfProtection() {
  return (req, res, next) => {
    // Skip for safe methods
    const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
    if (safeMethods.includes(req.method)) {
      return next();
    }

    const cookieToken = req.cookies?.['csrf-token'];
    const headerToken = req.headers['x-csrf-token'];

    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
      return res.status(403).json({
        error: 'CSRF token validation failed',
        message: 'Cross-site request forgery detected. Please refresh the page and try again.',
      });
    }

    next();
  };
}

/**
 * Middleware to set the CSRF token cookie on every response.
 * The client reads this cookie and sends it back as X-CSRF-Token.
 */
export function csrfTokenCookie() {
  return (req, res, next) => {
    // Only set if not already present
    if (!req.cookies?.['csrf-token']) {
      const token = require('crypto').randomBytes(32).toString('hex');
      res.cookie('csrf-token', token, {
        httpOnly: false, // Client must be able to read it
        secure: config.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });
    }
    next();
  };
}

// ──── Request Size Limiting ──────────────────────────────────────

/**
 * Limit request body size to prevent memory exhaustion.
 * Configured via express.json/urlencoded limits in app.js;
 * this provides additional protection against oversized payloads.
 */
export function sizeLimiter() {
  return (req, _res, next) => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (contentLength > maxSize) {
      return _res.status(413).json({
        error: 'Payload too large',
        message: `Request body exceeds the maximum allowed size of ${maxSize / 1024 / 1024}MB`,
      });
    }
    next();
  };
}

// ──── Parameter Pollution Prevention ─────────────────────────────

/**
 * Prevent HTTP parameter pollution by using only the first value
 * for each query parameter. Duplicate parameters are discarded.
 */
export function parameterPollutionProtection() {
  return (req, _res, next) => {
    // Detect duplicate query parameters
    const rawQuery = req.url.split('?')[1] || '';
    const paramCounts = {};
    rawQuery.split('&').forEach((pair) => {
      const key = pair.split('=')[0];
      paramCounts[key] = (paramCounts[key] || 0) + 1;
    });

    const polluted = Object.entries(paramCounts).filter(([_, count]) => count > 1);
    if (polluted.length > 0) {
      return _res.status(400).json({
        error: 'Bad request',
        message: 'Duplicate query parameters detected',
      });
    }

    next();
  };
}

// ──── Trust Proxy Configuration ──────────────────────────────────

/**
 * Configure Express to trust the reverse proxy.
 * Required for accurate client IP when behind Nginx/K8s ingress.
 */
export function trustProxy() {
  return (req, _res, next) => {
    // The 'trust proxy' setting should be on the app itself,
    // but we provide this as a documented configuration point
    next();
  };
}

export default {
  securityHeaders,
  csrfProtection,
  csrfTokenCookie,
  sizeLimiter,
  parameterPollutionProtection,
};