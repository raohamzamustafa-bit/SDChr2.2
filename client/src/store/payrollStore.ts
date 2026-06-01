/* ================================================================
   SDC HR Solutions — Payroll & Statutory Benefits Store
   Handles salary calculation, FBR/FTA statutory structures, preview/finalize cycles, and WPS outputs.
   ================================================================ */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SalaryStructure, EmployeeSalary, PayrollRun, Payslip, TaxSlab, Loan, PayrollAdjustment } from '../types';
import { createTenantStorage, utcNow } from '../lib/storage';
import { decrypt, encrypt } from '../lib/encryption';
import { useAuditStore } from './auditStore';
import { useAuthStore } from './authStore';
import { useTenantStore } from './tenantStore';
import { useEmployeeStore } from './employeeStore';

interface PayrollState {
  salaryStructures: SalaryStructure[];
  employeeSalaries: Record<string, EmployeeSalary>; // employeeId -> assigned salary
  taxSlabs: TaxSlab[];
  payrollRuns: PayrollRun[];
  loans: Loan[];
  adjustments: PayrollAdjustment[];

  // Actions
  addSalaryStructure: (name: string, components: SalaryStructure['components']) => void;
  assignEmployeeSalary: (employeeId: string, employeeName: string, structureId: string, basicPay: number) => void;
  updateTaxSlabs: (slabs: TaxSlab[]) => void;
  
  // Payroll Actions
  runPayrollCalculation: (month: string) => { success: boolean; payrollRun: PayrollRun };
  finalizePayrollRun: (runId: string) => void;
  reversePayrollRun: (runId: string, reason: string) => void;
  exportWPS: (runId: string) => string; // CSV string
  
  // Loan Actions
  applyForLoan: (employeeId: string, employeeName: string, type: string, principal: number, installments: number) => void;
  approveLoanStep: (loanId: string, level: 'manager' | 'hr' | 'admin', action: 'approve' | 'reject') => void;
  prepayLoan: (loanId: string, amount: number) => void;

  // Adjustments
  addAdjustment: (employeeId: string, employeeName: string, type: PayrollAdjustment['type'], amount: number, month: string, reason: string) => void;
}

export const usePayrollStore = create<PayrollState>()(
  persist(
    (set, get) => ({
      salaryStructures: [
        {
          id: "struct_standard",
          tenant_id: "tenant_sdc",
          name: "Standard Executive Package",
          components: [
            { id: "c_house", name: "House Rent Allowance", type: "earning", calculation: "percentage", value: 40, base_component_id: "basic" },
            { id: "c_med", name: "Medical Allowance", type: "earning", calculation: "percentage", value: 10, base_component_id: "basic" },
            { id: "c_util", name: "Utility Support", type: "earning", calculation: "fixed", value: 5000 }
          ],
          created_at: new Date().toISOString()
        }
      ],
      employeeSalaries: {
        "emp_imran": { id: "sal_imran", employee_id: "emp_imran", employee_name: "Imran Khan", structure_id: "struct_standard", basic_pay: 180000, effective_from: "2026-01-01" }
      },
      taxSlabs: [
        { id: "tax_pk_1", tenant_id: "tenant_sdc", min_income: 0, max_income: 50000, rate: 0, fixed_amount: 0 },
        { id: "tax_pk_2", tenant_id: "tenant_sdc", min_income: 50000, max_income: 100000, rate: 0.05, fixed_amount: 0 },
        { id: "tax_pk_3", tenant_id: "tenant_sdc", min_income: 100000, max_income: 99999999, rate: 0.125, fixed_amount: 2500 }
      ],
      payrollRuns: [],
      loans: [],
      adjustments: [],

      addSalaryStructure: (name, components) => {
        const user = useAuthStore.getState().user;
        const newStruct: SalaryStructure = {
          id: `struct_${Math.random().toString(36).substring(2, 9)}`,
          tenant_id: user?.tenant_id || "tenant_sdc",
          name,
          components,
          created_at: utcNow()
        };

        set((state) => ({ salaryStructures: [...state.salaryStructures, newStruct] }));
      },

      assignEmployeeSalary: (employeeId, employeeName, structureId, basicPay) => {
        const user = useAuthStore.getState().user;
        const newSal: EmployeeSalary = {
          id: `sal_${Math.random().toString(36).substring(2, 9)}`,
          employee_id: employeeId,
          employee_name: employeeName,
          structure_id: structureId,
          basic_pay: basicPay,
          effective_from: utcNow().split('T')[0]
        };

        set((state) => ({
          employeeSalaries: {
            ...state.employeeSalaries,
            [employeeId]: newSal
          }
        }));

        // Dynamically encrypt salary in the main employee registry to keep consistency!
        useEmployeeStore.getState().updateEmployee(employeeId, {
          salary_encrypted: encrypt(basicPay.toString())
        });
      },

      updateTaxSlabs: (slabs) => {
        set({ taxSlabs: slabs });
      },

      runPayrollCalculation: (month) => {
        const user = useAuthStore.getState().user;
        const activePack = useTenantStore.getState().compliance_config.pack;
        const activeEmployees = useEmployeeStore.getState().employees.filter(e => e.status === 'active');
        const assignedSalaries = get().employeeSalaries;
        const structures = get().salaryStructures;
        const taxBrackets = get().taxSlabs;
        const activeLoans = get().loans.filter(l => l.status === 'approved' && l.remaining_balance > 0);
        const activeAdjustments = get().adjustments.filter(adj => adj.month === month);

        const payslips: Payslip[] = [];
        let totalGross = 0;
        let totalDeductions = 0;
        let totalNet = 0;

        activeEmployees.forEach((emp) => {
          const salRecord = assignedSalaries[emp.id];
          if (!salRecord) return; // Skip if no salary assignment

          const basic = salRecord.basic_pay;
          const struct = structures.find(s => s.id === salRecord.structure_id);

          const earningsLineItems = [{ name: "Basic Salary", amount: basic }];
          const deductionsLineItems: any[] = [];

          let allowanceSum = 0;
          if (struct) {
            struct.components.forEach((c) => {
              if (c.type === 'earning') {
                const amt = c.calculation === 'percentage' ? basic * (c.value / 100) : c.value;
                earningsLineItems.push({ name: c.name, amount: amt });
                allowanceSum += amt;
              } else {
                const amt = c.calculation === 'percentage' ? basic * (c.value / 100) : c.value;
                deductionsLineItems.push({ name: c.name, amount: amt });
              }
            });
          }

          const gross = basic + allowanceSum;

          // Statutory Contributions from loaded Compliance Config
          activePack.statutory_contributions.forEach((sc) => {
            if (sc.employee_rate > 0) {
              const base = sc.ceiling && gross > sc.ceiling ? sc.ceiling : gross;
              const contributionAmt = Math.round(base * sc.employee_rate);
              deductionsLineItems.push({ name: sc.name, amount: contributionAmt });
            }
          });

          // Income Tax Calculation based on configured tax brackets
          let calculatedTax = 0;
          const matchedSlab = taxBrackets.find(slab => gross >= slab.min_income && gross <= slab.max_income);
          if (matchedSlab) {
            calculatedTax = Math.round(matchedSlab.fixed_amount + (gross - matchedSlab.min_income) * matchedSlab.rate);
            if (calculatedTax > 0) {
              deductionsLineItems.push({ name: "Income Tax Deducted", amount: calculatedTax });
            }
          }

          // Active Loan Installments
          const empLoan = activeLoans.find(l => l.employee_id === emp.id);
          if (empLoan) {
            const deductionAmt = Math.min(empLoan.monthly_installment, empLoan.remaining_balance);
            deductionsLineItems.push({ name: `Loan Recovery (${empLoan.type})`, amount: deductionAmt });
          }

          // Bonuses and Fines
          const empAdjustments = activeAdjustments.filter(a => a.employee_id === emp.id);
          empAdjustments.forEach((adj) => {
            if (adj.type === 'bonus' || adj.type === 'kpi_bonus') {
              earningsLineItems.push({ name: `Adjustment: ${adj.reason}`, amount: adj.amount });
            } else {
              deductionsLineItems.push({ name: `Deduction: ${adj.reason}`, amount: adj.amount });
            }
          });

          const totalEarnings = earningsLineItems.reduce((acc, c) => acc + c.amount, 0);
          const totalDeds = deductionsLineItems.reduce((acc, c) => acc + c.amount, 0);
          const net = totalEarnings - totalDeds;

          payslips.push({
            id: `ps_${Math.random().toString(36).substring(2, 9)}`,
            employee_id: emp.id,
            employee_name: `${emp.first_name} ${emp.last_name}`,
            month,
            basic_pay: basic,
            earnings: earningsLineItems,
            deductions: deductionsLineItems,
            gross: totalEarnings,
            total_deductions: totalDeds,
            net_pay: net
          });

          totalGross += totalEarnings;
          totalDeductions += totalDeds;
          totalNet += net;
        });

        const newRun: PayrollRun = {
          id: `run_${Math.random().toString(36).substring(2, 9)}`,
          tenant_id: user?.tenant_id || "tenant_sdc",
          month,
          status: 'draft',
          total_gross: totalGross,
          total_deductions: totalDeductions,
          total_net: totalNet,
          payslips,
          created_at: utcNow()
        };

        return { success: true, payrollRun: newRun };
      },

      finalizePayrollRun: (runId) => {
        const user = useAuthStore.getState().user;
        const currentRun = get().payrollRuns.find(r => r.id === runId);

        set((state) => ({
          payrollRuns: state.payrollRuns.map(r => {
            if (r.id === runId) {
              // Automatically apply loan deductions and increment paid installments
              const activeLoans = state.loans;
              const payslips = r.payslips;

              const nextLoans = activeLoans.map(loan => {
                const payslip = payslips.find(p => p.employee_id === loan.employee_id);
                if (payslip) {
                  const loanDeduction = payslip.deductions.find(d => d.name.startsWith('Loan Recovery'));
                  if (loanDeduction) {
                    const amtPaid = loanDeduction.amount;
                    return {
                      ...loan,
                      paid_installments: loan.paid_installments + 1,
                      remaining_balance: loan.remaining_balance - amtPaid,
                      status: loan.remaining_balance - amtPaid <= 0 ? 'completed' as const : loan.status
                    };
                  }
                }
                return loan;
              });

              return {
                ...r,
                status: 'finalized' as const,
                finalized_at: utcNow()
              };
            }
            return r;
          })
        }));

        useAuditStore.getState().addLog({
          user_id: user?.id || "unknown",
          user_name: user?.name || "System",
          action: "finalize_payroll_run",
          entity: "payroll_run",
          entity_id: runId,
          new_value: "finalized",
          ip_address: "127.0.0.1"
        });
      },

      reversePayrollRun: (runId, reason) => {
        const user = useAuthStore.getState().user;
        set((state) => ({
          payrollRuns: state.payrollRuns.map(r => r.id === runId ? {
            ...r,
            status: 'reversed' as const,
            reversed_at: utcNow(),
            reversal_reason: reason
          } : r)
        }));

        useAuditStore.getState().addLog({
          user_id: user?.id || "unknown",
          user_name: user?.name || "System",
          action: "reverse_payroll_run",
          entity: "payroll_run",
          entity_id: runId,
          old_value: "finalized",
          new_value: "reversed",
          ip_address: "127.0.0.1"
        });
      },

      exportWPS: (runId) => {
        const run = get().payrollRuns.find(r => r.id === runId);
        if (!run) return "";

        const headers = ["Employee ID", "Employee Name", "Basic Pay", "Gross Earnings", "Total Deductions", "Net Pay", "Currency"];
        const rows = run.payslips.map(p => [
          p.employee_id,
          p.employee_name,
          p.basic_pay,
          p.gross,
          p.total_deductions,
          p.net_pay,
          "PKR"
        ]);

        const content = [headers, ...rows]
          .map(e => e.join(","))
          .join("\n");
        return content;
      },

      applyForLoan: (employeeId, employeeName, type, principal, installments) => {
        const user = useAuthStore.getState().user;
        const newLoan: Loan = {
          id: `loan_${Math.random().toString(36).substring(2, 9)}`,
          tenant_id: user?.tenant_id || "tenant_sdc",
          employee_id: employeeId,
          employee_name: employeeName,
          type,
          principal,
          monthly_installment: Math.round(principal / installments),
          total_installments: installments,
          paid_installments: 0,
          remaining_balance: principal,
          status: 'pending_manager',
          approval_chain: [
            { level: 'manager', status: 'pending' },
            { level: 'hr', status: 'pending' },
            { level: 'admin', status: 'pending' }
          ],
          created_at: utcNow()
        };

        set((state) => ({ loans: [...state.loans, newLoan] }));
      },

      approveLoanStep: (loanId, level, action) => {
        const user = useAuthStore.getState().user;
        const targetLoan = get().loans.find(l => l.id === loanId);
        if (!targetLoan) return;

        set((state) => {
          const nextChain = targetLoan.approval_chain.map(step => {
            if (step.level === level) {
              return {
                ...step,
                status: action === 'approve' ? 'approved' as const : 'rejected' as const,
                approver_name: user?.name || "System",
                timestamp: utcNow()
              };
            }
            return step;
          });

          let nextStatus = targetLoan.status;
          if (action === 'reject') {
            nextStatus = 'rejected';
          } else {
            if (level === 'manager') nextStatus = 'pending_hr';
            else if (level === 'hr') nextStatus = 'pending_admin';
            else if (level === 'admin') nextStatus = 'approved';
          }

          return {
            loans: state.loans.map(l => l.id === loanId ? {
              ...l,
              status: nextStatus,
              approval_chain: nextChain
            } : l)
          };
        });
      },

      prepayLoan: (loanId, amount) => {
        const user = useAuthStore.getState().user;
        set((state) => ({
          loans: state.loans.map(l => {
            if (l.id === loanId) {
              const nextBalance = Math.max(0, l.remaining_balance - amount);
              const nextStatus = nextBalance === 0 ? 'completed' as const : l.status;
              const nextInstallments = Math.ceil(nextBalance / l.monthly_installment);

              useAuditStore.getState().addLog({
                user_id: user?.id || "unknown",
                user_name: user?.name || "System",
                action: "prepay_loan_installment",
                entity: "loan",
                entity_id: loanId,
                old_value: `bal: ${l.remaining_balance}`,
                new_value: `bal: ${nextBalance}, prepaid: ${amount}`,
                ip_address: "127.0.0.1"
              });

              return {
                ...l,
                remaining_balance: nextBalance,
                status: nextStatus,
                total_installments: l.paid_installments + nextInstallments
              };
            }
            return l;
          })
        }));
      },

      addAdjustment: (employeeId, employeeName, type, amount, month, reason) => {
        const user = useAuthStore.getState().user;
        const newAdj: PayrollAdjustment = {
          id: `adj_${Math.random().toString(36).substring(2, 9)}`,
          tenant_id: user?.tenant_id || "tenant_sdc",
          employee_id: employeeId,
          employee_name: employeeName,
          type,
          amount,
          month,
          reason,
          created_at: utcNow()
        };

        set((state) => ({ adjustments: [newAdj, ...state.adjustments] }));
      }
    }),
    {
      name: 'sdc_hrms_payroll',
      storage: createTenantStorage('payroll')
    }
  )
);
