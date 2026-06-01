import { Router } from 'express';
import { pool } from '../../config/database.js';
import { authMiddleware } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/rbac.js';
import { z } from 'zod';
import { validate } from '../../middleware/validate.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

const salaryStructureSchema = z.object({
  name: z.string().min(1),
  basicSalary: z.number().positive(),
  houseRentAllowance: z.number().nonnegative().default(0),
  medicalAllowance: z.number().nonnegative().default(0),
  transportAllowance: z.number().nonnegative().default(0),
  utilitiesAllowance: z.number().nonnegative().default(0),
  otherAllowances: z.number().nonnegative().default(0),
  eobiApplicable: z.boolean().default(true),
  providentFundApplicable: z.boolean().default(true),
  providentFundRate: z.number().min(0).max(100).default(8.33),
});

const employeeSalarySchema = z.object({
  employeeId: z.string().uuid(),
  salaryStructureId: z.string().uuid(),
  effectiveFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const payrollRunSchema = z.object({
  billingPeriod: z.string().regex(/^\d{4}-\d{2}$/), // e.g. "2026-05"
});

// Salary Structures
router.get('/structures', authMiddleware, requirePermission('payroll', 'read'), async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM salary_structures WHERE tenant_id = $1 ORDER BY name ASC',
      [req.user!.tenantId]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

router.post('/structures', authMiddleware, requirePermission('payroll', 'create'), validate(salaryStructureSchema), async (req, res, next) => {
  try {
    const {
      name, basicSalary, houseRentAllowance, medicalAllowance,
      transportAllowance, utilitiesAllowance, otherAllowances,
      eobiApplicable, providentFundApplicable, providentFundRate,
    } = req.body;
    const id = uuidv4();
    const result = await pool.query(
      `INSERT INTO salary_structures 
       (id, tenant_id, name, basic_salary, house_rent_allowance, medical_allowance, transport_allowance, utilities_allowance, other_allowances, eobi_applicable, provident_fund_applicable, provident_fund_rate)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        id, req.user!.tenantId, name, basicSalary, houseRentAllowance, medicalAllowance,
        transportAllowance, utilitiesAllowance, otherAllowances, eobiApplicable, providentFundApplicable, providentFundRate,
      ]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// Assign Salary to Employee
router.get('/employee-salaries', authMiddleware, requirePermission('payroll', 'read'), async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT es.*, e.first_name, e.last_name, e.employee_code, ss.name as structure_name, ss.basic_salary
       FROM employee_salaries es
       JOIN employees e ON es.employee_id = e.id
       JOIN salary_structures ss ON es.salary_structure_id = ss.id
       WHERE es.tenant_id = $1`,
      [req.user!.tenantId]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

router.post('/employee-salaries', authMiddleware, requirePermission('payroll', 'create'), validate(employeeSalarySchema), async (req, res, next) => {
  try {
    const { employeeId, salaryStructureId, effectiveFrom } = req.body;
    const id = uuidv4();

    // Deactivate previous active salaries
    await pool.query(
      'UPDATE employee_salaries SET is_active = false WHERE tenant_id = $1 AND employee_id = $2',
      [req.user!.tenantId, employeeId]
    );

    const result = await pool.query(
      `INSERT INTO employee_salaries (id, tenant_id, employee_id, salary_structure_id, effective_from, is_active)
       VALUES ($1, $2, $3, $4, $5, true)
       RETURNING *`,
      [id, req.user!.tenantId, employeeId, salaryStructureId, effectiveFrom]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// Payroll Runs
router.get('/runs', authMiddleware, requirePermission('payroll', 'read'), async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM payroll_runs WHERE tenant_id = $1 ORDER BY billing_period DESC',
      [req.user!.tenantId]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

router.get('/runs/:id', authMiddleware, requirePermission('payroll', 'read'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const runRes = await pool.query(
      'SELECT * FROM payroll_runs WHERE id = $1 AND tenant_id = $2',
      [id, req.user!.tenantId]
    );

    if (runRes.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Payroll run not found' });
      return;
    }

    const payslipsRes = await pool.query(
      `SELECT p.*, e.first_name, e.last_name, e.employee_code, d.name as department_name
       FROM payslips p
       JOIN employees e ON p.employee_id = e.id
       LEFT JOIN departments d ON e.department_id = d.id
       WHERE p.payroll_run_id = $1 AND p.tenant_id = $2`,
      [id, req.user!.tenantId]
    );

    res.json({
      success: true,
      data: {
        run: runRes.rows[0],
        payslips: payslipsRes.rows,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Trigger Payroll Run (Queued with Inline Calculation fallback for instant results!)
router.post('/runs', authMiddleware, requirePermission('payroll', 'create'), validate(payrollRunSchema), async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { billingPeriod } = req.body;
    const tenantId = req.user!.tenantId;

    // Check if payroll already run for this period
    const existing = await client.query(
      'SELECT id FROM payroll_runs WHERE tenant_id = $1 AND billing_period = $2',
      [tenantId, billingPeriod]
    );
    if (existing.rows.length > 0) {
      res.status(409).json({ success: false, message: 'Payroll already run for this billing period' });
      client.release();
      return;
    }

    await client.query('BEGIN');

    const runId = uuidv4();
    
    // Get all active employees who have assigned salary structures
    const employeesRes = await client.query(
      `SELECT e.id as employee_id, e.first_name, e.last_name, ss.*
       FROM employees e
       JOIN employee_salaries es ON e.id = es.employee_id
       JOIN salary_structures ss ON es.salary_structure_id = ss.id
       WHERE e.tenant_id = $1 AND e.employment_status = 'active' AND es.is_active = true`,
      [tenantId]
    );

    if (employeesRes.rows.length === 0) {
      res.status(400).json({ success: false, message: 'No active employees found with active salary structures' });
      client.release();
      return;
    }

    let totalGrossPay = 0;
    let totalDeductions = 0;
    let totalNetPay = 0;

    const payslips: any[] = [];

    // Calculate payslips immediately
    for (const emp of employeesRes.rows) {
      const basic = Number(emp.basic_salary);
      const houseRent = Number(emp.house_rent_allowance || 0);
      const medical = Number(emp.medical_allowance || 0);
      const transport = Number(emp.transport_allowance || 0);
      const utilities = Number(emp.utilities_allowance || 0);
      const other = Number(emp.other_allowances || 0);

      const grossPay = basic + houseRent + medical + transport + utilities + other;
      
      // Compliance deductions (Pakistan)
      let eobi = 0;
      if (emp.eobi_applicable) {
        // Employee EOBI deduction: 1% of min wage (min wage PKR 32,000 for Sindh/Punjab, 1% is 320 PKR)
        eobi = 320; 
      }

      let pf = 0;
      if (emp.provident_fund_applicable) {
        // Employee PF deduction (8.33% of basic)
        pf = Math.round(basic * (Number(emp.provident_fund_rate) / 100));
      }

      // Simple Pakistan tax slab FY 2024-25 monthly calculation (rough approximation for demo)
      // Up to 50k PKR/month (600k/year) -> tax free
      // 50k-100k -> 2.5% of amount exceeding 50k
      let tax = 0;
      if (grossPay > 50000) {
        tax = Math.round((grossPay - 50000) * 0.05);
      }

      const totalDeduction = eobi + pf + tax;
      const netPay = grossPay - totalDeduction;

      totalGrossPay += grossPay;
      totalDeductions += totalDeduction;
      totalNetPay += netPay;

      const payslipId = uuidv4();
      
      // Save payslip
      await client.query(
        `INSERT INTO payslips (id, tenant_id, payroll_run_id, employee_id, basic_salary, gross_salary, deductions, net_salary, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')`,
        [payslipId, tenantId, runId, emp.employee_id, basic, grossPay, totalDeduction, netPay]
      );

      // Line items
      const items = [
        { name: 'Basic Salary', amount: basic, type: 'earning' },
        { name: 'House Rent Allowance', amount: houseRent, type: 'earning' },
        { name: 'Medical Allowance', amount: medical, type: 'earning' },
        { name: 'Transport Allowance', amount: transport, type: 'earning' },
        { name: 'EOBI (Employee)', amount: eobi, type: 'deduction' },
        { name: 'Provident Fund (Employee)', amount: pf, type: 'deduction' },
        { name: 'Income Tax', amount: tax, type: 'deduction' },
      ];

      for (const item of items) {
        if (item.amount > 0) {
          await client.query(
            `INSERT INTO payslip_line_items (id, tenant_id, payslip_id, name, amount, type)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [uuidv4(), tenantId, payslipId, item.name, item.amount, item.type]
          );
        }
      }
    }

    // Insert payroll run record
    const runResult = await client.query(
      `INSERT INTO payroll_runs (id, tenant_id, billing_period, total_gross_pay, total_deductions, total_net_pay, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'calculated')
       RETURNING *`,
      [runId, tenantId, billingPeriod, totalGrossPay, totalDeductions, totalNetPay]
    );

    await client.query('COMMIT');
    res.status(201).json({ success: true, data: runResult.rows[0], message: 'Payroll run generated successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

// Approve Payroll Run
router.patch('/runs/:id/approve', authMiddleware, requirePermission('payroll', 'approve'), async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    await client.query('BEGIN');

    const run = await client.query(
      'SELECT id, status FROM payroll_runs WHERE id = $1 AND tenant_id = $2',
      [id, req.user!.tenantId]
    );

    if (run.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Payroll run not found' });
      client.release();
      return;
    }

    if (run.rows[0].status !== 'calculated') {
      res.status(400).json({ success: false, message: 'Only calculated payroll runs can be approved' });
      client.release();
      return;
    }

    await client.query(
      `UPDATE payroll_runs SET status = 'approved', updated_at = NOW() WHERE id = $1`,
      [id]
    );

    await client.query(
      `UPDATE payslips SET status = 'paid', updated_at = NOW() WHERE payroll_run_id = $1`,
      [id]
    );

    await client.query('COMMIT');
    res.json({ success: true, message: 'Payroll run approved and payslips released' });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

// Individual Payslip View
router.get('/payslips/:id', authMiddleware, requirePermission('payroll', 'read'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const payslip = await pool.query(
      `SELECT p.*, 
              e.first_name, e.last_name, e.employee_code,
              d.name as department_name, des.name as designation_name
       FROM payslips p
       JOIN employees e ON p.employee_id = e.id
       LEFT JOIN departments d ON e.department_id = d.id
       LEFT JOIN designations des ON e.designation_id = des.id
       WHERE p.id = $1 AND p.tenant_id = $2`,
      [id, req.user!.tenantId]
    );

    if (payslip.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Payslip not found' });
      return;
    }

    const lineItems = await pool.query(
      'SELECT * FROM payslip_line_items WHERE payslip_id = $1 ORDER BY type DESC, name ASC',
      [id]
    );

    res.json({
      success: true,
      data: {
        payslip: payslip.rows[0],
        lineItems: lineItems.rows,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
