-- =============================================
-- HRMS Complete Database Schema
-- Multi-tenant with RLS, AES-256 encrypted PII,
-- GDPR-compliant audit logs, UTC timestamps
-- =============================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── TENANTS ───
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    tier SMALLINT NOT NULL DEFAULT 1 CHECK (tier BETWEEN 1 AND 3),
    feature_flags JSONB DEFAULT '{}',
    compliance_config JSONB DEFAULT '{}',
    branding JSONB DEFAULT '{}',
    settings JSONB DEFAULT '{
      "timezone": "Asia/Karachi",
      "dateFormat": "DD/MM/YYYY",
      "currency": "PKR",
      "currencySymbol": "Rs.",
      "weekStartDay": 1,
      "fiscalYearStartMonth": 7,
      "workingDaysPerWeek": 6,
      "defaultLanguage": "en"
    }',
    subscription_status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── DEPARTMENTS ───
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    parent_id UUID REFERENCES departments(id),
    head_id UUID,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, code)
);

-- ─── DESIGNATIONS ───
CREATE TABLE IF NOT EXISTS designations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    grade INTEGER,
    department_id UUID REFERENCES departments(id),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, code)
);

-- ─── EMPLOYEES ───
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    employee_code VARCHAR(50) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(30),
    date_of_birth DATE,
    gender VARCHAR(20),
    marital_status VARCHAR(20),
    profile_photo_url TEXT,
    -- Encrypted PII fields (AES-256-GCM, stored as base64 text)
    national_id_encrypted TEXT,
    passport_number_encrypted TEXT,
    bank_account_encrypted TEXT,
    bank_name VARCHAR(100),
    iban_encrypted TEXT,
    -- Employment
    department_id UUID REFERENCES departments(id),
    designation_id UUID REFERENCES designations(id),
    reporting_manager_id UUID REFERENCES employees(id),
    employment_type VARCHAR(30) DEFAULT 'full_time',
    employment_status VARCHAR(30) DEFAULT 'active',
    date_of_joining DATE NOT NULL,
    date_of_leaving DATE,
    probation_end_date DATE,
    -- Address
    address_street TEXT,
    address_city VARCHAR(100),
    address_state VARCHAR(100),
    address_postal_code VARCHAR(20),
    address_country VARCHAR(100),
    -- Emergency Contact
    emergency_contact_name VARCHAR(200),
    emergency_contact_relationship VARCHAR(100),
    emergency_contact_phone VARCHAR(30),
    -- Compliance
    compliance_fields JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, employee_code)
);

-- ─── USERS ───
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'employee',
    employee_id UUID REFERENCES employees(id),
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMPTZ,
    refresh_token TEXT,
    password_reset_token TEXT,
    password_reset_expires TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, email)
);

-- ─── ATTENDANCE POLICIES ───
CREATE TABLE IF NOT EXISTS attendance_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    shift_start_time TIME NOT NULL DEFAULT '09:00',
    shift_end_time TIME NOT NULL DEFAULT '18:00',
    grace_minutes INTEGER DEFAULT 15,
    half_day_threshold_hours NUMERIC(4,2) DEFAULT 4,
    overtime_after_hours NUMERIC(4,2) DEFAULT 9,
    overtime_rate_multiplier NUMERIC(4,2) DEFAULT 1.5,
    late_penalty_per_incident NUMERIC(10,2) DEFAULT 0,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ATTENDANCE RECORDS ───
CREATE TABLE IF NOT EXISTS attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    check_in TIMESTAMPTZ,
    check_out TIMESTAMPTZ,
    source VARCHAR(20) DEFAULT 'manual',
    status VARCHAR(20) DEFAULT 'present',
    working_hours NUMERIC(5,2),
    overtime_hours NUMERIC(5,2) DEFAULT 0,
    late_minutes INTEGER DEFAULT 0,
    early_leave_minutes INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, employee_id, date)
);

-- ─── LEAVE TYPES ───
CREATE TABLE IF NOT EXISTS leave_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(30) NOT NULL,
    default_days INTEGER NOT NULL,
    is_carry_forward BOOLEAN DEFAULT false,
    max_carry_forward_days INTEGER DEFAULT 0,
    is_paid BOOLEAN DEFAULT true,
    is_encashable BOOLEAN DEFAULT false,
    applicable_gender VARCHAR(20),
    requires_approval BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, code)
);

-- ─── LEAVE BALANCES ───
CREATE TABLE IF NOT EXISTS leave_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_type_id UUID NOT NULL REFERENCES leave_types(id),
    year INTEGER NOT NULL,
    total_days NUMERIC(5,1) NOT NULL,
    used_days NUMERIC(5,1) DEFAULT 0,
    pending_days NUMERIC(5,1) DEFAULT 0,
    carried_forward_days NUMERIC(5,1) DEFAULT 0,
    UNIQUE(tenant_id, employee_id, leave_type_id, year)
);

-- ─── LEAVE REQUESTS ───
CREATE TABLE IF NOT EXISTS leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_type_id UUID NOT NULL REFERENCES leave_types(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days NUMERIC(5,1) NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    approved_by_id UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── SALARY STRUCTURES ───
CREATE TABLE IF NOT EXISTS salary_structures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, code)
);

-- ─── SALARY COMPONENTS ───
CREATE TABLE IF NOT EXISTS salary_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    salary_structure_id UUID NOT NULL REFERENCES salary_structures(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    type VARCHAR(30) NOT NULL, -- earning, deduction, employer_contribution
    calculation_type VARCHAR(30) NOT NULL, -- fixed, percentage_of_basic, percentage_of_gross
    amount NUMERIC(12,2),
    percentage NUMERIC(6,3),
    is_taxable BOOLEAN DEFAULT true,
    is_statutory BOOLEAN DEFAULT false,
    statutory_code VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0
);

-- ─── EMPLOYEE SALARIES ───
CREATE TABLE IF NOT EXISTS employee_salaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    salary_structure_id UUID NOT NULL REFERENCES salary_structures(id),
    basic_salary NUMERIC(12,2) NOT NULL,
    gross_salary NUMERIC(12,2) NOT NULL,
    net_salary NUMERIC(12,2) NOT NULL,
    components JSONB DEFAULT '[]',
    effective_from DATE NOT NULL,
    effective_to DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── PAYROLL RUNS ───
CREATE TABLE IF NOT EXISTS payroll_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'draft',
    total_employees INTEGER DEFAULT 0,
    total_gross NUMERIC(14,2) DEFAULT 0,
    total_deductions NUMERIC(14,2) DEFAULT 0,
    total_net NUMERIC(14,2) DEFAULT 0,
    total_employer_cost NUMERIC(14,2) DEFAULT 0,
    processed_by_id UUID REFERENCES users(id),
    approved_by_id UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, month, year)
);

-- ─── PAYSLIPS ───
CREATE TABLE IF NOT EXISTS payslips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    payroll_run_id UUID NOT NULL REFERENCES payroll_runs(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id),
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    basic_salary NUMERIC(12,2) NOT NULL,
    earnings JSONB DEFAULT '[]',
    deductions JSONB DEFAULT '[]',
    employer_contributions JSONB DEFAULT '[]',
    total_earnings NUMERIC(12,2) DEFAULT 0,
    total_deductions NUMERIC(12,2) DEFAULT 0,
    gross_salary NUMERIC(12,2) DEFAULT 0,
    net_salary NUMERIC(12,2) DEFAULT 0,
    total_employer_cost NUMERIC(12,2) DEFAULT 0,
    working_days INTEGER DEFAULT 0,
    present_days INTEGER DEFAULT 0,
    leave_days INTEGER DEFAULT 0,
    overtime_hours NUMERIC(6,2) DEFAULT 0,
    overtime_amount NUMERIC(12,2) DEFAULT 0,
    loan_deduction NUMERIC(12,2) DEFAULT 0,
    late_penalty NUMERIC(12,2) DEFAULT 0,
    tax_amount NUMERIC(12,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'generated',
    pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ONBOARDING CHECKLISTS ───
CREATE TABLE IF NOT EXISTS onboarding_checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    tasks JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ONBOARDING INSTANCES ───
CREATE TABLE IF NOT EXISTS onboarding_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    checklist_id UUID NOT NULL REFERENCES onboarding_checklists(id),
    tasks JSONB DEFAULT '[]',
    completed_count INTEGER DEFAULT 0,
    total_count INTEGER DEFAULT 0,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── LETTER TEMPLATES ───
CREATE TABLE IF NOT EXISTS letter_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    variables JSONB DEFAULT '[]',
    header_html TEXT,
    footer_html TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, code)
);

-- ─── GENERATED LETTERS ───
CREATE TABLE IF NOT EXISTS generated_letters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES letter_templates(id),
    employee_id UUID NOT NULL REFERENCES employees(id),
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    pdf_url TEXT,
    generated_by_id UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── LOANS ───
CREATE TABLE IF NOT EXISTS loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    loan_type VARCHAR(30) NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    interest_rate NUMERIC(5,3) DEFAULT 0,
    total_repayable NUMERIC(12,2) NOT NULL,
    installments INTEGER NOT NULL,
    monthly_deduction NUMERIC(12,2) NOT NULL,
    paid_amount NUMERIC(12,2) DEFAULT 0,
    remaining_amount NUMERIC(12,2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    reason TEXT,
    approved_by_id UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── LOAN INSTALLMENTS ───
CREATE TABLE IF NOT EXISTS loan_installments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    installment_number INTEGER NOT NULL,
    due_date DATE NOT NULL,
    principal_amount NUMERIC(12,2) NOT NULL,
    interest_amount NUMERIC(12,2) DEFAULT 0,
    total_amount NUMERIC(12,2) NOT NULL,
    paid_amount NUMERIC(12,2) DEFAULT 0,
    is_paid BOOLEAN DEFAULT false,
    paid_at TIMESTAMPTZ,
    payroll_run_id UUID REFERENCES payroll_runs(id)
);

-- ─── DOCUMENTS ───
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    file_key TEXT NOT NULL,
    file_type VARCHAR(100),
    file_size INTEGER,
    category VARCHAR(50) DEFAULT 'general',
    uploaded_by_id UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── COMPLIANCE CONFIGS ───
CREATE TABLE IF NOT EXISTS compliance_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country VARCHAR(10) NOT NULL,
    country_name VARCHAR(100) NOT NULL,
    config JSONB NOT NULL,
    version VARCHAR(20) DEFAULT '1.0',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(country, version)
);

-- ─── NOTIFICATIONS ───
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    type VARCHAR(50) DEFAULT 'info',
    is_read BOOLEAN DEFAULT false,
    link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── AUDIT LOGS (Append-Only) ───
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    tenant_id UUID,
    anonymization_token UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID,
    action VARCHAR(100) NOT NULL,
    module VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prevent DELETE/UPDATE on audit_logs
CREATE OR REPLACE FUNCTION prevent_audit_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit logs are append-only and cannot be modified or deleted';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_audit_update ON audit_logs;
CREATE TRIGGER prevent_audit_update BEFORE UPDATE ON audit_logs
    FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification();

DROP TRIGGER IF EXISTS prevent_audit_delete ON audit_logs;
CREATE TRIGGER prevent_audit_delete BEFORE DELETE ON audit_logs
    FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification();

-- ─── ROW LEVEL SECURITY ───
-- Enable RLS on all tenant-scoped tables
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN
        SELECT unnest(ARRAY[
            'departments', 'designations', 'employees', 'users',
            'attendance_policies', 'attendance_records',
            'leave_types', 'leave_balances', 'leave_requests',
            'salary_structures', 'salary_components', 'employee_salaries',
            'payroll_runs', 'payslips',
            'onboarding_checklists', 'onboarding_instances',
            'letter_templates', 'generated_letters',
            'loans', 'loan_installments',
            'documents', 'notifications'
        ])
    LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
        EXECUTE format('DROP POLICY IF EXISTS tenant_isolation ON %I', tbl);
        EXECUTE format(
            'CREATE POLICY tenant_isolation ON %I USING (tenant_id::text = current_setting(''app.current_tenant'', true))',
            tbl
        );
        -- Allow the DB owner to bypass RLS
        EXECUTE format(
            'CREATE POLICY owner_bypass ON %I FOR ALL TO hrms_admin USING (true)',
            tbl
        );
    END LOOP;
END $$;

-- ─── INDEXES ───
CREATE INDEX IF NOT EXISTS idx_employees_tenant ON employees(tenant_id);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(tenant_id, department_id);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(tenant_id, employment_status);
CREATE INDEX IF NOT EXISTS idx_attendance_employee_date ON attendance_records(tenant_id, employee_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance_records(tenant_id, date);
CREATE INDEX IF NOT EXISTS idx_leave_requests_employee ON leave_requests(tenant_id, employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_payslips_run ON payslips(payroll_run_id);
CREATE INDEX IF NOT EXISTS idx_payslips_employee ON payslips(tenant_id, employee_id);
CREATE INDEX IF NOT EXISTS idx_loans_employee ON loans(tenant_id, employee_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(tenant_id, user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant ON audit_logs(tenant_id, created_at);

-- ─── AUTO-UPDATE TIMESTAMP TRIGGER ───
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN
        SELECT unnest(ARRAY[
            'tenants', 'departments', 'designations', 'employees', 'users',
            'attendance_policies', 'attendance_records',
            'leave_types', 'leave_requests',
            'salary_structures', 'employee_salaries',
            'payroll_runs', 'onboarding_checklists',
            'letter_templates', 'loans', 'compliance_configs'
        ])
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS update_%s_timestamp ON %I', tbl, tbl);
        EXECUTE format(
            'CREATE TRIGGER update_%s_timestamp BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at()',
            tbl, tbl
        );
    END LOOP;
END $$;
