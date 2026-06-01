import { Router } from 'express';
import { pool } from '../../config/database.js';
import { authMiddleware } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/rbac.js';
import { z } from 'zod';
import { validate } from '../../middleware/validate.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

const leaveTypeSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  daysAllowed: z.number().int().positive(),
  isPaid: z.boolean().default(true),
  carryForwardMax: z.number().int().nonnegative().default(0),
});

const leaveRequestSchema = z.object({
  employeeId: z.string().uuid(),
  leaveTypeId: z.string().uuid(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  halfDay: z.boolean().default(false),
  reason: z.string().min(1),
});

// Leave Types
router.get('/types', authMiddleware, requirePermission('leaves', 'read'), async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM leave_types WHERE tenant_id = $1 ORDER BY name ASC',
      [req.user!.tenantId]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

router.post('/types', authMiddleware, requirePermission('leaves', 'create'), validate(leaveTypeSchema), async (req, res, next) => {
  try {
    const { name, code, daysAllowed, isPaid, carryForwardMax } = req.body;
    const id = uuidv4();
    const result = await pool.query(
      `INSERT INTO leave_types (id, tenant_id, name, code, days_allowed, is_paid, carry_forward_max)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [id, req.user!.tenantId, name, code, daysAllowed, isPaid, carryForwardMax]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// Leave Balances
router.get('/balances/:employeeId', authMiddleware, requirePermission('leaves', 'read'), async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const result = await pool.query(
      `SELECT lb.*, lt.name as leave_type_name, lt.code as leave_type_code, lt.days_allowed
       FROM leave_balances lb
       JOIN leave_types lt ON lb.leave_type_id = lt.id
       WHERE lb.tenant_id = $1 AND lb.employee_id = $2`,
      [req.user!.tenantId, employeeId]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

// Leave Requests
router.get('/requests', authMiddleware, requirePermission('leaves', 'read'), async (req, res, next) => {
  try {
    const { status, employeeId } = req.query;
    let queryText = `
      SELECT lr.*, lt.name as leave_type_name, lt.code as leave_type_code,
             e.first_name, e.last_name, e.employee_code,
             app.first_name as approved_first_name, app.last_name as approved_last_name
      FROM leave_requests lr
      JOIN leave_types lt ON lr.leave_type_id = lt.id
      JOIN employees e ON lr.employee_id = e.id
      LEFT JOIN employees app ON lr.approved_by_id = app.id
      WHERE lr.tenant_id = $1
    `;
    const params: any[] = [req.user!.tenantId];
    let paramIndex = 2;

    if (status) {
      queryText += ` AND lr.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    if (employeeId) {
      queryText += ` AND lr.employee_id = $${paramIndex}`;
      params.push(employeeId);
      paramIndex++;
    }

    queryText += ' ORDER BY lr.created_at DESC';

    const result = await pool.query(queryText, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

router.post('/requests', authMiddleware, requirePermission('leaves', 'create'), validate(leaveRequestSchema), async (req, res, next) => {
  try {
    const { employeeId, leaveTypeId, startDate, endDate, halfDay, reason } = req.body;

    // Calculate days requested
    const start = new Date(startDate);
    const end = new Date(endDate);
    let days = Math.round((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;
    if (halfDay) {
      days = 0.5;
    }

    // Check balance
    const balanceRes = await pool.query(
      'SELECT id, balance FROM leave_balances WHERE tenant_id = $1 AND employee_id = $2 AND leave_type_id = $3',
      [req.user!.tenantId, employeeId, leaveTypeId]
    );

    if (balanceRes.rows.length === 0) {
      // If no balance row exists, create one with default allowed
      const typeRes = await pool.query('SELECT days_allowed FROM leave_types WHERE id = $1', [leaveTypeId]);
      if (typeRes.rows.length === 0) {
        res.status(404).json({ success: false, message: 'Leave type not found' });
        return;
      }
      const allowed = typeRes.rows[0].days_allowed;
      const lbId = uuidv4();
      await pool.query(
        `INSERT INTO leave_balances (id, tenant_id, employee_id, leave_type_id, allocated, used, balance)
         VALUES ($1, $2, $3, $4, $5, 0, $5)`,
        [lbId, req.user!.tenantId, employeeId, leaveTypeId, allowed]
      );
    }

    const currentBalance = balanceRes.rows[0]?.balance ?? 15; // default fallback if newly created above
    if (currentBalance < days) {
      res.status(400).json({ success: false, message: 'Insufficient leave balance' });
      return;
    }

    const id = uuidv4();
    const result = await pool.query(
      `INSERT INTO leave_requests (id, tenant_id, employee_id, leave_type_id, start_date, end_date, half_day, days_requested, reason, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending')
       RETURNING *`,
      [id, req.user!.tenantId, employeeId, leaveTypeId, startDate, endDate, halfDay, days, reason]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// Approve Request
router.patch('/requests/:id/approve', authMiddleware, requirePermission('leaves', 'approve'), async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    await client.query('BEGIN');

    const requestRes = await client.query(
      'SELECT * FROM leave_requests WHERE id = $1 AND tenant_id = $2',
      [id, req.user!.tenantId]
    );

    if (requestRes.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Leave request not found' });
      client.release();
      return;
    }

    const request = requestRes.rows[0];
    if (request.status !== 'pending') {
      res.status(400).json({ success: false, message: 'Only pending leave requests can be approved' });
      client.release();
      return;
    }

    // Update leave request status
    await client.query(
      `UPDATE leave_requests
       SET status = 'approved', approved_by_id = $1, approved_at = NOW(), updated_at = NOW()
       WHERE id = $2`,
      [req.user!.userId, id]
    );

    // Update leave balance
    await client.query(
      `UPDATE leave_balances
       SET used = used + $1,
           balance = balance - $1,
           updated_at = NOW()
       WHERE tenant_id = $2 AND employee_id = $3 AND leave_type_id = $4`,
      [request.days_requested, req.user!.tenantId, request.employee_id, request.leave_type_id]
    );

    // Insert attendance records as 'on_leave'
    let current = new Date(request.start_date);
    const end = new Date(request.end_date);
    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0];
      
      const punchId = uuidv4();
      await client.query(
        `INSERT INTO attendance_records (id, tenant_id, employee_id, date, status, remarks)
         VALUES ($1, $2, $3, $4, 'on_leave', 'Approved Leave')
         ON CONFLICT (tenant_id, employee_id, date) 
         DO UPDATE SET status = 'on_leave', remarks = 'Approved Leave'`,
        [punchId, req.user!.tenantId, request.employee_id, dateStr]
      );
      
      current.setDate(current.getDate() + 1);
    }

    await client.query('COMMIT');
    res.json({ success: true, message: 'Leave request approved successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

// Reject Request
router.patch('/requests/:id/reject', authMiddleware, requirePermission('leaves', 'approve'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const result = await pool.query(
      `UPDATE leave_requests
       SET status = 'rejected', approved_by_id = $1, approved_at = NOW(), updated_at = NOW(), remarks = $2
       WHERE id = $3 AND tenant_id = $4 AND status = 'pending'
       RETURNING *`,
      [req.user!.userId, reason || 'Rejected by HR', id, req.user!.tenantId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Pending leave request not found' });
      return;
    }

    res.json({ success: true, message: 'Leave request rejected successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
