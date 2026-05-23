import helmet from 'helmet';
import { config } from '../utils/env.js';

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

export function csrfProtection() {
  return (req, res, next) => {

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

export function csrfTokenCookie() {
  return (req, res, next) => {

    if (!req.cookies?.['csrf-token']) {
      const token = require('crypto').randomBytes(32).toString('hex');
      res.cookie('csrf-token', token, {
        httpOnly: false,
        secure: config.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 24 * 60 * 60 * 1000,
      });
    }
    next();
  };
}

export function sizeLimiter() {
  return (req, _res, next) => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);
    const maxSize = 10 * 1024 * 1024;

    if (contentLength > maxSize) {
      return _res.status(413).json({
        error: 'Payload too large',
        message: `Request body exceeds the maximum allowed size of ${maxSize / 1024 / 1024}MB`,
      });
    }
    next();
  };
}

export function parameterPollutionProtection() {
  return (req, _res, next) => {

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

export function trustProxy() {
  return (req, _res, next) => {

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
