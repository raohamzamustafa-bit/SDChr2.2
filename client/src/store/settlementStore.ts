/* ================================================================
   SDC HR Solutions — Exit Settlement Store
   Enforces separation workflows (Resigned, Terminated, Absconder) and benefit formulas.
   ================================================================ */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Settlement, SeparationType, SettlementStatus, SettlementBenefit } from '../types';
import { createTenantStorage, utcNow } from '../lib/storage';
import { useAuditStore } from './auditStore';
import { useAuthStore } from './authStore';
import { useEmployeeStore } from './employeeStore';

interface SettlementState {
  settlements: Settlement[];

  // Actions
  calculateAndInitiateSettlement: (employeeId: string, employeeName: string, type: SeparationType, separationDate: string, lastWorkingDay: string, rehireEligible: boolean, terminatedPayoutPercentage?: number) => void;
  toggleChecklistItem: (settlementId: string, itemId: string) => void;
  approveSettlementFinance: (settlementId: string) => void;
  disburseSettlement: (settlementId: string) => void;
}

export const useSettlementStore = create<SettlementState>()(
  persist(
    (set, get) => ({
      settlements: [],

      calculateAndInitiateSettlement: (employeeId, employeeName, type, separationDate, lastWorkingDay, rehireEligible, terminatedPayoutPercentage) => {
        const user = useAuthStore.getState().user;
        const employee = useEmployeeStore.getState().employees.find(e => e.id === employeeId);
        if (!employee) return;

        // Apply distinct settlement calculations
        const benefits: SettlementBenefit[] = [];
        let totalPayout = 0;

        if (type === 'absconder') {
          // Absconders get exactly zero payout under SDC compliance rules
          benefits.push({ name: "Statutory Forfeiture (Absconder status)", amount: 0, type: "deduction" });
        } else {
          // 1. Calculate remaining basic salary for current month
          const basic = 150000; // Mock salary standard PKR
          benefits.push({ name: "Unpaid Basic Salary", amount: basic, type: "earning" });
          totalPayout += basic;

          // 2. Gratuity / End of Service benefits (UAE/Pakistan formulas)
          const joinDate = new Date(employee.date_of_joining);
          const exitDate = new Date(lastWorkingDay);
          const tenureYears = (exitDate.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
          
          if (tenureYears >= 1) {
            // UAE expat standard: 21 days basic salary per year of service
            const gratuityAmt = Math.round((basic / 30) * 21 * tenureYears);
            benefits.push({ name: `End of Service Benefit (${Math.round(tenureYears * 10) / 10} yrs service)`, amount: gratuityAmt, type: "earning" });
            totalPayout += gratuityAmt;
          }

          // 3. Leave Encashment
          const leaveAmt = 15000;
          benefits.push({ name: "Leave Encashment Payout", amount: leaveAmt, type: "earning" });
          totalPayout += leaveAmt;

          // 4. Configurable terminated percentage rule
          if (type === 'terminated' && terminatedPayoutPercentage !== undefined) {
            const deductionAmt = Math.round(totalPayout * (1 - terminatedPayoutPercentage / 100));
            if (deductionAmt > 0) {
              benefits.push({ name: `Termination Deduct (${terminatedPayoutPercentage}% Applied)`, amount: deductionAmt, type: "deduction" });
              totalPayout -= deductionAmt;
            }
          }
        }

        const checklist = [
          { id: "chk_1", title: "IT Asset & Laptop Handover", completed: false },
          { id: "chk_2", title: "Corporate Credentials Revoked", completed: false },
          { id: "chk_3", title: "Corporate Bank Card returned", completed: false },
          { id: "chk_4", title: "Exit Survey Finished", completed: false }
        ];

        const newSettlement: Settlement = {
          id: `set_${Math.random().toString(36).substring(2, 9)}`,
          tenant_id: user?.tenant_id || "tenant_sdc",
          employee_id: employeeId,
          employee_name: employeeName,
          separation_type: type,
          separation_date: separationDate,
          last_working_day: lastWorkingDay,
          checklist,
          benefits,
          total_payout: totalPayout,
          status: 'processing',
          rehire_eligible: rehireEligible,
          terminated_payout_percentage: terminatedPayoutPercentage,
          created_at: utcNow()
        };

        set((state) => ({ settlements: [newSettlement, ...state.settlements] }));

        // Mark employee in registry as separated
        let nextStatus: 'resigned' | 'terminated' | 'absconder' = 'resigned';
        if (type === 'terminated') nextStatus = 'terminated';
        else if (type === 'absconder') nextStatus = 'absconder';

        useEmployeeStore.getState().updateEmployee(employeeId, {
          status: nextStatus,
          rehire_eligible: rehireEligible
        });
      },

      toggleChecklistItem: (settlementId, itemId) => {
        set((state) => ({
          settlements: state.settlements.map((s) => {
            if (s.id === settlementId) {
              return {
                ...s,
                checklist: s.checklist.map(c => c.id === itemId ? {
                  ...c,
                  completed: !c.completed,
                  completed_at: !c.completed ? utcNow() : undefined
                } : c)
              };
            }
            return s;
          })
        }));
      },

      approveSettlementFinance: (settlementId) => {
        const user = useAuthStore.getState().user;
        set((state) => ({
          settlements: state.settlements.map(s => s.id === settlementId ? {
            ...s,
            status: 'pending_finance' as const,
            finance_approved_by: user?.name || "Finance Manager",
            finance_approved_at: utcNow()
          } : s)
        }));
      },

      disburseSettlement: (settlementId) => {
        const user = useAuthStore.getState().user;
        set((state) => ({
          settlements: state.settlements.map(s => s.id === settlementId ? {
            ...s,
            status: 'disbursed' as const
          } : s)
        }));

        useAuditStore.getState().addLog({
          user_id: user?.id || "unknown",
          user_name: user?.name || "System",
          action: "disburse_settlement",
          entity: "settlement",
          entity_id: settlementId,
          new_value: "disbursed",
          ip_address: "127.0.0.1"
        });
      }
    }),
    {
      name: 'sdc_hrms_settlements',
      storage: createTenantStorage('settlements')
    }
  )
);
