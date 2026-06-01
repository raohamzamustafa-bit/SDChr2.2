/* ================================================================
   SDC HR Solutions — Attendance & Shift Management Store
   Manages clocks, shift rosters, grace minutes, late penalty, and biometric stubs.
   ================================================================ */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AttendanceRecord, ShiftConfig, CorrectionRequest, LatePenaltyRule } from '../types';
import { createTenantStorage, utcNow } from '../lib/storage';
import { useAuditStore } from './auditStore';
import { useAuthStore } from './authStore';

interface AttendanceState {
  records: AttendanceRecord[];
  shifts: ShiftConfig[];
  shiftAssignments: Record<string, string>; // employeeId -> shiftId
  latePenaltyRules: LatePenaltyRule[];
  correctionRequests: CorrectionRequest[];
  biometricConfig: {
    deviceIp: string;
    port: number;
    status: 'disconnected' | 'connected';
  };

  // Actions
  clockIn: (employeeId: string, date: string, notes?: string) => void;
  clockOut: (employeeId: string, date: string, notes?: string) => void;
  addShift: (name: string, startTime: string, endTime: string, graceMinutes: number) => void;
  assignShift: (employeeId: string, shiftId: string) => void;
  addLatePenaltyRule: (thresholdMinutes: number, deductionAmount: number, deductionType: 'fixed' | 'percentage') => void;
  submitCorrectionRequest: (employeeId: string, employeeName: string, date: string, field: string, oldValue: string, newValue: string, reason: string) => void;
  approveCorrectionRequest: (requestId: string) => void;
  rejectCorrectionRequest: (requestId: string) => void;
  importCSVRecords: (csvText: string) => void;
  updateBiometricConfig: (deviceIp: string, port: number) => void;
}

export const useAttendanceStore = create<AttendanceState>()(
  persist(
    (set, get) => ({
      records: [
        {
          id: "rec_att_1",
          tenant_id: "tenant_sdc",
          employee_id: "emp_imran",
          date: "2026-06-01",
          clock_in: "09:05:00",
          clock_out: "18:00:00",
          status: "present",
          overtime_hours: 0,
          notes: "Regular shift",
          created_at: new Date().toISOString()
        }
      ],
      shifts: [
        { id: "shift_standard", tenant_id: "tenant_sdc", name: "Standard Morning", start_time: "09:00", end_time: "18:00", grace_minutes: 15 },
        { id: "shift_night", tenant_id: "tenant_sdc", name: "Night Roster", start_time: "21:00", end_time: "06:00", grace_minutes: 15 }
      ],
      shiftAssignments: {
        "emp_imran": "shift_standard"
      },
      latePenaltyRules: [
        { id: "rule_1", threshold_minutes: 30, deduction_amount: 500, deduction_type: "fixed" }
      ],
      correctionRequests: [],
      biometricConfig: {
        deviceIp: "192.168.10.220",
        port: 4370,
        status: "disconnected"
      },

      clockIn: (employeeId, date, notes) => {
        const user = useAuthStore.getState().user;
        const now = new Date();
        const clockTime = now.toTimeString().split(' ')[0];

        const newRec: AttendanceRecord = {
          id: `att_${Math.random().toString(36).substring(2, 9)}`,
          tenant_id: user?.tenant_id || "tenant_sdc",
          employee_id: employeeId,
          date,
          clock_in: clockTime,
          status: "present",
          overtime_hours: 0,
          notes,
          created_at: utcNow()
        };

        set((state) => ({ records: [newRec, ...state.records] }));
        useAuditStore.getState().addLog({
          user_id: user?.id || "unknown",
          user_name: user?.name || "System",
          action: "clock_in",
          entity: "attendance_record",
          entity_id: newRec.id,
          new_value: JSON.stringify(newRec),
          ip_address: "127.0.0.1"
        });
      },

      clockOut: (employeeId, date, notes) => {
        const user = useAuthStore.getState().user;
        const now = new Date();
        const clockTime = now.toTimeString().split(' ')[0];

        set((state) => ({
          records: state.records.map((r) => {
            if (r.employee_id === employeeId && r.date === date) {
              const updated = {
                ...r,
                clock_out: clockTime,
                notes: notes || r.notes
              };
              
              // Calculate overtime (simple: > 9 hours is overtime)
              if (r.clock_in) {
                const cinParts = r.clock_in.split(':').map(Number);
                const coutParts = clockTime.split(':').map(Number);
                const hrs = (coutParts[0] - cinParts[0]) + (coutParts[1] - cinParts[1]) / 60;
                if (hrs > 9) {
                  updated.overtime_hours = Math.round((hrs - 9) * 10) / 10;
                }
              }

              useAuditStore.getState().addLog({
                user_id: user?.id || "unknown",
                user_name: user?.name || "System",
                action: "clock_out",
                entity: "attendance_record",
                entity_id: r.id,
                new_value: JSON.stringify(updated),
                ip_address: "127.0.0.1"
              });

              return updated;
            }
            return r;
          })
        }));
      },

      addShift: (name, startTime, endTime, graceMinutes) => {
        const user = useAuthStore.getState().user;
        const newShift: ShiftConfig = {
          id: `shift_${Math.random().toString(36).substring(2, 9)}`,
          tenant_id: user?.tenant_id || "tenant_sdc",
          name,
          start_time: startTime,
          end_time: endTime,
          grace_minutes: graceMinutes
        };

        set((state) => ({ shifts: [...state.shifts, newShift] }));
        useAuditStore.getState().addLog({
          user_id: user?.id || "unknown",
          user_name: user?.name || "System",
          action: "create_shift",
          entity: "shift",
          entity_id: newShift.id,
          new_value: JSON.stringify(newShift),
          ip_address: "127.0.0.1"
        });
      },

      assignShift: (employeeId, shiftId) => {
        const user = useAuthStore.getState().user;
        set((state) => ({
          shiftAssignments: {
            ...state.shiftAssignments,
            [employeeId]: shiftId
          }
        }));

        useAuditStore.getState().addLog({
          user_id: user?.id || "unknown",
          user_name: user?.name || "System",
          action: "assign_employee_shift",
          entity: "employee_shift",
          entity_id: employeeId,
          new_value: shiftId,
          ip_address: "127.0.0.1"
        });
      },

      addLatePenaltyRule: (thresholdMinutes, deductionAmount, deductionType) => {
        const user = useAuthStore.getState().user;
        const newRule: LatePenaltyRule = {
          id: `rule_${Math.random().toString(36).substring(2, 9)}`,
          threshold_minutes: thresholdMinutes,
          deduction_amount: deductionAmount,
          deduction_type: deductionType
        };

        set((state) => ({ latePenaltyRules: [...state.latePenaltyRules, newRule] }));
        useAuditStore.getState().addLog({
          user_id: user?.id || "unknown",
          user_name: user?.name || "System",
          action: "create_late_penalty_rule",
          entity: "late_penalty_rule",
          entity_id: newRule.id,
          new_value: JSON.stringify(newRule),
          ip_address: "127.0.0.1"
        });
      },

      submitCorrectionRequest: (employeeId, employeeName, date, field, oldValue, newValue, reason) => {
        const newReq: CorrectionRequest = {
          id: `corr_${Math.random().toString(36).substring(2, 9)}`,
          employee_id: employeeId,
          employee_name: employeeName,
          date,
          field,
          old_value: oldValue,
          new_value: newValue,
          reason,
          status: 'pending',
          submitted_at: utcNow()
        };

        set((state) => ({ correctionRequests: [...state.correctionRequests, newReq] }));
      },

      approveCorrectionRequest: (requestId) => {
        const user = useAuthStore.getState().user;
        const req = get().correctionRequests.find(r => r.id === requestId);
        if (!req || req.status !== 'pending') return;

        // Apply correction
        set((state) => {
          const records = state.records.map((r) => {
            if (r.employee_id === req.employee_id && r.date === req.date) {
              return {
                ...r,
                [req.field]: req.new_value
              };
            }
            return r;
          });

          const correctionRequests = state.correctionRequests.map(r => r.id === requestId ? {
            ...r,
            status: 'approved' as const,
            reviewed_at: utcNow(),
            reviewed_by: user?.name || "Manager"
          } : r);

          return { records, correctionRequests };
        });

        useAuditStore.getState().addLog({
          user_id: user?.id || "unknown",
          user_name: user?.name || "System",
          action: "approve_attendance_correction",
          entity: "correction_request",
          entity_id: requestId,
          old_value: req.old_value,
          new_value: req.new_value,
          ip_address: "127.0.0.1"
        });
      },

      rejectCorrectionRequest: (requestId) => {
        const user = useAuthStore.getState().user;
        const req = get().correctionRequests.find(r => r.id === requestId);
        if (!req) return;

        set((state) => ({
          correctionRequests: state.correctionRequests.map(r => r.id === requestId ? {
            ...r,
            status: 'rejected' as const,
            reviewed_at: utcNow(),
            reviewed_by: user?.name || "Manager"
          } : r)
        }));
      },

      importCSVRecords: (csvText) => {
        const user = useAuthStore.getState().user;
        const lines = csvText.split('\n').filter(Boolean);
        if (lines.length <= 1) return;

        const imported: AttendanceRecord[] = [];
        // Header: EmployeeCode,Date,ClockIn,ClockOut,Notes
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(s => s.trim().replace(/^"|"$/g, ''));
          if (cols.length < 3) continue;

          const [code, date, clockIn, clockOut, notes] = cols;
          // Simple mock resolve employee code to emp_imran or similar
          const empId = code === "SDC-001" ? "emp_imran" : `emp_import_${code}`;

          imported.push({
            id: `att_imp_${Math.random().toString(36).substring(2, 9)}`,
            tenant_id: user?.tenant_id || "tenant_sdc",
            employee_id: empId,
            date,
            clock_in: clockIn || undefined,
            clock_out: clockOut || undefined,
            status: "present",
            overtime_hours: 0,
            notes: notes || "CSV Biometric Import",
            created_at: utcNow()
          });
        }

        set((state) => ({ records: [...imported, ...state.records] }));
        useAuditStore.getState().addLog({
          user_id: user?.id || "unknown",
          user_name: user?.name || "System",
          action: "csv_attendance_import",
          entity: "attendance_records",
          entity_id: "bulk",
          new_value: `${imported.length} rows imported.`,
          ip_address: "127.0.0.1"
        });
      },

      updateBiometricConfig: (deviceIp, port) => {
        set({ biometricConfig: { deviceIp, port, status: 'disconnected' } });
      }
    }),
    {
      name: 'sdc_hrms_attendance',
      storage: createTenantStorage('attendance')
    }
  )
);
