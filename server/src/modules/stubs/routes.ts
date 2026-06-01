import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.js';

const router = Router();

const STUBBED_MODULES = [
  'performance',
  'recruitment',
  'training',
  'assets',
  'expenses',
  'saas-admin',
  'ai-talent',
  'analytics',
  'api-gateway',
];

STUBBED_MODULES.forEach(moduleName => {
  // Catch-all routes for stubbed modules returning premium upgrade walls
  router.all(`/${moduleName}*`, authMiddleware, (req, res) => {
    const isTier3 = ['saas-admin', 'ai-talent', 'analytics', 'api-gateway'].includes(moduleName);
    const requiredPlan = isTier3 ? 'Enterprise & SaaS' : 'Growth Plan';
    
    res.status(403).json({
      success: false,
      code: 'PREMIUM_MODULE_LOCKED',
      message: `The '${moduleName}' module is premium and is locked for your current subscription tier.`,
      details: {
        module: moduleName,
        requiredTier: isTier3 ? 3 : 2,
        requiredPlan,
        action: 'Upgrade required. Please contact sales@hrms.io or your HR administrator to activate this feature.',
      },
    });
  });
});

export default router;
