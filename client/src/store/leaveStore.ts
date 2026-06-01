/* ================================================================
   SDC HR Solutions — Leave Management Store
   Manages leave quotas, carry forwards, 4-stage approvals, and override routes.
   ================================================================ */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LeaveType, LeaveBalance, LeaveRequest, LeaveApprovalStatus, ApprovalStep } from '../types';
import { createTenantStorage, utcNow } from '../lib/storage';
import { useAuditStore } from './auditStore';
import { useAuthStore } from './authStore';

interface LeaveState {
  leaveTypes: LeaveType[];
  leaveBalances: Record<string, LeaveBalance[]>; // employeeId -> balances
  leaveRequests: LeaveRequest[];

  // Actions
  addLeaveType: (name: string, quota: number, carryForward: number, probationAccrual: boolean) => void;
  initializeEmployeeBalance: (employeeId: string) => void;
  submitLeaveRequest: (requestData: Omit<LeaveRequest, 'id' | 'tenant_id' | 'status' | 'approval_chain' | 'created_at'>) => { success: boolean; error?: string };
  processApprovalStep: (requestId: string, level: ApprovalStep['level'], action: 'approve' | 'reject', comment?: string, overrideBalance?: boolean) => void;
  cancelLeaveRequest: (requestId: string) => void;
}

export const useLeaveStore = create<LeaveState>()(
  persist(
    (set, get) => ({
      leaveTypes: [
        { id: "lt_annual", tenant_id: "tenant_sdc", name: "Annual Leave", annual_quota: 14, carry_forward_max: 5, probation_accrual: true, color: "#8B5CF6" },
        { id: "lt_casual", tenant_id: "tenant_sdc", name: "Casual Leave", annual_quota: 10, carry_forward_max: 0, probation_accrual: false, color: "#F59E0B" },
        { id: "lt_sick", tenant_id: "tenant_sdc", name: "Sick Leave", annual_quota: 8, carry_forward_max: 0, probation_accrual: false, color: "#EF4444" }
      ],
      leaveBalances: {
        "emp_imran": [
          { id: "bal_1", employee_id: "emp_imran", leave_type_id: "lt_annual", leave_type_name: "Annual Leave", total: 14, used: 2, remaining: 12, carried_forward: 0, audit_log: [] },
          { id: "bal_2", employee_id: "emp_imran", leave_type_id: "lt_casual", leave_type_name: "Casual Leave", total: 10, used: 0, remaining: 10, carried_forward: 0, audit_log: [] },
          { id: "bal_3", employee_id: "emp_imran", leave_type_id: "lt_sick", leave_type_name: "Sick Leave", total: 8, used: 1, remaining: 7, carried_forward: 0, audit_log: [] }
        ]
      },
      leaveRequests: [
        {
          id: "req_lv_1",
          tenant_id: "tenant_sdc",
          employee_id: "emp_imran",
          employee_name: "Imran Khan",
          leave_type_id: "lt_annual",
          leave_type_name: "Annual Leave",
          start_date: "2026-06-15",
          end_date: "2026-06-17",
          half_day: false,
          days: 3,
          reason: "Family event in Islamabad.",
          status: "pending_tl",
          approval_chain: [
            { level: "team_lead", status: "pending" },
            { level: "manager", status: "pending" },
            { level: "director", status: "pending" },
            { level: "hr", status: "pending" }
          ],
          created_at: new Date().toISOString()
        }
      ],

      addLeaveType: (name, quota, carryForward, probationAccrual) => {
        const user = useAuthStore.getState().user;
        const newType: LeaveType = {
          id: `lt_${Math.random().toString(36).substring(2, 9)}`,
          tenant_id: user?.tenant_id || "tenant_sdc",
          name,
          annual_quota: quota,
          carry_forward_max: carryForward,
          probation_accrual: probationAccrual,
          color: `#${Math.floor(Math.random()*16777215).toString(16)}`
        };

        set((state) => ({ leaveTypes: [...state.leaveTypes, newType] }));
      },

      initializeEmployeeBalance: (employeeId) => {
        const types = get().leaveTypes;
        const balances = types.map((t) => ({
          id: `bal_${Math.random().toString(36).substring(2, 9)}`,
          employee_id: employeeId,
          leave_type_id: t.id,
          leave_type_name: t.name,
          total: t.annual_quota,
          used: 0,
          remaining: t.annual_quota,
          carried_forward: 0,
          audit_log: [
            { timestamp: utcNow(), action: "Initialization", change: t.annual_quota, balance_after: t.annual_quota, reason: "Initial setup" }
          ]
        }));

        set((state) => ({
          leaveBalances: {
            ...state.leaveBalances,
            [employeeId]: balances
          }
        }));
      },

      submitLeaveRequest: (reqData) => {
        const user = useAuthStore.getState().user;
        const balances = get().leaveBalances[reqData.employee_id] || [];
        const bal = balances.find(b => b.leave_type_id === reqData.leave_type_id);

        if (!bal) {
          return { success: false, error: "Leave balance record not found." };
        }

        // Validate overlap
        const start = new Date(reqData.start_date);
        const end = new Date(reqData.end_date);
        const overlap = get().leaveRequests.some(r => {
          if (r.employee_id !== reqData.employee_id || r.status === 'cancelled' || r.status === 'rejected') return false;
          const rStart = new Date(r.start_date);
          const rEnd = new Date(r.end_date);
          return start <= rEnd && end >= rStart;
        });

        if (overlap) {
          return { success: false, error: "Leave dates conflict with an existing request." };
        }

        if (bal.remaining < reqData.days) {
          return { success: false, error: `Insufficient leave balance. Remaining: ${bal.remaining} days.` };
        }

        const newRequest: LeaveRequest = {
          ...reqData,
          id: `req_lv_${Math.random().toString(36).substring(2, 9)}`,
          tenant_id: user?.tenant_id || "tenant_sdc",
          status: 'pending_tl',
          approval_chain: [
            { level: 'team_lead', status: 'pending' },
            { level: 'manager', status: 'pending' },
            { level: 'director', status: 'pending' },
            { level: 'hr', status: 'pending' }
          ],
          created_at: utcNow()
        };

        set((state) => ({ leaveRequests: [newRequest, ...state.leaveRequests] }));

        useAuditStore.getState().addLog({
          user_id: user?.id || "unknown",
          user_name: user?.name || "System",
          action: "submit_leave_request",
          entity: "leave_request",
          entity_id: newRequest.id,
          new_value: JSON.stringify(newRequest),
          ip_address: "127.0.0.1"
        });

        return { success: true };
      },

      processApprovalStep: (requestId, level, action, comment, overrideBalance) => {
        const user = useAuthStore.getState().user;
        const request = get().leaveRequests.find(r => r.id === requestId);
        if (!request) return;

        set((state) => {
          const nextChain = request.approval_chain.map((step) => {
            if (step.level === level) {
              return {
                ...step,
                status: action === 'approve' ? 'approved' as const : 'rejected' as const,
                approver_name: user?.name || "System",
                comment,
                timestamp: utcNow()
              };
            }
            return step;
          });

          // Determine next status in 4-level chain
          let nextStatus: LeaveApprovalStatus = request.status;
          if (action === 'reject') {
            nextStatus = 'rejected';
          } else {
            if (level === 'team_lead') nextStatus = 'pending_manager';
            else if (level === 'manager') nextStatus = 'pending_director';
            else if (level === 'director') nextStatus = 'pending_hr';
            else if (level === 'hr') nextStatus = 'approved';
          }

          // If approved at final HR step, deduct leave balance
          let updatedBalances = state.leaveBalances;
          if (nextStatus === 'approved') {
            const employeeBalances = state.leaveBalances[request.employee_id] || [];
            const newBal = employeeBalances.map((b) => {
              if (b.leave_type_id === request.leave_type_id) {
                const nextUsed = b.used + request.days;
                const nextRem = b.total - nextUsed;
                return {
                  ...b,
                  used: nextUsed,
                  remaining: nextRem,
                  audit_log: [
                    ...b.audit_log,
                    {
                      timestamp: utcNow(),
                      action: "Leave Deducted",
                      change: -request.days,
                      balance_after: nextRem,
                      reason: `Approved Leave Ref: ${requestId}`
                    }
                  ]
                };
              }
              return b;
            });

            updatedBalances = {
              ...state.leaveBalances,
              [request.employee_id]: newBal
            };
          }

          const leaveRequests = state.leaveRequests.map(r => r.id === requestId ? {
            ...r,
            status: nextStatus,
            approval_chain: nextChain,
            override_reason: overrideBalance ? `Overridden by ${user?.name}: ${comment}` : r.override_reason
          } : r);

          return { leaveRequests, leaveBalances: updatedBalances };
        });

        useAuditStore.getState().addLog({
          user_id: user?.id || "unknown",
          user_name: user?.name || "System",
          action: `${action}_leave_request_${level}`,
          entity: "leave_request",
          entity_id: requestId,
          new_value: `${action}d at ${level}. Status: ${action === 'approve' ? 'Progressing' : 'Rejected'}`,
          ip_address: "127.0.0.1"
        });
      },

      cancelLeaveRequest: (requestId) => {
        const user = useAuthStore.getState().user;
        const request = get().leaveRequests.find(r => r.id === requestId);
        if (!request) return;

        set((state) => {
          let updatedBalances = state.leaveBalances;
          // Revert balance deduction if cancelled after approval
          if (request.status === 'approved') {
            const employeeBalances = state.leaveBalances[request.employee_id] || [];
            const newBal = employeeBalances.map((b) => {
              if (b.leave_type_id === request.leave_type_id) {
                const nextUsed = b.used - request.days;
                const nextRem = b.total - nextUsed;
                return {
                  ...b,
                  used: nextUsed,
                  remaining: nextRem,
                  audit_log: [
                    ...b.audit_log,
                    {
                      timestamp: utcNow(),
                      action: "Leave Reverted",
                      change: request.days,
                      balance_after: nextRem,
                      reason: `Cancelled Approved Leave Ref: ${requestId}`
                    }
                  ]
                };
              }
              return b;
            });

            updatedBalances = {
              ...state.leaveBalances,
              [request.employee_id]: newBal
            };
          }

          const leaveRequests = state.leaveRequests.map(r => r.id === requestId ? {
            ...r,
            status: 'cancelled' as const
          } : r);

          return { leaveRequests, leaveBalances: updatedBalances };
        });

        useAuditStore.getState().addLog({
          user_id: user?.id || "unknown",
          user_name: user?.name || "System",
          action: "cancel_leave_request",
          entity: "leave_request",
          entity_id: requestId,
          old_value: request.status,
          new_value: "cancelled",
          ip_address: "127.0.0.1"
        });
      }
    }),
    {
      name: 'sdc_hrms_leaves',
      storage: createTenantStorage('leaves')
    }
  )
);
