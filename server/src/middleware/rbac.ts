import { Request, Response, NextFunction } from 'express';
import { hasPermission } from '../../packages/shared/src/constants/roles.js';

/**
 * RBAC middleware factory — checks if the user's role has permission for the given module/action.
 */
export function requirePermission(module: string, action: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    if (!hasPermission(req.user.role, module, action)) {
      res.status(403).json({
        success: false,
        message: `Insufficient permissions: ${action} on ${module}`,
      });
      return;
    }

    next();
  };
}

/**
 * Require one of the specified roles.
 */
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Insufficient role privileges',
      });
      return;
    }

    next();
  };
}
