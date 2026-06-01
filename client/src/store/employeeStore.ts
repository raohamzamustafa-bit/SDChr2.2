/* ================================================================
   SDC HR Solutions — Employee Profile & Registry Store
   Handles secure employee profile fields with field-level encryption.
   ================================================================ */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Employee, ChangeRequest, EmployeeDocument, EmergencyContact, EmployeeStatus } from '../types';
import { createTenantStorage, utcNow } from '../lib/storage';
import { encrypt, decrypt } from '../lib/encryption';
import { useAuditStore } from './auditStore';
import { useAuthStore } from './authStore';

interface EmployeeState {
  employees: Employee[];
  pending_changes: ChangeRequest[];

  // Actions
  addEmployee: (employeeData: Omit<Employee, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>) => void;
  updateEmployee: (id: string, employeeData: Partial<Employee>) => void;
  submitChangeRequest: (employeeId: string, field: string, newValue: string) => void;
  approveChangeRequest: (requestId: string) => void;
  rejectChangeRequest: (requestId: string) => void;
  uploadDocument: (employeeId: string, document: Omit<EmployeeDocument, 'id' | 'uploaded_at'>) => void;
}

export const useEmployeeStore = create<EmployeeState>()(
  persist(
    (set, get) => ({
      employees: [
        {
          id: "emp_imran",
          tenant_id: "tenant_sdc",
          employee_code: "SDC-001",
          first_name: "Imran",
          last_name: "Khan",
          email: "imran.khan@sdchr.solutions",
          phone: "+923001234567",
          date_of_birth: "1990-10-10",
          gender: "male",
          marital_status: "married",
          national_id_encrypted: encrypt("35201-1234567-1"),
          passport_encrypted: encrypt("PB1234567"),
          bank_account_encrypted: encrypt("PK12ALLZ0000001234567890"),
          tax_id_encrypted: encrypt("NTN-7654321-0"),
          department_id: "dept_eng",
          designation_id: "desig_se",
          branch_id: "br_lh",
          date_of_joining: "2020-01-15",
          probation_end_date: "2020-04-15",
          employment_type: "permanent",
          status: "active",
          rehire_eligible: true,
          salary_encrypted: encrypt("180000"), // 180k PKR Basic Pay
          emergency_contacts: [
            { id: "em_1", name: "Jemima Goldsmith", relationship: "Spouse", phone: "+923007654321" }
          ],
          documents: [
            { id: "doc_1", name: "CNIC Scan", type: "ID Proof", expiry_date: "2030-12-31", uploaded_at: new Date().toISOString() }
          ],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ],
      pending_changes: [],

      addEmployee: (employeeData) => {
        const user = useAuthStore.getState().user;
        const newEmp: Employee = {
          ...employeeData,
          id: `emp_${Math.random().toString(36).substring(2, 9)}`,
          tenant_id: user?.tenant_id || "tenant_sdc",
          created_at: utcNow(),
          updated_at: utcNow()
        };

        set((state) => ({ employees: [...state.employees, newEmp] }));
        useAuditStore.getState().addLog({
          user_id: user?.id || "unknown",
          user_name: user?.name || "System",
          action: "create_employee",
          entity: "employee",
          entity_id: newEmp.id,
          new_value: JSON.stringify({ ...newEmp, salary_encrypted: "[ENCRYPTED]" }),
          ip_address: "127.0.0.1"
        });
      },

      updateEmployee: (id, employeeData) => {
        const user = useAuthStore.getState().user;
        const oldEmp = get().employees.find(e => e.id === id);

        set((state) => ({
          employees: state.employees.map(e => {
            if (e.id === id) {
              const updated = { ...e, ...employeeData, updated_at: utcNow() };
              return updated;
            }
            return e;
          })
        }));

        useAuditStore.getState().addLog({
          user_id: user?.id || "unknown",
          user_name: user?.name || "System",
          action: "update_employee",
          entity: "employee",
          entity_id: id,
          old_value: oldEmp ? JSON.stringify({ ...oldEmp, salary_encrypted: "[ENCRYPTED]" }) : "",
          new_value: JSON.stringify({ ...employeeData, salary_encrypted: "[ENCRYPTED]" }),
          ip_address: "127.0.0.1"
        });
      },

      submitChangeRequest: (employeeId, field, newValue) => {
        const user = useAuthStore.getState().user;
        const employee = get().employees.find(e => e.id === employeeId);
        if (!employee) return;

        let oldValue = (employee as any)[field] || "";
        if (field.endsWith('_encrypted')) {
          oldValue = decrypt(oldValue);
        }

        const newReq: ChangeRequest = {
          id: `req_${Math.random().toString(36).substring(2, 9)}`,
          employee_id: employeeId,
          employee_name: `${employee.first_name} ${employee.last_name}`,
          field,
          old_value: oldValue,
          new_value: newValue,
          status: 'pending',
          submitted_at: utcNow()
        };

        set((state) => ({ pending_changes: [...state.pending_changes, newReq] }));
        useAuditStore.getState().addLog({
          user_id: user?.id || "unknown",
          user_name: user?.name || "System",
          action: "submit_profile_change_request",
          entity: "change_request",
          entity_id: newReq.id,
          new_value: JSON.stringify(newReq),
          ip_address: "127.0.0.1"
        });
      },

      approveChangeRequest: (requestId) => {
        const user = useAuthStore.getState().user;
        const request = get().pending_changes.find(r => r.id === requestId);
        if (!request || request.status !== 'pending') return;

        const employee = get().employees.find(e => e.id === request.employee_id);
        if (!employee) return;

        let valToApply = request.new_value;
        if (request.field.endsWith('_encrypted')) {
          valToApply = encrypt(request.new_value);
        }

        set((state) => ({
          employees: state.employees.map(e => e.id === request.employee_id ? {
            ...e,
            [request.field]: valToApply,
            updated_at: utcNow()
          } : e),
          pending_changes: state.pending_changes.map(r => r.id === requestId ? {
            ...r,
            status: 'approved',
            reviewed_at: utcNow(),
            reviewed_by: user?.name || "System"
          } : r)
        }));

        useAuditStore.getState().addLog({
          user_id: user?.id || "unknown",
          user_name: user?.name || "System",
          action: "approve_profile_change_request",
          entity: "change_request",
          entity_id: requestId,
          old_value: request.old_value,
          new_value: request.new_value,
          ip_address: "127.0.0.1"
        });
      },

      rejectChangeRequest: (requestId) => {
        const user = useAuthStore.getState().user;
        const request = get().pending_changes.find(r => r.id === requestId);
        if (!request || request.status !== 'pending') return;

        set((state) => ({
          pending_changes: state.pending_changes.map(r => r.id === requestId ? {
            ...r,
            status: 'rejected',
            reviewed_at: utcNow(),
            reviewed_by: user?.name || "System"
          } : r)
        }));

        useAuditStore.getState().addLog({
          user_id: user?.id || "unknown",
          user_name: user?.name || "System",
          action: "reject_profile_change_request",
          entity: "change_request",
          entity_id: requestId,
          ip_address: "127.0.0.1"
        });
      },

      uploadDocument: (employeeId, docData) => {
        const user = useAuthStore.getState().user;
        const newDoc: EmployeeDocument = {
          ...docData,
          id: `doc_${Math.random().toString(36).substring(2, 9)}`,
          uploaded_at: utcNow()
        };

        set((state) => ({
          employees: state.employees.map(e => e.id === employeeId ? {
            ...e,
            documents: [...e.documents, newDoc]
          } : e)
        }));

        useAuditStore.getState().addLog({
          user_id: user?.id || "unknown",
          user_name: user?.name || "System",
          action: "upload_employee_document",
          entity: "employee",
          entity_id: employeeId,
          new_value: JSON.stringify(newDoc),
          ip_address: "127.0.0.1"
        });
      }
    }),
    {
      name: 'sdc_hrms_employees',
      storage: createTenantStorage('employees')
    }
  )
);
