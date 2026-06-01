import { Router } from 'express';
import { pool } from '../../config/database.js';
import { authMiddleware } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/rbac.js';
import { z } from 'zod';
import { validate } from '../../middleware/validate.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

const templateSchema = z.object({
  name: z.string().min(1),
  subject: z.string().min(1),
  content: z.string().min(1),
});

const generateLetterSchema = z.object({
  templateId: z.string().uuid(),
  employeeId: z.string().uuid(),
  variables: z.record(z.string()).default({}),
});

// Templates CRUD
router.get('/templates', authMiddleware, requirePermission('letters', 'read'), async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM letter_templates WHERE tenant_id = $1 ORDER BY name ASC',
      [req.user!.tenantId]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

router.post('/templates', authMiddleware, requirePermission('letters', 'create'), validate(templateSchema), async (req, res, next) => {
  try {
    const { name, subject, content } = req.body;
    const id = uuidv4();
    const result = await pool.query(
      `INSERT INTO letter_templates (id, tenant_id, name, subject, content)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [id, req.user!.tenantId, name, subject, content]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// GET /api/letters/generated - Get list of generated letters
router.get('/generated', authMiddleware, requirePermission('letters', 'read'), async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT gl.*, 
              e.first_name, e.last_name, e.employee_code,
              lt.name as template_name
       FROM generated_letters gl
       JOIN employees e ON gl.employee_id = e.id
       JOIN letter_templates lt ON gl.template_id = lt.id
       WHERE gl.tenant_id = $1
       ORDER BY gl.created_at DESC`,
      [req.user!.tenantId]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

// POST /api/letters/generate - Generate letter
router.post('/generate', authMiddleware, requirePermission('letters', 'create'), validate(generateLetterSchema), async (req, res, next) => {
  try {
    const { templateId, employeeId, variables } = req.body;
    const tenantId = req.user!.tenantId;

    // Get template details
    const templateRes = await pool.query(
      'SELECT * FROM letter_templates WHERE id = $1 AND tenant_id = $2',
      [templateId, tenantId]
    );

    if (templateRes.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Template not found' });
      return;
    }

    // Get employee details
    const employeeRes = await pool.query(
      'SELECT first_name, last_name, employee_code FROM employees WHERE id = $1 AND tenant_id = $2',
      [employeeId, tenantId]
    );

    if (employeeRes.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Employee not found' });
      return;
    }

    const employee = employeeRes.rows[0];
    const template = templateRes.rows[0];

    // Standard system variables
    const sysVars: Record<string, string> = {
      employeeName: `${employee.first_name} ${employee.last_name}`,
      employeeCode: employee.employee_code,
      currentDate: new Date().toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' }),
      ...variables,
    };

    // Replace placeholders: {{key}}
    let body = template.content;
    let subject = template.subject;

    Object.entries(sysVars).forEach(([key, val]) => {
      body = body.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'g'), val);
      subject = subject.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'g'), val);
    });

    const id = uuidv4();
    const result = await pool.query(
      `INSERT INTO generated_letters (id, tenant_id, template_id, employee_id, subject, content, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'generated')
       RETURNING *`,
      [id, tenantId, templateId, employeeId, subject, body]
    );

    res.status(201).json({ success: true, data: result.rows[0], message: 'Letter generated successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
