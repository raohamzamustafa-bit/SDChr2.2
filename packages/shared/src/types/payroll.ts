// ─── Payroll Types ───

export type PayrollRunStatus = 'draft' | 'processing' | 'review' | 'approved' | 'finalized' | 'paid';
export type PayslipStatus = 'generated' | 'reviewed' | 'approved' | 'dispatched';

export interface SalaryStructure {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  components: SalaryComponent[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SalaryComponent {
  id: string;
  name: string;
  code: string;
  type: 'earning' | 'deduction' | 'employer_contribution';
  calculationType: 'fixed' | 'percentage_of_basic' | 'percentage_of_gross';
  amount?: number;
  percentage?: number;
  isTaxable: boolean;
  isStatutory: boolean;
  statutoryCode?: string; // e.g. 'EOBI', 'PF', 'PESSI'
  isActive: boolean;
}

export interface EmployeeSalary {
  id: string;
  tenantId: string;
  employeeId: string;
  salaryStructureId: string;
  basicSalary: number;
  grossSalary: number;
  netSalary: number;
  components: EmployeeSalaryComponent[];
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
  createdAt: string;
}

export interface EmployeeSalaryComponent {
  componentId: string;
  name: string;
  code: string;
  type: 'earning' | 'deduction' | 'employer_contribution';
  amount: number;
}

export interface PayrollRun {
  id: string;
  tenantId: string;
  month: number;
  year: number;
  status: PayrollRunStatus;
  totalEmployees: number;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  totalEmployerCost: number;
  processedById?: string;
  processedByName?: string;
  approvedById?: string;
  approvedByName?: string;
  approvedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payslip {
  id: string;
  tenantId: string;
  payrollRunId: string;
  employeeId: string;
  employeeName?: string;
  employeeCode?: string;
  month: number;
  year: number;
  basicSalary: number;
  earnings: PayslipLineItem[];
  deductions: PayslipLineItem[];
  employerContributions: PayslipLineItem[];
  totalEarnings: number;
  totalDeductions: number;
  grossSalary: number;
  netSalary: number;
  totalEmployerCost: number;
  workingDays: number;
  presentDays: number;
  leaveDays: number;
  overtimeHours: number;
  overtimeAmount: number;
  loanDeduction: number;
  latePenalty: number;
  taxAmount: number;
  status: PayslipStatus;
  pdfUrl?: string;
  createdAt: string;
}

export interface PayslipLineItem {
  name: string;
  code: string;
  amount: number;
  isStatutory: boolean;
}

export interface CreatePayrollRunDto {
  month: number;
  year: number;
  notes?: string;
}

export interface PayrollSummary {
  month: number;
  year: number;
  totalEmployees: number;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  totalTax: number;
  totalEmployerContributions: number;
  departmentBreakdown: {
    departmentName: string;
    totalNet: number;
    employeeCount: number;
  }[];
}
