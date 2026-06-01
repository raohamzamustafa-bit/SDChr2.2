// ─── Loan Types ───

export type LoanStatus = 'pending' | 'approved' | 'active' | 'completed' | 'rejected' | 'cancelled';
export type LoanType = 'salary_advance' | 'personal_loan' | 'emergency_loan' | 'other';

export interface Loan {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeName?: string;
  employeeCode?: string;
  loanType: LoanType;
  amount: number;
  interestRate: number;
  totalRepayable: number;
  installments: number;
  monthlyDeduction: number;
  paidAmount: number;
  remainingAmount: number;
  startDate: string;
  endDate: string;
  status: LoanStatus;
  reason?: string;
  approvedById?: string;
  approvedByName?: string;
  approvedAt?: string;
  schedule: LoanInstallment[];
  createdAt: string;
  updatedAt: string;
}

export interface LoanInstallment {
  id: string;
  loanId: string;
  installmentNumber: number;
  dueDate: string;
  principalAmount: number;
  interestAmount: number;
  totalAmount: number;
  paidAmount: number;
  isPaid: boolean;
  paidAt?: string;
  payrollRunId?: string;
}

export interface CreateLoanDto {
  employeeId: string;
  loanType: LoanType;
  amount: number;
  interestRate?: number;
  installments: number;
  startDate: string;
  reason?: string;
}
