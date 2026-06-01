/* ================================================================
   SDC HR Solutions — Departments, Designations & Branches Store
   Manages the organization structure layout.
   ================================================================ */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Department, Designation, Branch } from '../types';
import { createTenantStorage } from '../lib/storage';
import { useAuditStore } from './auditStore';
import { useAuthStore } from './authStore';

interface OrgState {
  departments: Department[];
  designations: Designation[];
  branches: Branch[];

  // Department Actions
  addDepartment: (name: string, headId?: string) => void;
  updateDepartment: (id: string, name: string, headId?: string) => void;
  deleteDepartment: (id: string) => void;

  // Designation Actions
  addDesignation: (title: string, grade: string, band: string) => void;
  updateDesignation: (id: string, title: string, grade: string, band: string) => void;
  deleteDesignation: (id: string) => void;

  // Branch Actions
  addBranch: (name: string, location: string) => void;
  updateBranch: (id: string, name: string, location: string) => void;
  deleteBranch: (id: string) => void;
}

export const useOrgStore = create<OrgState>()(
  persist(
    (set, get) => ({
      departments: [
        { id: "dept_hr", tenant_id: "tenant_sdc", name: "Human Resources", created_at: new Date().toISOString() },
        { id: "dept_eng", tenant_id: "tenant_sdc", name: "Engineering & IT", created_at: new Date().toISOString() },
        { id: "dept_fin", tenant_id: "tenant_sdc", name: "Finance & Accounts", created_at: new Date().toISOString() }
      ],
      designations: [
        { id: "desig_se", tenant_id: "tenant_sdc", title: "Software Engineer", grade: "G-3", band: "B", created_at: new Date().toISOString() },
        { id: "desig_hr_mgr", tenant_id: "tenant_sdc", title: "HR Manager", grade: "G-5", band: "A", created_at: new Date().toISOString() }
      ],
      branches: [
        { id: "br_lh", tenant_id: "tenant_sdc", name: "Lahore Headquarters", location: "Lahore, PK", created_at: new Date().toISOString() },
        { id: "br_kh", tenant_id: "tenant_sdc", name: "Karachi Branch", location: "Karachi, PK", created_at: new Date().toISOString() }
      ],

      addDepartment: (name, headId) => {
        const user = useAuthStore.getState().user;
        const newDept: Department = {
          id: `dept_${Math.random().toString(36).substring(2, 9)}`,
          tenant_id: user?.tenant_id || "tenant_sdc",
          name,
          head_id: headId,
          created_at: new Date().toISOString()
        };

        set((state) => ({ departments: [...state.departments, newDept] }));
        useAuditStore.getState().addLog({
          user_id: user?.id || "unknown",
          user_name: user?.name || "System",
          action: "create_department",
          entity: "department",
          entity_id: newDept.id,
          new_value: JSON.stringify(newDept),
          ip_address: "127.0.0.1"
        });
      },

      updateDepartment: (id, name, headId) => {
        const user = useAuthStore.getState().user;
        const oldDept = get().departments.find(d => d.id === id);
        
        set((state) => ({
          departments: state.departments.map(d => d.id === id ? { ...d, name, head_id: headId } : d)
        }));

        useAuditStore.getState().addLog({
          user_id: user?.id || "unknown",
          user_name: user?.name || "System",
          action: "update_department",
          entity: "department",
          entity_id: id,
          old_value: oldDept ? JSON.stringify(oldDept) : "",
          new_value: JSON.stringify({ id, name, head_id: headId }),
          ip_address: "127.0.0.1"
        });
      },

      deleteDepartment: (id) => {
        const user = useAuthStore.getState().user;
        const oldDept = get().departments.find(d => d.id === id);

        set((state) => ({
          departments: state.departments.filter(d => d.id !== id)
        }));

        useAuditStore.getState().addLog({
          user_id: user?.id || "unknown",
          user_name: user?.name || "System",
          action: "delete_department",
          entity: "department",
          entity_id: id,
          old_value: oldDept ? JSON.stringify(oldDept) : "",
          ip_address: "127.0.0.1"
        });
      },

      addDesignation: (title, grade, band) => {
        const user = useAuthStore.getState().user;
        const newDesig: Designation = {
          id: `desig_${Math.random().toString(36).substring(2, 9)}`,
          tenant_id: user?.tenant_id || "tenant_sdc",
          title,
          grade,
          band,
          created_at: new Date().toISOString()
        };

        set((state) => ({ designations: [...state.designations, newDesig] }));
        useAuditStore.getState().addLog({
          user_id: user?.id || "unknown",
          user_name: user?.name || "System",
          action: "create_designation",
          entity: "designation",
          entity_id: newDesig.id,
          new_value: JSON.stringify(newDesig),
          ip_address: "127.0.0.1"
        });
      },

      updateDesignation: (id, title, grade, band) => {
        const user = useAuthStore.getState().user;
        const oldDesig = get().designations.find(d => d.id === id);

        set((state) => ({
          designations: state.designations.map(d => d.id === id ? { ...d, title, grade, band } : d)
        }));

        useAuditStore.getState().addLog({
          user_id: user?.id || "unknown",
          user_name: user?.name || "System",
          action: "update_designation",
          entity: "designation",
          entity_id: id,
          old_value: oldDesig ? JSON.stringify(oldDesig) : "",
          new_value: JSON.stringify({ id, title, grade, band }),
          ip_address: "127.0.0.1"
        });
      },

      deleteDesignation: (id) => {
        const user = useAuthStore.getState().user;
        const oldDesig = get().designations.find(d => d.id === id);

        set((state) => ({
          designations: state.designations.filter(d => d.id !== id)
        }));

        useAuditStore.getState().addLog({
          user_id: user?.id || "unknown",
          user_name: user?.name || "System",
          action: "delete_designation",
          entity: "designation",
          entity_id: id,
          old_value: oldDesig ? JSON.stringify(oldDesig) : "",
          ip_address: "127.0.0.1"
        });
      },

      addBranch: (name, location) => {
        const user = useAuthStore.getState().user;
        const newBranch: Branch = {
          id: `br_${Math.random().toString(36).substring(2, 9)}`,
          tenant_id: user?.tenant_id || "tenant_sdc",
          name,
          location,
          created_at: new Date().toISOString()
        };

        set((state) => ({ branches: [...state.branches, newBranch] }));
        useAuditStore.getState().addLog({
          user_id: user?.id || "unknown",
          user_name: user?.name || "System",
          action: "create_branch",
          entity: "branch",
          entity_id: newBranch.id,
          new_value: JSON.stringify(newBranch),
          ip_address: "127.0.0.1"
        });
      },

      updateBranch: (id, name, location) => {
        const user = useAuthStore.getState().user;
        const oldBranch = get().branches.find(b => b.id === id);

        set((state) => ({
          branches: state.branches.map(b => b.id === id ? { ...b, name, location } : b)
        }));

        useAuditStore.getState().addLog({
          user_id: user?.id || "unknown",
          user_name: user?.name || "System",
          action: "update_branch",
          entity: "branch",
          entity_id: id,
          old_value: oldBranch ? JSON.stringify(oldBranch) : "",
          new_value: JSON.stringify({ id, name, location }),
          ip_address: "127.0.0.1"
        });
      },

      deleteBranch: (id) => {
        const user = useAuthStore.getState().user;
        const oldBranch = get().branches.find(b => b.id === id);

        set((state) => ({
          branches: state.branches.filter(b => b.id !== id)
        }));

        useAuditStore.getState().addLog({
          user_id: user?.id || "unknown",
          user_name: user?.name || "System",
          action: "delete_branch",
          entity: "branch",
          entity_id: id,
          old_value: oldBranch ? JSON.stringify(oldBranch) : "",
          ip_address: "127.0.0.1"
        });
      }
    }),
    {
      name: 'sdc_hrms_org',
      storage: createTenantStorage('org')
    }
  )
);
