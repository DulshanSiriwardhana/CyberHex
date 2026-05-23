import AuditLog from '../models/AuditLog.js';
import { logger } from '../utils/logger.js';

export const AuditEventType = {

  LOGIN_SUCCESS: 'auth.login.success',
  LOGIN_FAILURE: 'auth.login.failure',
  LOGOUT: 'auth.logout',
  TOKEN_REFRESH: 'auth.token.refresh',
  TOKEN_REVOKE: 'auth.token.revoke',
  PASSWORD_CHANGE: 'auth.password.change',
  MFA_ENROLL: 'auth.mfa.enroll',
  MFA_VERIFY: 'auth.mfa.verify',

  USER_CREATE: 'user.create',
  USER_UPDATE: 'user.update',
  USER_DELETE: 'user.delete',
  USER_ROLE_CHANGE: 'user.role.change',
  USER_PROFILE_UPDATE: 'user.profile.update',

  EXPERIMENT_CREATE: 'experiment.create',
  EXPERIMENT_UPDATE: 'experiment.update',
  EXPERIMENT_DELETE: 'experiment.delete',
  EXPERIMENT_START: 'experiment.start',
  EXPERIMENT_STOP: 'experiment.stop',
  EXPERIMENT_EXPORT: 'experiment.export',

  MODEL_CREATE: 'model.create',
  MODEL_UPDATE: 'model.update',
  MODEL_DELETE: 'model.delete',
  MODEL_DEPLOY: 'model.deploy',
  MODEL_EXPORT: 'model.export',

  SYSTEM_STARTUP: 'system.startup',
  SYSTEM_SHUTDOWN: 'system.shutdown',
  CONFIG_CHANGE: 'system.config.change',
  API_KEY_CREATE: 'system.apikey.create',
  API_KEY_REVOKE: 'system.apikey.revoke',

  RATE_LIMIT_EXCEEDED: 'security.ratelimit.exceeded',
  ACCESS_DENIED: 'security.access.denied',
  SUSPICIOUS_ACTIVITY: 'security.suspicious',
};

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

export function auditMiddleware() {
  return (req, _res, next) => {

    const originalEnd = _res.end;

    _res.end = function (...args) {

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
