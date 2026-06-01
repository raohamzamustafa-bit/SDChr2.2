import { Router } from 'express';
import { pool, withTenant } from '../../config/database.js';
import { authMiddleware } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/rbac.js';
import { encryptIfPresent, decryptIfPresent } from '../../config/encryption.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
router.use(authMiddleware);

// GET /api/employees — list with pagination, filtering, search
router.get('/', requirePermission('employees', 'read'), async (req, res, next) => {
  try {
    const { page = '1', limit = '20', search, departmentId, status, type } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const tenantId = req.tenantId!;

    let whereClause = 'WHERE e.tenant_id = $1';
    const params: unknown[] = [tenantId];
    let paramIdx = 2;

    if (search) {
      whereClause += ` AND (e.first_name ILIKE $${paramIdx} OR e.last_name ILIKE $${paramIdx} OR e.employee_code ILIKE $${paramIdx} OR e.email ILIKE $${paramIdx})`;
      params.push(`%${search}%`);
      paramIdx++;
    }
    if (departmentId) {
      whereClause += ` AND e.department_id = $${paramIdx}`;
      params.push(departmentId);
      paramIdx++;
    }
    if (status) {
      whereClause += ` AND e.employment_status = $${paramIdx}`;
      params.push(status);
      paramIdx++;
    }
    if (type) {
      whereClause += ` AND e.employment_type = $${paramIdx}`;
      params.push(type);
      paramIdx++;
    }

    const countResult = await pool.query(`SELECT COUNT(*) FROM employees e ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(`
      SELECT e.*, d.name as department_name, des.name as designation_name,
             mgr.first_name || ' ' || mgr.last_name as reporting_manager_name
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN designations des ON e.designation_id = des.id
      LEFT JOIN employees mgr ON e.reporting_manager_id = mgr.id
      ${whereClause}
      ORDER BY e.created_at DESC
      LIMIT $${paramIdx} OFFSET $${paramIdx + 1}
    `, [...params, Number(limit), offset]);

    const employees = result.rows.map(row => ({
      id: row.id,
      tenantId: row.tenant_id,
      employeeCode: row.employee_code,
      firstName: row.first_name,
      lastName: row.last_name,
      fullName: `${row.first_name} ${row.last_name}`,
      email: row.email,
      phone: row.phone,
      dateOfBirth: row.date_of_birth,
      gender: row.gender,
      maritalStatus: row.marital_status,
      profilePhotoUrl: row.profile_photo_url,
      departmentId: row.department_id,
      departmentName: row.department_name,
      designationId: row.designation_id,
      designationName: row.designation_name,
      reportingManagerId: row.reporting_manager_id,
      reportingManagerName: row.reporting_manager_name,
      employmentType: row.employment_type,
      employmentStatus: row.employment_status,
      dateOfJoining: row.date_of_joining,
      dateOfLeaving: row.date_of_leaving,
      complianceFields: row.compliance_fields || {},
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    const totalPages = Math.ceil(total / Number(limit));
    res.json({
      success: true,
      data: employees,
      meta: {
        total, page: Number(page), limit: Number(limit),
        totalPages, hasNext: Number(page) < totalPages, hasPrev: Number(page) > 1,
      },
    });
  } catch (err) { next(err); }
});

// GET /api/employees/:id
router.get('/:id', requirePermission('employees', 'read'), async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT e.*, d.name as department_name, des.name as designation_name,
             mgr.first_name || ' ' || mgr.last_name as reporting_manager_name
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN designations des ON e.designation_id = des.id
      LEFT JOIN employees mgr ON e.reporting_manager_id = mgr.id
      WHERE e.id = $1 AND e.tenant_id = $2
    `, [req.params.id, req.tenantId]);

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Employee not found' });
      return;
    }

    const row = result.rows[0];
    res.json({
      success: true,
      data: {
        id: row.id,
        tenantId: row.tenant_id,
        employeeCode: row.employee_code,
        firstName: row.first_name,
        lastName: row.last_name,
        fullName: `${row.first_name} ${row.last_name}`,
        email: row.email,
        phone: row.phone,
        dateOfBirth: row.date_of_birth,
        gender: row.gender,
        maritalStatus: row.marital_status,
        profilePhotoUrl: row.profile_photo_url,
        nationalId: decryptIfPresent(row.national_id_encrypted),
        passportNumber: decryptIfPresent(row.passport_number_encrypted),
        bankAccount: decryptIfPresent(row.bank_account_encrypted),
        bankName: row.bank_name,
        iban: decryptIfPresent(row.iban_encrypted),
        departmentId: row.department_id,
        departmentName: row.department_name,
        designationId: row.designation_id,
        designationName: row.designation_name,
        reportingManagerId: row.reporting_manager_id,
        reportingManagerName: row.reporting_manager_name,
        employmentType: row.employment_type,
        employmentStatus: row.employment_status,
        dateOfJoining: row.date_of_joining,
        dateOfLeaving: row.date_of_leaving,
        probationEndDate: row.probation_end_date,
        address: {
          street: row.address_street,
          city: row.address_city,
          state: row.address_state,
          postalCode: row.address_postal_code,
          country: row.address_country,
        },
        emergencyContact: {
          name: row.emergency_contact_name,
          relationship: row.emergency_contact_relationship,
          phone: row.emergency_contact_phone,
        },
        complianceFields: row.compliance_fields || {},
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    });
  } catch (err) { next(err); }
});

// POST /api/employees
router.post('/', requirePermission('employees', 'create'), async (req, res, next) => {
  try {
    const {
      employeeCode, firstName, lastName, email, phone, dateOfBirth, gender, maritalStatus,
      departmentId, designationId, reportingManagerId, employmentType, dateOfJoining,
      probationEndDate, nationalId, passportNumber, bankAccount, bankName, iban,
      complianceFields,
    } = req.body;

    const result = await pool.query(`
      INSERT INTO employees (
        tenant_id, employee_code, first_name, last_name, email, phone, date_of_birth,
        gender, marital_status, department_id, designation_id, reporting_manager_id,
        employment_type, date_of_joining, probation_end_date,
        national_id_encrypted, passport_number_encrypted, bank_account_encrypted,
        bank_name, iban_encrypted, compliance_fields
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)
      RETURNING id
    `, [
      req.tenantId, employeeCode, firstName, lastName, email, phone, dateOfBirth,
      gender, maritalStatus, departmentId, designationId, reportingManagerId,
      employmentType || 'full_time', dateOfJoining, probationEndDate,
      encryptIfPresent(nationalId), encryptIfPresent(passportNumber),
      encryptIfPresent(bankAccount), bankName, encryptIfPresent(iban),
      JSON.stringify(complianceFields || {}),
    ]);

    res.status(201).json({
      success: true,
      data: { id: result.rows[0].id },
      message: 'Employee created successfully',
    });
  } catch (err: any) {
    if (err.code === '23505') {
      res.status(409).json({ success: false, message: 'Employee code already exists' });
      return;
    }
    next(err);
  }
});

// PATCH /api/employees/:id
router.patch('/:id', requirePermission('employees', 'update'), async (req, res, next) => {
  try {
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    const simpleFields: Record<string, string> = {
      firstName: 'first_name', lastName: 'last_name', email: 'email', phone: 'phone',
      dateOfBirth: 'date_of_birth', gender: 'gender', maritalStatus: 'marital_status',
      departmentId: 'department_id', designationId: 'designation_id',
      reportingManagerId: 'reporting_manager_id', employmentType: 'employment_type',
      employmentStatus: 'employment_status', dateOfJoining: 'date_of_joining',
      dateOfLeaving: 'date_of_leaving', probationEndDate: 'probation_end_date',
      bankName: 'bank_name', profilePhotoUrl: 'profile_photo_url',
    };

    for (const [key, col] of Object.entries(simpleFields)) {
      if (req.body[key] !== undefined) {
        fields.push(`${col} = $${idx}`);
        values.push(req.body[key]);
        idx++;
      }
    }

    // Encrypted fields
    const encryptedFields: Record<string, string> = {
      nationalId: 'national_id_encrypted', passportNumber: 'passport_number_encrypted',
      bankAccount: 'bank_account_encrypted', iban: 'iban_encrypted',
    };

    for (const [key, col] of Object.entries(encryptedFields)) {
      if (req.body[key] !== undefined) {
        fields.push(`${col} = $${idx}`);
        values.push(encryptIfPresent(req.body[key]));
        idx++;
      }
    }

    if (req.body.complianceFields) {
      fields.push(`compliance_fields = $${idx}`);
      values.push(JSON.stringify(req.body.complianceFields));
      idx++;
    }

    if (fields.length === 0) {
      res.status(400).json({ success: false, message: 'No fields to update' });
      return;
    }

    values.push(req.params.id, req.tenantId);
    await pool.query(
      `UPDATE employees SET ${fields.join(', ')} WHERE id = $${idx} AND tenant_id = $${idx + 1}`,
      values
    );

    res.json({ success: true, message: 'Employee updated successfully' });
  } catch (err) { next(err); }
});

// DELETE /api/employees/:id (soft delete)
router.delete('/:id', requirePermission('employees', 'delete'), async (req, res, next) => {
  try {
    await pool.query(
      `UPDATE employees SET employment_status = 'terminated', date_of_leaving = CURRENT_DATE WHERE id = $1 AND tenant_id = $2`,
      [req.params.id, req.tenantId]
    );
    res.json({ success: true, message: 'Employee terminated successfully' });
  } catch (err) { next(err); }
});

export default router;
