import { pool } from '../config/database.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

async function seed() {
  console.log('🌱 Seeding database...');

  const tenantId = uuidv4();
  const adminUserId = uuidv4();

  try {
    // ── 1. Create default tenant ──
    await pool.query(`
      INSERT INTO tenants (id, name, slug, tier, settings, compliance_config)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (slug) DO NOTHING
    `, [
      tenantId,
      'Demo Company Pvt Ltd',
      'demo',
      1,
      JSON.stringify({
        timezone: 'Asia/Karachi',
        dateFormat: 'DD/MM/YYYY',
        currency: 'PKR',
        currencySymbol: 'Rs.',
        weekStartDay: 1,
        fiscalYearStartMonth: 7,
        workingDaysPerWeek: 6,
        defaultLanguage: 'en',
      }),
      JSON.stringify({ country: 'PK', packVersion: '1.0' }),
    ]);

    // ── 2. Create admin user ──
    const passwordHash = await bcrypt.hash('Admin@123456', 12);
    await pool.query(`
      INSERT INTO users (id, tenant_id, email, password_hash, role, is_active)
      VALUES ($1, $2, $3, $4, $5, true)
      ON CONFLICT (tenant_id, email) DO NOTHING
    `, [adminUserId, tenantId, 'admin@hrms.app', passwordHash, 'tenant_admin']);

    // ── 3. Create departments ──
    const depts = [
      { name: 'Executive Management', code: 'EXEC' },
      { name: 'Human Resources', code: 'HR' },
      { name: 'Finance & Accounts', code: 'FIN' },
      { name: 'Information Technology', code: 'IT' },
      { name: 'Marketing', code: 'MKT' },
      { name: 'Operations', code: 'OPS' },
      { name: 'Sales', code: 'SALES' },
    ];

    const deptIds: Record<string, string> = {};
    for (const dept of depts) {
      const id = uuidv4();
      deptIds[dept.code] = id;
      await pool.query(`
        INSERT INTO departments (id, tenant_id, name, code, is_active)
        VALUES ($1, $2, $3, $4, true)
        ON CONFLICT (tenant_id, code) DO NOTHING
      `, [id, tenantId, dept.name, dept.code]);
    }

    // ── 4. Create designations ──
    const designations = [
      { name: 'Chief Executive Officer', code: 'CEO', grade: 1 },
      { name: 'Director', code: 'DIR', grade: 2 },
      { name: 'Senior Manager', code: 'SM', grade: 3 },
      { name: 'Manager', code: 'MGR', grade: 4 },
      { name: 'Team Lead', code: 'TL', grade: 5 },
      { name: 'Senior Executive', code: 'SE', grade: 6 },
      { name: 'Executive', code: 'EXE', grade: 7 },
      { name: 'Junior Executive', code: 'JE', grade: 8 },
      { name: 'Intern', code: 'INT', grade: 9 },
    ];

    const desigIds: Record<string, string> = {};
    for (const d of designations) {
      const id = uuidv4();
      desigIds[d.code] = id;
      await pool.query(`
        INSERT INTO designations (id, tenant_id, name, code, grade, is_active)
        VALUES ($1, $2, $3, $4, $5, true)
        ON CONFLICT (tenant_id, code) DO NOTHING
      `, [id, tenantId, d.name, d.code, d.grade]);
    }

    // ── 5. Create sample employees ──
    const employees = [
      { code: 'EMP001', first: 'Ahmed', last: 'Khan', email: 'ahmed.khan@demo.com', dept: 'EXEC', desig: 'CEO', type: 'full_time', joined: '2020-01-15', gender: 'male' },
      { code: 'EMP002', first: 'Fatima', last: 'Rizvi', email: 'fatima.rizvi@demo.com', dept: 'HR', desig: 'SM', type: 'full_time', joined: '2021-03-01', gender: 'female' },
      { code: 'EMP003', first: 'Muhammad', last: 'Ali', email: 'muhammad.ali@demo.com', dept: 'IT', desig: 'TL', type: 'full_time', joined: '2021-06-15', gender: 'male' },
      { code: 'EMP004', first: 'Ayesha', last: 'Siddiqui', email: 'ayesha.s@demo.com', dept: 'FIN', desig: 'MGR', type: 'full_time', joined: '2020-09-01', gender: 'female' },
      { code: 'EMP005', first: 'Hassan', last: 'Malik', email: 'hassan.malik@demo.com', dept: 'IT', desig: 'SE', type: 'full_time', joined: '2022-01-10', gender: 'male' },
      { code: 'EMP006', first: 'Zainab', last: 'Noor', email: 'zainab.n@demo.com', dept: 'MKT', desig: 'EXE', type: 'full_time', joined: '2022-04-15', gender: 'female' },
      { code: 'EMP007', first: 'Usman', last: 'Raza', email: 'usman.raza@demo.com', dept: 'SALES', desig: 'MGR', type: 'full_time', joined: '2021-08-01', gender: 'male' },
      { code: 'EMP008', first: 'Sana', last: 'Ahmed', email: 'sana.ahmed@demo.com', dept: 'OPS', desig: 'SE', type: 'full_time', joined: '2023-02-01', gender: 'female' },
      { code: 'EMP009', first: 'Bilal', last: 'Hussain', email: 'bilal.h@demo.com', dept: 'IT', desig: 'EXE', type: 'full_time', joined: '2023-06-01', gender: 'male' },
      { code: 'EMP010', first: 'Mariam', last: 'Sheikh', email: 'mariam.s@demo.com', dept: 'HR', desig: 'JE', type: 'contract', joined: '2024-01-15', gender: 'female' },
    ];

    for (const emp of employees) {
      await pool.query(`
        INSERT INTO employees (id, tenant_id, employee_code, first_name, last_name, email, department_id, designation_id, employment_type, employment_status, date_of_joining, gender)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'active', $10, $11)
        ON CONFLICT (tenant_id, employee_code) DO NOTHING
      `, [uuidv4(), tenantId, emp.code, emp.first, emp.last, emp.email, deptIds[emp.dept], desigIds[emp.desig], emp.type, emp.joined, emp.gender]);
    }

    // ── 6. Create attendance policy ──
    await pool.query(`
      INSERT INTO attendance_policies (id, tenant_id, name, shift_start_time, shift_end_time, grace_minutes, overtime_after_hours, overtime_rate_multiplier, is_default)
      VALUES ($1, $2, 'Standard Shift', '09:00', '18:00', 15, 9, 1.5, true)
    `, [uuidv4(), tenantId]);

    // ── 7. Create leave types (Pakistan defaults) ──
    const leaveTypes = [
      { name: 'Annual Leave', code: 'AL', days: 14, carry: true, maxCarry: 7, paid: true, encashable: true },
      { name: 'Casual Leave', code: 'CL', days: 10, carry: false, maxCarry: 0, paid: true, encashable: false },
      { name: 'Sick Leave', code: 'SL', days: 8, carry: false, maxCarry: 0, paid: true, encashable: false },
      { name: 'Maternity Leave', code: 'ML', days: 90, carry: false, maxCarry: 0, paid: true, encashable: false, gender: 'female' },
      { name: 'Paternity Leave', code: 'PL', days: 7, carry: false, maxCarry: 0, paid: true, encashable: false, gender: 'male' },
      { name: 'Unpaid Leave', code: 'UL', days: 30, carry: false, maxCarry: 0, paid: false, encashable: false },
    ];

    for (const lt of leaveTypes) {
      await pool.query(`
        INSERT INTO leave_types (id, tenant_id, name, code, default_days, is_carry_forward, max_carry_forward_days, is_paid, is_encashable, applicable_gender, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true)
        ON CONFLICT (tenant_id, code) DO NOTHING
      `, [uuidv4(), tenantId, lt.name, lt.code, lt.days, lt.carry, lt.maxCarry, lt.paid, lt.encashable, (lt as any).gender || null]);
    }

    // ── 8. Create salary structure (Pakistan standard) ──
    const ssId = uuidv4();
    await pool.query(`
      INSERT INTO salary_structures (id, tenant_id, name, code, is_active)
      VALUES ($1, $2, 'Standard Pakistan', 'PKR_STD', true)
      ON CONFLICT (tenant_id, code) DO NOTHING
    `, [ssId, tenantId]);

    const components = [
      { name: 'Basic Salary', code: 'BASIC', type: 'earning', calc: 'fixed', pct: null, taxable: true, statutory: false, order: 1 },
      { name: 'House Rent Allowance', code: 'HRA', type: 'earning', calc: 'percentage_of_basic', pct: 45, taxable: true, statutory: false, order: 2 },
      { name: 'Medical Allowance', code: 'MED', type: 'earning', calc: 'percentage_of_basic', pct: 10, taxable: false, statutory: false, order: 3 },
      { name: 'Transport Allowance', code: 'TRANS', type: 'earning', calc: 'fixed', pct: null, taxable: false, statutory: false, order: 4 },
      { name: 'Utilities Allowance', code: 'UTIL', type: 'earning', calc: 'percentage_of_basic', pct: 10, taxable: true, statutory: false, order: 5 },
      { name: 'EOBI (Employee)', code: 'EOBI_EMP', type: 'deduction', calc: 'percentage_of_basic', pct: 1, taxable: false, statutory: true, order: 10, statCode: 'EOBI' },
      { name: 'EOBI (Employer)', code: 'EOBI_ER', type: 'employer_contribution', calc: 'percentage_of_basic', pct: 5, taxable: false, statutory: true, order: 11, statCode: 'EOBI' },
      { name: 'Provident Fund (Employee)', code: 'PF_EMP', type: 'deduction', calc: 'percentage_of_basic', pct: 6, taxable: false, statutory: false, order: 12, statCode: 'PF' },
      { name: 'Provident Fund (Employer)', code: 'PF_ER', type: 'employer_contribution', calc: 'percentage_of_basic', pct: 6, taxable: false, statutory: false, order: 13, statCode: 'PF' },
      { name: 'Income Tax', code: 'TAX', type: 'deduction', calc: 'fixed', pct: null, taxable: false, statutory: true, order: 20, statCode: 'TAX' },
    ];

    for (const c of components) {
      await pool.query(`
        INSERT INTO salary_components (id, tenant_id, salary_structure_id, name, code, type, calculation_type, percentage, is_taxable, is_statutory, statutory_code, sort_order)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `, [uuidv4(), tenantId, ssId, c.name, c.code, c.type, c.calc, c.pct, c.taxable, c.statutory, (c as any).statCode || null, c.order]);
    }

    // ── 9. Pakistan Compliance Config ──
    await pool.query(`
      INSERT INTO compliance_configs (id, country, country_name, config, version)
      VALUES ($1, 'PK', 'Pakistan', $2, '1.0')
      ON CONFLICT (country, version) DO NOTHING
    `, [uuidv4(), JSON.stringify({
      currency: 'PKR',
      currencySymbol: 'Rs.',
      fiscalYearStartMonth: 7,
      dateFormat: 'DD/MM/YYYY',
      workingHoursPerDay: 9,
      workingDaysPerWeek: 6,
      probationPeriodMonths: 3,
      noticePeriodDays: 30,
      taxSlabs: [
        { minIncome: 0, maxIncome: 600000, rate: 0, fixedAmount: 0, description: 'Up to Rs. 600,000 — Nil' },
        { minIncome: 600001, maxIncome: 1200000, rate: 2.5, fixedAmount: 0, description: 'Rs. 600,001 to Rs. 1,200,000 — 2.5% of amount exceeding Rs. 600,000' },
        { minIncome: 1200001, maxIncome: 2400000, rate: 12.5, fixedAmount: 15000, description: 'Rs. 1,200,001 to Rs. 2,400,000 — Rs. 15,000 + 12.5%' },
        { minIncome: 2400001, maxIncome: 3600000, rate: 22.5, fixedAmount: 165000, description: 'Rs. 2,400,001 to Rs. 3,600,000 — Rs. 165,000 + 22.5%' },
        { minIncome: 3600001, maxIncome: 6000000, rate: 27.5, fixedAmount: 435000, description: 'Rs. 3,600,001 to Rs. 6,000,000 — Rs. 435,000 + 27.5%' },
        { minIncome: 6000001, maxIncome: null, rate: 35, fixedAmount: 1095000, description: 'Exceeding Rs. 6,000,000 — Rs. 1,095,000 + 35%' },
      ],
      statutoryDeductions: [
        { code: 'EOBI', name: 'Employees Old-Age Benefits Institution', type: 'both', employeeRate: 1, employerRate: 5, minSalaryThreshold: 8000 },
        { code: 'PESSI', name: 'Punjab Employees Social Security', type: 'employer', employerRate: 6, minSalaryThreshold: 22000 },
      ],
      holidays: [
        { name: 'Kashmir Day', date: '02-05', isRecurring: true },
        { name: 'Pakistan Day', date: '03-23', isRecurring: true },
        { name: 'Labour Day', date: '05-01', isRecurring: true },
        { name: 'Independence Day', date: '08-14', isRecurring: true },
        { name: 'Iqbal Day', date: '11-09', isRecurring: true },
        { name: 'Quaid-e-Azam Day', date: '12-25', isRecurring: true },
      ],
      requiredComplianceFields: [
        { key: 'cnic', label: 'CNIC Number', type: 'text', isRequired: true },
        { key: 'eobi_number', label: 'EOBI Number', type: 'text', isRequired: false },
        { key: 'pf_number', label: 'Provident Fund Number', type: 'text', isRequired: false },
        { key: 'ntn', label: 'National Tax Number (NTN)', type: 'text', isRequired: false },
      ],
    })]);

    // ── 10. Default onboarding checklist ──
    await pool.query(`
      INSERT INTO onboarding_checklists (id, tenant_id, name, description, is_default, tasks)
      VALUES ($1, $2, 'Standard Onboarding', 'Default checklist for new joiners', true, $3)
    `, [uuidv4(), tenantId, JSON.stringify([
      { id: uuidv4(), title: 'Submit CNIC & passport copies', assigneeRole: 'employee', daysFromJoining: 1, isMandatory: true, sortOrder: 1 },
      { id: uuidv4(), title: 'Complete bank account form', assigneeRole: 'employee', daysFromJoining: 1, isMandatory: true, sortOrder: 2 },
      { id: uuidv4(), title: 'Setup workstation & email', assigneeRole: 'hr_officer', daysFromJoining: 0, isMandatory: true, sortOrder: 3 },
      { id: uuidv4(), title: 'Issue employee ID card', assigneeRole: 'hr_officer', daysFromJoining: 3, isMandatory: true, sortOrder: 4 },
      { id: uuidv4(), title: 'Orientation session', assigneeRole: 'hr_manager', daysFromJoining: 1, isMandatory: true, sortOrder: 5 },
      { id: uuidv4(), title: 'Assign mentor/buddy', assigneeRole: 'manager', daysFromJoining: 1, isMandatory: false, sortOrder: 6 },
      { id: uuidv4(), title: 'Complete safety training', assigneeRole: 'employee', daysFromJoining: 7, isMandatory: true, sortOrder: 7 },
      { id: uuidv4(), title: 'Review company policies', assigneeRole: 'employee', daysFromJoining: 3, isMandatory: true, sortOrder: 8 },
      { id: uuidv4(), title: 'Probation goals meeting', assigneeRole: 'manager', daysFromJoining: 7, isMandatory: true, sortOrder: 9 },
    ])]);

    // ── 11. Letter templates ──
    const letterTemplates = [
      {
        name: 'Offer Letter', code: 'OFFER', category: 'offer',
        subject: 'Offer of Employment — {{companyName}}',
        body: `<h2>Offer of Employment</h2>
<p>Dear {{employeeName}},</p>
<p>We are pleased to offer you the position of <strong>{{designation}}</strong> in the <strong>{{department}}</strong> department at {{companyName}}.</p>
<p><strong>Date of Joining:</strong> {{dateOfJoining}}</p>
<p><strong>Compensation:</strong> {{grossSalary}} per month</p>
<p>This offer is contingent upon successful completion of background verification and submission of required documents.</p>
<p>Please confirm your acceptance by signing and returning this letter.</p>
<p>Warm regards,<br/>{{companyName}} HR</p>`,
      },
      {
        name: 'Experience Certificate', code: 'EXP_CERT', category: 'experience',
        subject: 'Experience Certificate — {{employeeName}}',
        body: `<h2>Experience Certificate</h2>
<p><strong>To Whom It May Concern</strong></p>
<p>This is to certify that <strong>{{employeeName}}</strong> (Employee Code: {{employeeCode}}) was employed with {{companyName}} from <strong>{{dateOfJoining}}</strong> to <strong>{{dateOfLeaving}}</strong> as <strong>{{designation}}</strong> in the {{department}} department.</p>
<p>During their tenure, they demonstrated professionalism and dedication. We wish them success in future endeavors.</p>
<p>This certificate is issued upon request for whatever purpose it may serve.</p>
<p>Regards,<br/>HR Department<br/>{{companyName}}</p>`,
      },
    ];

    for (const lt of letterTemplates) {
      await pool.query(`
        INSERT INTO letter_templates (id, tenant_id, name, code, category, subject, body, variables, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
        ON CONFLICT (tenant_id, code) DO NOTHING
      `, [uuidv4(), tenantId, lt.name, lt.code, lt.category, lt.subject, lt.body, JSON.stringify([
        { key: 'employeeName', label: 'Employee Name', source: 'employee' },
        { key: 'employeeCode', label: 'Employee Code', source: 'employee' },
        { key: 'designation', label: 'Designation', source: 'employee' },
        { key: 'department', label: 'Department', source: 'employee' },
        { key: 'dateOfJoining', label: 'Date of Joining', source: 'employee' },
        { key: 'dateOfLeaving', label: 'Date of Leaving', source: 'employee' },
        { key: 'grossSalary', label: 'Gross Salary', source: 'employee' },
        { key: 'companyName', label: 'Company Name', source: 'company' },
      ])]);
    }

    console.log('✅ Database seeded successfully');
    console.log(`   Tenant: Demo Company Pvt Ltd (slug: demo)`);
    console.log(`   Admin: admin@hrms.app / Admin@123456`);
    console.log(`   Employees: ${employees.length} sample employees created`);

  } catch (err) {
    console.error('❌ Seed failed:', err);
    throw err;
  } finally {
    await pool.end();
  }
}

seed().catch(() => process.exit(1));
