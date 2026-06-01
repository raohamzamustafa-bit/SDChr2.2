import { Request, Response, NextFunction } from 'express';
import { isFeatureEnabled } from '../../packages/shared/src/constants/features.js';
import { query } from '../config/database.js';

/**
 * Feature gate middleware — blocks access if the tenant's tier doesn't include this feature.
 */
export function requireFeature(featureKey: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.tenantId) {
      res.status(401).json({ success: false, message: 'Tenant context required' });
      return;
    }

    try {
      const result = await query(
        'SELECT tier, feature_flags FROM tenants WHERE id = $1',
        [req.tenantId]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ success: false, message: 'Tenant not found' });
        return;
      }

      const { tier, feature_flags } = result.rows[0];

      if (!isFeatureEnabled(featureKey, tier, feature_flags || {})) {
        res.status(403).json({
          success: false,
          message: `This feature requires a higher subscription tier`,
          requiredFeature: featureKey,
          currentTier: tier,
        });
        return;
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}
