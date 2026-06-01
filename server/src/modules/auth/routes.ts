import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { pool } from '../../config/database.js';
import { env } from '../../config/env.js';
import { authMiddleware, JwtPayload } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  companyName: z.string().min(1),
  companySlug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/),
});

function generateTokens(payload: JwtPayload) {
  const accessToken = jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as any });
  const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN as any });
  return { accessToken, refreshToken, expiresIn: 86400 };
}

// POST /api/auth/login
router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      `SELECT u.*, t.name as tenant_name, t.slug as tenant_slug, t.tier, t.branding, t.settings, t.feature_flags
       FROM users u JOIN tenants t ON u.tenant_id = t.id
       WHERE u.email = $1 AND u.is_active = true AND t.subscription_status = 'active'`,
      [email]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const payload: JwtPayload = {
      userId: user.id,
      tenantId: user.tenant_id,
      email: user.email,
      role: user.role,
    };

    const tokens = generateTokens(payload);

    // Update last login and refresh token
    await pool.query(
      'UPDATE users SET last_login_at = NOW(), refresh_token = $1 WHERE id = $2',
      [tokens.refreshToken, user.id]
    );

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          tenantId: user.tenant_id,
          email: user.email,
          role: user.role,
          employeeId: user.employee_id,
          isActive: user.is_active,
        },
        tokens,
        tenant: {
          id: user.tenant_id,
          name: user.tenant_name,
          slug: user.tenant_slug,
          tier: user.tier,
          branding: user.branding || {},
          settings: user.settings || {},
          featureFlags: user.feature_flags || {},
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/register — creates a new tenant + admin user
router.post('/register', validate(registerSchema), async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { email, password, firstName, lastName, companyName, companySlug } = req.body;

    await client.query('BEGIN');

    // Check slug uniqueness
    const existing = await client.query('SELECT id FROM tenants WHERE slug = $1', [companySlug]);
    if (existing.rows.length > 0) {
      res.status(409).json({ success: false, message: 'Company slug already taken' });
      return;
    }

    // Create tenant
    const tenantResult = await client.query(
      `INSERT INTO tenants (name, slug, tier) VALUES ($1, $2, 1) RETURNING id`,
      [companyName, companySlug]
    );
    const tenantId = tenantResult.rows[0].id;

    // Create user
    const passwordHash = await bcrypt.hash(password, 12);
    const userResult = await client.query(
      `INSERT INTO users (tenant_id, email, password_hash, role) VALUES ($1, $2, $3, 'tenant_admin') RETURNING id`,
      [tenantId, email, passwordHash]
    );

    // Create employee record for admin
    await client.query(
      `INSERT INTO employees (tenant_id, employee_code, first_name, last_name, email, employment_type, date_of_joining)
       VALUES ($1, 'EMP001', $2, $3, $4, 'full_time', CURRENT_DATE)`,
      [tenantId, firstName, lastName, email]
    );

    await client.query('COMMIT');

    const payload: JwtPayload = {
      userId: userResult.rows[0].id,
      tenantId,
      email,
      role: 'tenant_admin',
    };

    const tokens = generateTokens(payload);

    res.status(201).json({
      success: true,
      data: {
        user: { id: userResult.rows[0].id, tenantId, email, role: 'tenant_admin' },
        tokens,
        tenant: { id: tenantId, name: companyName, slug: companySlug, tier: 1 },
      },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ success: false, message: 'Refresh token required' });
      return;
    }

    const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as JwtPayload;

    // Verify token exists in database
    const result = await pool.query(
      'SELECT id FROM users WHERE id = $1 AND refresh_token = $2 AND is_active = true',
      [decoded.userId, refreshToken]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ success: false, message: 'Invalid refresh token' });
      return;
    }

    const tokens = generateTokens({
      userId: decoded.userId,
      tenantId: decoded.tenantId,
      email: decoded.email,
      role: decoded.role,
    });

    await pool.query('UPDATE users SET refresh_token = $1 WHERE id = $2', [tokens.refreshToken, decoded.userId]);

    res.json({ success: true, data: { tokens } });
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.tenant_id, u.email, u.role, u.employee_id, u.is_active, u.last_login_at,
              t.name as tenant_name, t.slug as tenant_slug, t.tier, t.branding, t.settings, t.feature_flags,
              e.first_name, e.last_name, e.profile_photo_url
       FROM users u
       JOIN tenants t ON u.tenant_id = t.id
       LEFT JOIN employees e ON u.employee_id = e.id
       WHERE u.id = $1`,
      [req.user!.userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const u = result.rows[0];
    res.json({
      success: true,
      data: {
        user: {
          id: u.id, tenantId: u.tenant_id, email: u.email, role: u.role,
          employeeId: u.employee_id, isActive: u.is_active,
          firstName: u.first_name, lastName: u.last_name,
          profilePhotoUrl: u.profile_photo_url,
        },
        tenant: {
          id: u.tenant_id, name: u.tenant_name, slug: u.tenant_slug,
          tier: u.tier, branding: u.branding || {}, settings: u.settings || {},
          featureFlags: u.feature_flags || {},
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout
router.post('/logout', authMiddleware, async (req, res) => {
  await pool.query('UPDATE users SET refresh_token = NULL WHERE id = $1', [req.user!.userId]);
  res.json({ success: true, message: 'Logged out successfully' });
});

export default router;
