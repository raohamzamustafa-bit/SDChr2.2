import { Router } from 'express';
import { pool } from '../../config/database.js';
import { authMiddleware } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/rbac.js';

const router = Router();

// GET /api/compliance/config - Get current tenant's active compliance configuration
router.get('/config', authMiddleware, requirePermission('compliance', 'read'), async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT branding, settings, feature_flags FROM tenants WHERE id = $1',
      [req.user!.tenantId]
    );

    const config = {
      country: 'Pakistan',
      laws: {
        minimumWage: 32000,
        eobi: {
          employeeRate: 0.01,
          employerRate: 0.05,
          minWageBase: 32000,
        },
        providentFund: {
          employeeRate: 0.0833,
          employerRate: 0.0833,
        },
        socialSecurity: {
          pessiApplicable: true,
          pessiEmployerRate: 0.06,
        },
        taxYear: {
          start: 'July 1',
          end: 'June 30',
          cycle: 'FY 2024-25',
          taxSlabs: [
            { limit: 600000, rate: 0, constant: 0 },
            { limit: 1200000, rate: 0.05, constant: 0 },
            { limit: 2200000, rate: 0.15, constant: 30000 },
            { limit: 3200000, rate: 0.25, constant: 180000 },
            { limit: 4100000, rate: 0.30, constant: 430000 },
            { limit: 99999999, rate: 0.35, constant: 700000 },
          ],
        },
      },
    };

    res.json({ success: true, data: config });
  } catch (err) {
    next(err);
  }
});

// GET /api/compliance/countries - List all supported country compliance packs
router.get('/countries', authMiddleware, requirePermission('compliance', 'read'), async (req, res) => {
  const packs = [
    { country: 'PK', name: 'Pakistan Compliance Pack', version: 'v4.0', status: 'active' },
    { country: 'AE', name: 'UAE Labor Law Compliance Pack', version: 'v1.2', status: 'available_in_pro' },
    { country: 'SA', name: 'Saudi Arabia Nitaqat Compliance Pack', version: 'v1.0', status: 'available_in_pro' },
    { country: 'US', name: 'USA IRS & FLSA Compliance Pack', version: 'v2.1', status: 'available_in_pro' },
  ];
  res.json({ success: true, data: packs });
});

export default router;
