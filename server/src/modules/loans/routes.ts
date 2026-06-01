import { Router } from 'express';
import { pool } from '../../config/database.js';
import { authMiddleware } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/rbac.js';
import { z } from 'zod';
import { validate } from '../../middleware/validate.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

const loanSchema = z.object({
  employeeId: z.string().uuid(),
  loanType: z.enum(['salary_advance', 'personal_loan', 'emergency_loan', 'other']),
  amount: z.number().positive(),
  installments: z.number().int().positive(),
  reason: z.string().optional(),
});

// GET /api/loans - List loans
router.get('/', authMiddleware, requirePermission('loans', 'read'), async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT l.*, e.first_name, e.last_name, e.employee_code
       FROM loans l
       JOIN employees e ON l.employee_id = e.id
       WHERE l.tenant_id = $1
       ORDER BY l.created_at DESC`,
      [req.user!.tenantId]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

// POST /api/loans - Create/Request loan
router.post('/', authMiddleware, requirePermission('loans', 'create'), validate(loanSchema), async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { employeeId, loanType, amount, installments, reason } = req.body;
    const tenantId = req.user!.tenantId;
    const id = uuidv4();

    await client.query('BEGIN');

    // Calculate monthly deduction (EMI)
    // 0% interest rate for employee friendly loans
    const monthlyDeduction = Math.round(amount / installments);

    const result = await client.query(
      `INSERT INTO loans (id, tenant_id, employee_id, loan_type, amount, monthly_deduction, installments, paid_amount, remaining_amount, status, reason)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 0, $5, 'pending', $8)
       RETURNING *`,
      [id, tenantId, employeeId, loanType, amount, monthlyDeduction, installments, reason || null]
    );

    await client.query('COMMIT');
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

// Approve Loan Request & Generate EMI schedule
router.patch('/:id/approve', authMiddleware, requirePermission('loans', 'approve'), async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    await client.query('BEGIN');

    const loanRes = await client.query(
      'SELECT * FROM loans WHERE id = $1 AND tenant_id = $2',
      [id, req.user!.tenantId]
    );

    if (loanRes.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Loan not found' });
      client.release();
      return;
    }

    const loan = loanRes.rows[0];
    if (loan.status !== 'pending') {
      res.status(400).json({ success: false, message: 'Only pending loans can be approved' });
      client.release();
      return;
    }

    // Update status to active
    await client.query(
      `UPDATE loans
       SET status = 'active', approved_by_id = $1, approved_at = NOW(), updated_at = NOW()
       WHERE id = $2`,
      [req.user!.userId, id]
    );

    // Generate EMI installments
    let currentDate = new Date();
    for (let i = 1; i <= loan.installments; i++) {
      currentDate.setMonth(currentDate.getMonth() + 1);
      const dueDate = currentDate.toISOString().split('T')[0];
      const instId = uuidv4();
      
      await client.query(
        `INSERT INTO loan_installments (id, tenant_id, loan_id, installment_number, due_date, principal_amount, interest_amount, total_amount, paid_amount, is_paid)
         VALUES ($1, $2, $3, $4, $5, $6, 0, $6, 0, false)`,
        [instId, req.user!.tenantId, id, i, dueDate, loan.monthly_deduction]
      );
    }

    await client.query('COMMIT');
    res.json({ success: true, message: 'Loan approved and EMI schedule generated' });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

// GET /api/loans/:id/schedule - Get EMI schedule
router.get('/:id/schedule', authMiddleware, requirePermission('loans', 'read'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM loan_installments WHERE loan_id = $1 AND tenant_id = $2 ORDER BY installment_number ASC',
      [id, req.user!.tenantId]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

export default router;
