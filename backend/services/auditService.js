/**
 * CyberHex v3.0 — Audit Logging Service
 *
 * Records security-relevant events to MongoDB for compliance,
 * forensics, and monitoring. Tracks: user actions, resource
 * mutations, authentication events, and system anomalies.
 *
 * @module services/auditService
 */

import AuditLog from '../models/AuditLog.js';
import { logger } from '../utils/logger.js';

// ──── Event Types ────────────────────────────────────────────────
export const AuditEventType = {
  // Authentication
  LOGIN_SUCCESS: 'auth.login.success',
  LOGIN_FAILURE: 'auth.login.failure',
  LOGOUT: 'auth.logout',
  TOKEN_REFRESH: 'auth.token.refresh',
  TOKEN_REVOKE: 'auth.token.revoke',
  PASSWORD_CHANGE: 'auth.password.change',
  MFA_ENROLL: 'auth.mfa.enroll',
  MFA_VERIFY: 'auth.mfa.verify',

  // User management
  USER_CREATE: 'user.create',
  USER_UPDATE: 'user.update',
  USER_DELETE: 'user.delete',
  USER_ROLE_CHANGE: 'user.role.change',
  USER_PROFILE_UPDATE: 'user.profile.update',

  // Experiments
  EXPERIMENT_CREATE: 'experiment.create',
  EXPERIMENT_UPDATE: 'experiment.update',
  EXPERIMENT_DELETE: 'experiment.delete',
  EXPERIMENT_START: 'experiment.start',
  EXPERIMENT_STOP: 'experiment.stop',
  EXPERIMENT_EXPORT: 'experiment.export',

  // Models
  MODEL_CREATE: 'model.create',
  MODEL_UPDATE: 'model.update',
  MODEL_DELETE: 'model.delete',
  MODEL_DEPLOY: 'model.deploy',
  MODEL_EXPORT: 'model.export',

  // System
  SYSTEM_STARTUP: 'system.startup',
  SYSTEM_SHUTDOWN: 'system.shutdown',
  CONFIG_CHANGE: 'system.config.change',
  API_KEY_CREATE: 'system.apikey.create',
  API_KEY_REVOKE: 'system.apikey.revoke',

  // Security
  RATE_LIMIT_EXCEEDED: 'security.ratelimit.exceeded',
  ACCESS_DENIED: 'security.access.denied',
  SUSPICIOUS_ACTIVITY: 'security.suspicious',
};

// ──── Core Function ──────────────────────────────────────────────

/**
 * Record an audit event.
 * @param {object} params
 * @param {string} params.eventType - From AuditEventType enum
 * @param {string} [params.userId] - The user who performed the action
 * @param {string} [params.userEmail] - User email for quick reference
 * @param {string} [params.ip] - Client IP address
 * @param {string} [params.userAgent] - Client user agent
 * @param {string} [params.resourceType] - e.g., 'experiment', 'user'
 * @param {string} [params.resourceId] - MongoDB ObjectId of the resource
 * @param {object} [params.metadata] - Additional event-specific data
 * @param {string} [params.outcome] - 'success' | 'failure' | 'unknown'
 * @param {string} [params.description] - Human-readable description
 * @returns {Promise<void>}
 */
export async function recordAudit({
  eventType,
  userId = null,
  userEmail = null,
  ip = null,
  userAgent = null,
  resourceType = null,
  resourceId = null,
  metadata = {},
  outcome = 'success',
  description = null,
}) {
  try {
    // Fire-and-forget: don't block the main request
    AuditLog.create({
      eventType,
      userId,
      userEmail,
      ip,
      userAgent,
      resourceType,
      resourceId,
      metadata,
      outcome,
      description,
    }).catch((err) => {
      logger.error('Audit log write failed:', err.message);
    });
  } catch (err) {
    logger.error('Audit log creation error:', err.message);
  }
}

/**
 * Express middleware that records an audit event on each request.
 * Attach `req.auditEvent` in your route handler to enable logging.
 *
 * Usage:
 *   app.use(auditMiddleware);
 *   // In route: req.auditEvent = { eventType: 'experiment.delete', ... };
 *
 * @returns {import('express').RequestHandler}
 */
export function auditMiddleware() {
  return (req, _res, next) => {
    // Store original end to intercept
    const originalEnd = _res.end;

    _res.end = function (...args) {
      // If route set auditEvent, record it
      if (req.auditEvent) {
        recordAudit({
          ...req.auditEvent,
          userId: req.user?.userId || req.auditEvent.userId,
          userEmail: req.user?.email || req.auditEvent.userEmail,
          ip: req.ip || req.connection?.remoteAddress,
          userAgent: req.get('user-agent'),
          outcome: req.auditEvent.outcome || (_res.statusCode < 400 ? 'success' : 'failure'),
        }).catch(() => {});
      }
      return originalEnd.apply(this, args);
    };

    next();
  };
}

export default {
  recordAudit,
  auditMiddleware,
  AuditEventType,
};