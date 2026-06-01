import { Router } from 'express';
import { pool } from '../../config/database.js';
import { authMiddleware } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/rbac.js';
import { z } from 'zod';
import { validate } from '../../middleware/validate.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

const checklistSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  tasks: z.array(z.object({
    title: z.string().min(1),
    description: z.string().optional(),
  })),
});

// GET /api/onboarding/templates - Get all checklists/templates
router.get('/templates', authMiddleware, requirePermission('onboarding', 'read'), async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM onboarding_checklists WHERE tenant_id = $1 ORDER BY name ASC',
      [req.user!.tenantId]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

// POST /api/onboarding/templates - Create checklist template
router.post('/templates', authMiddleware, requirePermission('onboarding', 'create'), validate(checklistSchema), async (req, res, next) => {
  try {
    const { name, description, tasks } = req.body;
    const id = uuidv4();

    const result = await pool.query(
      `INSERT INTO onboarding_checklists (id, tenant_id, name, description, tasks)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [id, req.user!.tenantId, name, description, JSON.stringify(tasks)]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// GET /api/onboarding/instances - Get assigned onboarding checklists
router.get('/instances', authMiddleware, requirePermission('onboarding', 'read'), async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT oi.*, 
              e.first_name, e.last_name, e.employee_code,
              c.name as checklist_name
       FROM onboarding_instances oi
       JOIN employees e ON oi.employee_id = e.id
       JOIN onboarding_checklists c ON oi.checklist_id = c.id
       WHERE oi.tenant_id = $1
       ORDER BY oi.created_at DESC`,
      [req.user!.tenantId]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

// POST /api/onboarding/assign/:employeeId - Assign checklist to employee
router.post('/assign/:employeeId', authMiddleware, requirePermission('onboarding', 'create'), async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { employeeId } = req.params;
    const { checklistId } = req.body;
    const tenantId = req.user!.tenantId;

    await client.query('BEGIN');

    // Get checklist tasks
    const checklistRes = await client.query(
      'SELECT tasks FROM onboarding_checklists WHERE id = $1 AND tenant_id = $2',
      [checklistId, tenantId]
    );

    if (checklistRes.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Checklist template not found' });
      client.release();
      return;
    }

    const templateTasks = checklistRes.rows[0].tasks || [];
    const parsedTasks = typeof templateTasks === 'string' ? JSON.parse(templateTasks) : templateTasks;

    const instanceId = uuidv4();
    await client.query(
      `INSERT INTO onboarding_instances (id, tenant_id, employee_id, checklist_id, status)
       VALUES ($1, $2, $3, $4, 'pending')`,
      [instanceId, tenantId, employeeId, checklistId]
    );

    // Insert task instances
    for (const task of parsedTasks) {
      const taskId = uuidv4();
      await client.query(
        `INSERT INTO onboarding_tasks (id, tenant_id, instance_id, title, description, status)
         VALUES ($1, $2, $3, $4, $5, 'pending')`,
        [taskId, tenantId, instanceId, task.title, task.description || '']
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ success: true, message: 'Checklist assigned successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

// GET /api/onboarding/tasks/:instanceId - List tasks for an instance
router.get('/tasks/:instanceId', authMiddleware, requirePermission('onboarding', 'read'), async (req, res, next) => {
  try {
    const { instanceId } = req.params;
    const result = await pool.query(
      'SELECT * FROM onboarding_tasks WHERE instance_id = $1 AND tenant_id = $2 ORDER BY created_at ASC',
      [instanceId, req.user!.tenantId]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/onboarding/tasks/:id - Update task status
router.patch('/tasks/:id', authMiddleware, requirePermission('onboarding', 'update'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'pending' | 'completed'

    const result = await pool.query(
      `UPDATE onboarding_tasks
       SET status = $1, completed_at = CASE WHEN $1 = 'completed' THEN NOW() ELSE NULL END, updated_at = NOW()
       WHERE id = $2 AND tenant_id = $3
       RETURNING *`,
      [status, id, req.user!.tenantId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Onboarding task not found' });
      return;
    }

    // Check if all tasks in the instance are completed
    const task = result.rows[0];
    const remainingRes = await pool.query(
      "SELECT count(*) FROM onboarding_tasks WHERE instance_id = $1 AND status != 'completed'",
      [task.instance_id]
    );

    if (Number(remainingRes.rows[0].count) === 0) {
      await pool.query(
        "UPDATE onboarding_instances SET status = 'completed', completed_at = NOW(), updated_at = NOW() WHERE id = $1",
        [task.instance_id]
      );
    } else {
      await pool.query(
        "UPDATE onboarding_instances SET status = 'in_progress', updated_at = NOW() WHERE id = $1",
        [task.instance_id]
      );
    }

    res.json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
});

export default router;
