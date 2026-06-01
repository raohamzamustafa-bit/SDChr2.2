import { Router } from 'express';
import { pool, withTenant } from '../../config/database.js';
import { authMiddleware } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/rbac.js';
import { z } from 'zod';
import { validate } from '../../middleware/validate.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

const departmentSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  parentDepartmentId: z.string().uuid().nullable().optional(),
  managerId: z.string().uuid().nullable().optional(),
});

const designationSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  departmentId: z.string().uuid(),
  grade: z.string().optional(),
});

// GET /api/departments/tree - Hierarchical tree view
router.get('/tree', authMiddleware, requirePermission('departments', 'read'), async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT d.*, 
              (SELECT COUNT(*) FROM employees e WHERE e.department_id = d.id AND e.employment_status = 'active') as active_employees
       FROM departments d
       WHERE d.tenant_id = $1
       ORDER BY d.name ASC`,
      [req.user!.tenantId]
    );

    const list = result.rows;
    const map = new Map<string, any>();
    const roots: any[] = [];

    // Initialize map
    list.forEach(dept => {
      map.set(dept.id, { ...dept, children: [] });
    });

    // Build hierarchy
    list.forEach(dept => {
      const node = map.get(dept.id);
      if (dept.parent_department_id && map.has(dept.parent_department_id)) {
        map.get(dept.parent_department_id).children.push(node);
      } else {
        roots.push(node);
      }
    });

    res.json({ success: true, data: roots });
  } catch (err) {
    next(err);
  }
});

// Departments CRUD
router.get('/', authMiddleware, requirePermission('departments', 'read'), async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT d.*, 
              p.name as parent_name,
              e.first_name as manager_first_name, e.last_name as manager_last_name
       FROM departments d
       LEFT JOIN departments p ON d.parent_department_id = p.id
       LEFT JOIN employees e ON d.manager_id = e.id
       WHERE d.tenant_id = $1
       ORDER BY d.name ASC`,
      [req.user!.tenantId]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

router.post('/', authMiddleware, requirePermission('departments', 'create'), validate(departmentSchema), async (req, res, next) => {
  try {
    const { name, code, parentDepartmentId, managerId } = req.body;
    const id = uuidv4();
    const result = await pool.query(
      `INSERT INTO departments (id, tenant_id, name, code, parent_department_id, manager_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [id, req.user!.tenantId, name, code, parentDepartmentId || null, managerId || null]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', authMiddleware, requirePermission('departments', 'update'), validate(departmentSchema.partial()), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, code, parentDepartmentId, managerId } = req.body;

    const current = await pool.query(
      'SELECT id FROM departments WHERE id = $1 AND tenant_id = $2',
      [id, req.user!.tenantId]
    );
    if (current.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Department not found' });
      return;
    }

    const result = await pool.query(
      `UPDATE departments 
       SET name = COALESCE($1, name), 
           code = COALESCE($2, code), 
           parent_department_id = COALESCE($3, parent_department_id),
           manager_id = COALESCE($4, manager_id),
           updated_at = NOW()
       WHERE id = $5 AND tenant_id = $6
       RETURNING *`,
      [name, code, parentDepartmentId, managerId, id, req.user!.tenantId]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authMiddleware, requirePermission('departments', 'delete'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const current = await pool.query(
      'SELECT id FROM departments WHERE id = $1 AND tenant_id = $2',
      [id, req.user!.tenantId]
    );
    if (current.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Department not found' });
      return;
    }

    await pool.query('DELETE FROM departments WHERE id = $1 AND tenant_id = $2', [id, req.user!.tenantId]);
    res.json({ success: true, message: 'Department deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// Designations CRUD
router.get('/designations', authMiddleware, requirePermission('departments', 'read'), async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT des.*, d.name as department_name 
       FROM designations des
       LEFT JOIN departments d ON des.department_id = d.id
       WHERE des.tenant_id = $1
       ORDER BY des.name ASC`,
      [req.user!.tenantId]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

router.post('/designations', authMiddleware, requirePermission('departments', 'create'), validate(designationSchema), async (req, res, next) => {
  try {
    const { name, code, departmentId, grade } = req.body;
    const id = uuidv4();
    const result = await pool.query(
      `INSERT INTO designations (id, tenant_id, name, code, department_id, grade)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [id, req.user!.tenantId, name, code, departmentId, grade || null]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

router.delete('/designations/:id', authMiddleware, requirePermission('departments', 'delete'), async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM designations WHERE id = $1 AND tenant_id = $2', [id, req.user!.tenantId]);
    res.json({ success: true, message: 'Designation deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
