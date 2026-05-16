/**
 * CyberHex v3.0 — RBAC Authorization Middleware
 *
 * Role-based access control with hierarchical roles:
 *   admin > moderator > researcher > user > viewer
 *
 * Higher roles inherit permissions of lower roles.
 *
 * Usage:
 *   router.get('/admin-only', requireRole('admin'), handler);
 *   router.get('/researcher+', requireRole('researcher'), handler);
 *
 * @module middleware/rbac
 */

import { AuthorizationError } from './errorHandler.js';

// ──── Role Hierarchy ─────────────────────────────────────────────
const ROLE_HIERARCHY = {
  admin: 5,
  moderator: 4,
  researcher: 3,
  user: 2,
  viewer: 1,
};

/**
 * Check if a role meets the minimum required level.
 * @param {string} userRole - The user's actual role
 * @param {string} requiredRole - The minimum required role
 * @returns {boolean}
 */
function hasMinimumRole(userRole, requiredRole) {
  const userLevel = ROLE_HIERARCHY[userRole] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || Infinity;
  return userLevel >= requiredLevel;
}

/**
 * Create middleware that requires a minimum role level.
 * @param {string} requiredRole - Minimum role name
 * @returns {import('express').RequestHandler}
 */
export function requireRole(requiredRole) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new AuthorizationError('Authentication required. Please log in.'));
    }

    if (!hasMinimumRole(req.user.role, requiredRole)) {
      return next(
        new AuthorizationError(
          `Insufficient permissions. Role '${requiredRole}' or higher is required.`
        )
      );
    }

    next();
  };
}

/**
 * Create middleware that requires one of several roles.
 * @param {string[]} allowedRoles
 * @returns {import('express').RequestHandler}
 */
export function requireAnyRole(...allowedRoles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new AuthorizationError('Authentication required. Please log in.'));
    }

    const hasRole = allowedRoles.some((role) => hasMinimumRole(req.user.role, role));

    if (!hasRole) {
      return next(
        new AuthorizationError(
          `Insufficient permissions. One of [${allowedRoles.join(', ')}] is required.`
        )
      );
    }

    next();
  };
}

/**
 * Check if the authenticated user owns the resource or is admin.
 * Expects req.resourceOwnerId to be set by the route handler.
 * @returns {import('express').RequestHandler}
 */
export function requireOwnership() {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new AuthorizationError('Authentication required.'));
    }

    const isAdmin = hasMinimumRole(req.user.role, 'admin');
    const isOwner = req.resourceOwnerId && req.resourceOwnerId === req.user.userId;

    if (!isAdmin && !isOwner) {
      return next(
        new AuthorizationError('You do not have permission to access this resource.')
      );
    }

    next();
  };
}

/**
 * Utility: check if user has a role (synchronous, for use outside middleware).
 * @param {object} user - { role: string }
 * @param {string} requiredRole
 */
export function userHasRole(user, requiredRole) {
  return hasMinimumRole(user?.role, requiredRole);
}

export { ROLE_HIERARCHY, hasMinimumRole };

export default {
  requireRole,
  requireAnyRole,
  requireOwnership,
  userHasRole,
};