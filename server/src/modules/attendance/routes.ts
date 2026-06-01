import { Router } from 'express';
import { pool } from '../../config/database.js';
import { authMiddleware } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/rbac.js';
import { z } from 'zod';
import { validate } from '../../middleware/validate.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

const punchSchema = z.object({
  employeeId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkIn: z.string().regex(/^\d{2}:\d{2}:\d{2}$/).optional().nullable(),
  checkOut: z.string().regex(/^\d{2}:\d{2}:\d{2}$/).optional().nullable(),
  status: z.enum(['present', 'absent', 'late', 'half_day', 'on_leave', 'holiday']).default('present'),
  remarks: z.string().optional(),
});

const policySchema = z.object({
  name: z.string().min(1),
  shiftStartTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/),
  shiftEndTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/),
  lateGraceMinutes: z.number().int().nonnegative(),
  halfDayMinutes: z.number().int().nonnegative(),
  isDefault: z.boolean().default(false),
});

// GET /api/attendance - List attendance records with filtering
router.get('/', authMiddleware, requirePermission('attendance', 'read'), async (req, res, next) => {
  try {
    const { startDate, endDate, departmentId, employeeId } = req.query;
    let queryText = `
      SELECT ar.*, e.first_name, e.last_name, e.employee_code, d.name as department_name
      FROM attendance_records ar
      JOIN employees e ON ar.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE ar.tenant_id = $1
    `;
    const params: any[] = [req.user!.tenantId];
    let paramIndex = 2;

    if (startDate) {
      queryText += ` AND ar.date >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }
    if (endDate) {
      queryText += ` AND ar.date <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }
    if (departmentId) {
      queryText += ` AND e.department_id = $${paramIndex}`;
      params.push(departmentId);
      paramIndex++;
    }
    if (employeeId) {
      queryText += ` AND ar.employee_id = $${paramIndex}`;
      params.push(employeeId);
      paramIndex++;
    }

    queryText += ' ORDER BY ar.date DESC, e.employee_code ASC';

    const result = await pool.query(queryText, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

// POST /api/attendance - Manual check-in/out or update punch
router.post('/', authMiddleware, requirePermission('attendance', 'create'), validate(punchSchema), async (req, res, next) => {
  try {
    const { employeeId, date, checkIn, checkOut, status, remarks } = req.body;
    
    // Check if record already exists for the day
    const existing = await pool.query(
      'SELECT id FROM attendance_records WHERE tenant_id = $1 AND employee_id = $2 AND date = $3',
      [req.user!.tenantId, employeeId, date]
    );

    let result;
    if (existing.rows.length > 0) {
      result = await pool.query(
        `UPDATE attendance_records
         SET check_in = COALESCE($1, check_in),
             check_out = COALESCE($2, check_out),
             status = $3,
             remarks = $4,
             updated_at = NOW()
         WHERE tenant_id = $5 AND employee_id = $6 AND date = $7
         RETURNING *`,
        [checkIn || null, checkOut || null, status, remarks || null, req.user!.tenantId, employeeId, date]
      );
    } else {
      const id = uuidv4();
      result = await pool.query(
        `INSERT INTO attendance_records (id, tenant_id, employee_id, date, check_in, check_out, status, remarks)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [id, req.user!.tenantId, employeeId, date, checkIn || null, checkOut || null, status, remarks || null]
      );
    }

    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// GET /api/attendance/summary/:employeeId - Monthly attendance summary
router.get('/summary/:employeeId', authMiddleware, requirePermission('attendance', 'read'), async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const { month, year } = req.query; // e.g. month=5, year=2026

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`; // Postgres will handle standard filtering or date parsing

    const result = await pool.query(
      `SELECT status, COUNT(*) as count
       FROM attendance_records
       WHERE tenant_id = $1 AND employee_id = $2 AND date >= $3 AND date <= $4
       GROUP BY status`,
      [req.user!.tenantId, employeeId, startDate, endDate]
    );

    const summary = {
      present: 0,
      absent: 0,
      late: 0,
      half_day: 0,
      on_leave: 0,
      holiday: 0,
    };

    result.rows.forEach(row => {
      if (row.status in summary) {
        (summary as any)[row.status] = Number(row.count);
      }
    });

    res.json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
});

// Attendance Policies
router.get('/policies', authMiddleware, requirePermission('attendance', 'read'), async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM attendance_policies WHERE tenant_id = $1 ORDER BY name ASC',
      [req.user!.tenantId]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

router.post('/policies', authMiddleware, requirePermission('attendance', 'create'), validate(policySchema), async (req, res, next) => {
  try {
    const { name, shiftStartTime, shiftEndTime, lateGraceMinutes, halfDayMinutes, isDefault } = req.body;
    const id = uuidv4();

    // If setting as default, clear others
    if (isDefault) {
      await pool.query('UPDATE attendance_policies SET is_default = false WHERE tenant_id = $1', [req.user!.tenantId]);
    }

    const result = await pool.query(
      `INSERT INTO attendance_policies (id, tenant_id, name, shift_start_time, shift_end_time, late_grace_minutes, half_day_minutes, is_default)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [id, req.user!.tenantId, name, shiftStartTime, shiftEndTime, lateGraceMinutes, halfDayMinutes, isDefault]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

export default router;
