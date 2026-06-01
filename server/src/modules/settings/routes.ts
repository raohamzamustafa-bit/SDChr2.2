import { Router } from 'express';
import { pool } from '../../config/database.js';
import { authMiddleware } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/rbac.js';
import { z } from 'zod';
import { validate } from '../../middleware/validate.js';

const router = Router();

const settingsSchema = z.object({
  name: z.string().optional(),
  branding: z.record(z.any()).optional(),
  settings: z.record(z.any()).optional(),
});

// GET /api/settings - Get settings
router.get('/', authMiddleware, requirePermission('settings', 'read'), async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT id, name, slug, tier, branding, settings, feature_flags FROM tenants WHERE id = $1',
      [req.user!.tenantId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Tenant settings not found' });
      return;
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/settings - Update settings
router.patch('/', authMiddleware, requirePermission('settings', 'update'), validate(settingsSchema), async (req, res, next) => {
  try {
    const { name, branding, settings } = req.body;

    const result = await pool.query(
      `UPDATE tenants
       SET name = COALESCE($1, name),
           branding = COALESCE(branding || $2::jsonb, branding),
           settings = COALESCE(settings || $3::jsonb, settings),
           updated_at = NOW()
       WHERE id = $4
       RETURNING id, name, slug, tier, branding, settings, feature_flags`,
      [name || null, branding ? JSON.stringify(branding) : null, settings ? JSON.stringify(settings) : null, req.user!.tenantId]
    );

    res.json({ success: true, data: result.rows[0], message: 'Settings updated successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
