import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';

export const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Access token required',
        code: 'NO_TOKEN'
      });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        logger.warn(`Invalid token attempt: ${err.message}`);
        return res.status(403).json({ 
          error: 'Invalid or expired token',
          code: 'INVALID_TOKEN'
        });
      }
      req.user = user;
      next();
    });
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(500).json({ 
      error: 'Authentication failed',
      code: 'AUTH_ERROR'
    });
  }
};

export const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          error: 'User not authenticated',
          code: 'NOT_AUTHENTICATED'
        });
      }

      if (!allowedRoles.includes(req.user.role)) {
        logger.warn(`Unauthorized access attempt by user ${req.user.userId} with role ${req.user.role}`);
        return res.status(403).json({ 
          error: 'Insufficient permissions',
          code: 'INSUFFICIENT_PERMISSIONS',
          requiredRoles: allowedRoles,
          userRole: req.user.role
        });
      }
      
      next();
    } catch (error) {
      logger.error('Authorization error:', error);
      res.status(500).json({ 
        error: 'Authorization failed',
        code: 'AUTH_ERROR'
      });
    }
  };
};

export const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
      jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (!err) {
          req.user = user;
        }
      });
    }
    next();
  } catch (error) {
    logger.warn('Optional auth error:', error);
    next();
  }
};
