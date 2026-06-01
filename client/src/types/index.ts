/* ================================================================
   SDC HR Solutions — Shared Type Definitions
   All types used across stores, components, and pages.
   ================================================================ */

// ── Auth ──────────────────────────────────────────────────────────
export type UserRole = 'super_admin' | 'admin' | 'hr' | 'manager' | 'team_lead' | 'employee';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenant_id: string;
  avatar?: string;
  password_hash?: string;
}

export interface Session {
  id: string;
  device: string;
  browser: string;
  ip: string;
  created_at: string;
  last_active: string;
}

// ── Tenant ────────────────────────────────────────────────────────
export interface CompanyConfig {
  name: string;
  logo: string;
  address: string;
  timezone: string;
  currency: string;
  country: string;
}

export interface FeatureFlags {
  performance_appraisal: boolean;
  training_development: boolean;
  recruitment_pipeline: boolean;
  asset_management: boolean;
  offboarding_exit: boolean;
  employee_engagement: boolean;
  hr_analytics: boolean;
  expense_reimbursement: boolean;
  multi_tenant_saas: boolean;
  ai_talent_intelligence: boolean;
  [key: string]: boolean;
}

export interface QuietHours {
  enabled: boolean;
  start: string;
  end: string;
}

export type DigestMode = 'off' | 'daily' | 'weekly';

// ── Employee ──────────────────────────────────────────────────────
export type EmployeeStatus = 'active' | 'resigned' | 'terminated' | 'absconder';
export type EmploymentType = 'permanent' | 'contract' | 'probation' | 'intern';
export type Gender = 'male' | 'female' | 'other';
export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed';

export interface Employee {
  id: string;
  tenant_id: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: Gender;
  marital_status: MaritalStatus;
  national_id_encrypted: string;
  passport_encrypted: string;
  bank_account_encrypted: string;
  tax_id_encrypted: string;
  department_id: string;
  designation_id: string;
  branch_id: string;
  date_of_joining: string;
  probation_end_date: string;
  contract_end_date?: string;
  employment_type: EmploymentType;
  status: EmployeeStatus;
  rehire_eligible: boolean;
  salary_encrypted: string;
  photo?: string;
  emergency_contacts: EmergencyContact[];
  documents: EmployeeDocument[];
  created_at: string;
  updated_at: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface EmployeeDocument {
  id: string;
  name: string;
  type: string;
  expiry_date?: string;
  file_data?: string;
  uploaded_at: string;
}

export interface ChangeRequest {
  id: string;
  employee_id: string;
  employee_name: string;
  field: string;
  old_value: string;
  new_value: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
}

// ── Department / Designation / Branch ─────────────────────────────
export interface Department {
  id: string;
  tenant_id: string;
  name: string;
  head_id?: string;
  created_at: string;
}

export interface Designation {
  id: string;
  tenant_id: string;
  title: string;
  grade: string;
  band: string;
  created_at: string;
}

export interface Branch {
  id: string;
  tenant_id: string;
  name: string;
  location: string;
  created_at: string;
}

// ── Attendance ────────────────────────────────────────────────────
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'half_day' | 'on_leave' | 'holiday';

export interface AttendanceRecord {
  id: string;
  tenant_id: string;
  employee_id: string;
  date: string;
  clock_in?: string;
  clock_out?: string;
  status: AttendanceStatus;
  overtime_hours: number;
  notes?: string;
  created_at: string;
}

export interface ShiftConfig {
  id: string;
  tenant_id: string;
  name: string;
  start_time: string;
  end_time: string;
  grace_minutes: number;
}

export interface EmployeeShiftAssignment {
  employee_id: string;
  shift_id: string;
}

export interface CorrectionRequest {
  id: string;
  employee_id: string;
  employee_name: string;
  date: string;
  field: string;
  old_value: string;
  new_value: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
}

export interface LatePenaltyRule {
  id: string;
  threshold_minutes: number;
  deduction_amount: number;
  deduction_type: 'fixed' | 'percentage';
}

// ── Leave ─────────────────────────────────────────────────────────
export interface LeaveType {
  id: string;
  tenant_id: string;
  name: string;
  annual_quota: number;
  carry_forward_max: number;
  probation_accrual: boolean;
  color: string;
}

export interface LeaveBalance {
  id: string;
  employee_id: string;
  leave_type_id: string;
  leave_type_name: string;
  total: number;
  used: number;
  remaining: number;
  carried_forward: number;
  audit_log: LeaveBalanceAuditEntry[];
}

export interface LeaveBalanceAuditEntry {
  timestamp: string;
  action: string;
  change: number;
  balance_after: number;
  reason: string;
}

export type LeaveApprovalStatus = 'pending_tl' | 'pending_manager' | 'pending_director' | 'pending_hr' | 'approved' | 'rejected' | 'cancelled';

export interface LeaveRequest {
  id: string;
  tenant_id: string;
  employee_id: string;
  employee_name: string;
  leave_type_id: string;
  leave_type_name: string;
  start_date: string;
  end_date: string;
  half_day: boolean;
  half_day_period?: 'am' | 'pm';
  days: number;
  reason: string;
  status: LeaveApprovalStatus;
  approval_chain: ApprovalStep[];
  override_reason?: string;
  created_at: string;
}

export interface ApprovalStep {
  level: 'team_lead' | 'manager' | 'director' | 'hr';
  approver_name?: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp?: string;
  comment?: string;
}

// ── Payroll ───────────────────────────────────────────────────────
export interface SalaryStructure {
  id: string;
  tenant_id: string;
  name: string;
  components: SalaryComponent[];
  created_at: string;
}

export interface SalaryComponent {
  id: string;
  name: string;
  type: 'earning' | 'deduction';
  calculation: 'fixed' | 'percentage';
  value: number;
  base_component_id?: string;
}

export interface EmployeeSalary {
  id: string;
  employee_id: string;
  employee_name: string;
  structure_id: string;
  basic_pay: number;
  effective_from: string;
}

export type PayrollRunStatus = 'draft' | 'preview' | 'finalized' | 'reversed';

export interface PayrollRun {
  id: string;
  tenant_id: string;
  month: string;
  status: PayrollRunStatus;
  total_gross: number;
  total_deductions: number;
  total_net: number;
  payslips: Payslip[];
  created_at: string;
  finalized_at?: string;
  reversed_at?: string;
  reversal_reason?: string;
}

export interface Payslip {
  id: string;
  employee_id: string;
  employee_name: string;
  month: string;
  basic_pay: number;
  earnings: PayslipLineItem[];
  deductions: PayslipLineItem[];
  gross: number;
  total_deductions: number;
  net_pay: number;
}

export interface PayslipLineItem {
  name: string;
  amount: number;
}

export interface TaxSlab {
  id: string;
  tenant_id: string;
  min_income: number;
  max_income: number;
  rate: number;
  fixed_amount: number;
}

export type LoanStatus = 'pending_manager' | 'pending_hr' | 'pending_admin' | 'approved' | 'rejected' | 'completed';

export interface Loan {
  id: string;
  tenant_id: string;
  employee_id: string;
  employee_name: string;
  type: string;
  principal: number;
  monthly_installment: number;
  total_installments: number;
  paid_installments: number;
  remaining_balance: number;
  status: LoanStatus;
  approval_chain: LoanApprovalStep[];
  created_at: string;
}

export interface LoanApprovalStep {
  level: 'manager' | 'hr' | 'admin';
  approver_name?: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp?: string;
}

export type AdjustmentType = 'bonus' | 'fine' | 'kpi_bonus' | 'kpi_deduction';

export interface PayrollAdjustment {
  id: string;
  tenant_id: string;
  employee_id: string;
  employee_name: string;
  type: AdjustmentType;
  amount: number;
  month: string;
  reason: string;
  created_at: string;
}

// ── Onboarding ────────────────────────────────────────────────────
export interface OnboardingChecklist {
  id: string;
  tenant_id: string;
  name: string;
  department_id?: string;
  designation_id?: string;
  tasks: OnboardingTask[];
  created_at: string;
}

export interface OnboardingTask {
  id: string;
  title: string;
  description: string;
  order: number;
}

export type EscalationLevel = 0 | 1 | 2 | 3;

export interface OnboardingAssignment {
  id: string;
  tenant_id: string;
  employee_id: string;
  employee_name: string;
  checklist_id: string;
  checklist_name: string;
  tasks: OnboardingTaskStatus[];
  assigned_at: string;
  due_date: string;
  escalation_level: EscalationLevel;
}

export interface OnboardingTaskStatus {
  task_id: string;
  title: string;
  completed: boolean;
  completed_at?: string;
}

// ── Letters ───────────────────────────────────────────────────────
export type LetterType = 'offer' | 'salary_revision' | 'warning' | 'bank_letter' | 'experience' | 'custom';

export interface LetterTemplate {
  id: string;
  tenant_id: string;
  name: string;
  type: LetterType;
  content: string;
  placeholders: string[];
  versions: LetterVersion[];
  created_at: string;
  updated_at: string;
}

export interface LetterVersion {
  id: string;
  content: string;
  created_at: string;
  created_by: string;
}

export interface GeneratedLetter {
  id: string;
  tenant_id: string;
  template_id: string;
  template_name: string;
  employee_id: string;
  employee_name: string;
  content: string;
  acknowledged: boolean;
  acknowledged_at?: string;
  generated_at: string;
  generated_by: string;
}

// ── Settlement ────────────────────────────────────────────────────
export type SeparationType = 'resigned' | 'terminated' | 'absconder';
export type SettlementStatus = 'processing' | 'pending_finance' | 'approved' | 'disbursed';

export interface Settlement {
  id: string;
  tenant_id: string;
  employee_id: string;
  employee_name: string;
  separation_type: SeparationType;
  separation_date: string;
  last_working_day: string;
  checklist: SettlementCheckItem[];
  benefits: SettlementBenefit[];
  total_payout: number;
  status: SettlementStatus;
  rehire_eligible: boolean;
  terminated_payout_percentage?: number;
  finance_approved_by?: string;
  finance_approved_at?: string;
  created_at: string;
}

export interface SettlementCheckItem {
  id: string;
  title: string;
  completed: boolean;
  completed_at?: string;
}

export interface SettlementBenefit {
  name: string;
  amount: number;
  type: 'earning' | 'deduction';
}

// ── Notifications ─────────────────────────────────────────────────
export type NotificationType =
  | 'birthday' | 'probation_end' | 'contract_expiry' | 'anniversary'
  | 'leave_low' | 'loan_recovery' | 'doc_expiry' | 'onboarding'
  | 'approval' | 'general';

export interface AppNotification {
  id: string;
  tenant_id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  action_url?: string;
  created_at: string;
}

// ── Audit ─────────────────────────────────────────────────────────
export interface AuditEntry {
  id: string;
  tenant_id?: string;
  timestamp: string;
  user_id: string;
  user_name: string;
  action: string;
  entity: string;
  entity_id: string;
  old_value?: string;
  new_value?: string;
  ip_address: string;
  anonymisation_token: string;
}

// ── Roles & Permissions ───────────────────────────────────────────
export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'approve';

export interface Permission {
  module: string;
  actions: PermissionAction[];
}

export interface CustomRole {
  id: string;
  tenant_id: string;
  name: string;
  permissions: Permission[];
  created_at: string;
}

// ── Compliance ────────────────────────────────────────────────────
export interface CompliancePack {
  country_code: string;
  country_name: string;
  currency: string;
  statutory_contributions: StatutoryContribution[];
  leave_minimums: { type: string; days: number }[];
  tax_filing_format: string;
  fiscal_year_start: string;
}

export interface StatutoryContribution {
  name: string;
  employer_rate: number;
  employee_rate: number;
  ceiling?: number;
  description: string;
}

// ── Utility ───────────────────────────────────────────────────────
export type SortDirection = 'asc' | 'desc';

export interface PaginationState {
  page: number;
  per_page: number;
  total: number;
}
