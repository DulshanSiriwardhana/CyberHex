/**
 * CyberHex v3.0 — Audit Log Model
 *
 * MongoDB schema for security and compliance audit events.
 * Each document captures who did what, when, from where,
 * and the outcome. Used for forensics, monitoring, and
 * compliance reporting.
 */

import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      required: true,
      index: true,
      enum: [
        'auth.login.success',
        'auth.login.failure',
        'auth.logout',
        'auth.token.refresh',
        'auth.token.revoke',
        'auth.password.change',
        'auth.mfa.enroll',
        'auth.mfa.verify',
        'user.create',
        'user.update',
        'user.delete',
        'user.role.change',
        'user.profile.update',
        'experiment.create',
        'experiment.update',
        'experiment.delete',
        'experiment.start',
        'experiment.stop',
        'experiment.export',
        'model.create',
        'model.update',
        'model.delete',
        'model.deploy',
        'model.export',
        'system.startup',
        'system.shutdown',
        'system.config.change',
        'system.apikey.create',
        'system.apikey.revoke',
        'security.ratelimit.exceeded',
        'security.access.denied',
        'security.suspicious',
      ],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    userEmail: {
      type: String,
      default: null,
    },
    ip: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
    resourceType: {
      type: String,
      default: null,
      enum: ['experiment', 'model', 'user', 'system', 'apikey', null],
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      index: true,
    },
    outcome: {
      type: String,
      enum: ['success', 'failure', 'unknown'],
      default: 'success',
    },
    description: {
      type: String,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// ──── Indexes ────────────────────────────────────────────────────
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ eventType: 1, createdAt: -1 });
auditLogSchema.index({ resourceType: 1, resourceId: 1 });

// ──── TTL: Auto-delete audit logs older than 90 days ─────────────
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

// ──── Static Methods ─────────────────────────────────────────────

/**
 * Get recent audit events for a user.
 * @param {string} userId
 * @param {number} limit
 */
auditLogSchema.statics.getForUser = function (userId, limit = 50) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

/**
 * Get audit events by type within a time range.
 * @param {string} eventType
 * @param {Date} since
 * @param {Date} until
 */
auditLogSchema.statics.getByType = function (eventType, since, until) {
  return this.find({
    eventType,
    createdAt: { $gte: since, $lte: until },
  })
    .sort({ createdAt: -1 })
    .lean();
};

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;