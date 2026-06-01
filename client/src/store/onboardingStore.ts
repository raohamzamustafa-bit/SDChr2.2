/* ================================================================
   SDC HR Solutions — Onboarding & Task Orchestration Store
   Manages custom task checklist runs and Day 2/3/4 escalations.
   ================================================================ */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { OnboardingChecklist, OnboardingAssignment, OnboardingTaskStatus, EscalationLevel } from '../types';
import { createTenantStorage, utcNow } from '../lib/storage';
import { useAuditStore } from './auditStore';
import { useAuthStore } from './authStore';

interface OnboardingState {
  templates: OnboardingChecklist[];
  assignments: OnboardingAssignment[];

  // Actions
  addTemplate: (name: string, departmentId?: string, designationId?: string, tasks?: OnboardingChecklist['tasks']) => void;
  assignChecklist: (employeeId: string, employeeName: string, templateId: string, dueDate: string) => void;
  toggleTask: (assignmentId: string, taskId: string) => void;
  triggerEscalationChecks: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      templates: [
        {
          id: "temp_eng",
          tenant_id: "tenant_sdc",
          name: "Engineering & IT Onboarding Pack",
          department_id: "dept_eng",
          tasks: [
            { id: "t_1", title: "Git Access & GitHub Setup", description: "Provision repository access and standard environment tools.", order: 1 },
            { id: "t_2", title: "Corporate Code of Conduct signoff", description: "Review and sign off SDC global handbook.", order: 2 },
            { id: "t_3", title: "Local environment setup", description: "Configure system libraries and local database setups.", order: 3 }
          ],
          created_at: new Date().toISOString()
        }
      ],
      assignments: [],

      addTemplate: (name, departmentId, designationId, tasks) => {
        const user = useAuthStore.getState().user;
        const newTemplate: OnboardingChecklist = {
          id: `temp_${Math.random().toString(36).substring(2, 9)}`,
          tenant_id: user?.tenant_id || "tenant_sdc",
          name,
          department_id: departmentId,
          designation_id: designationId,
          tasks: tasks || [],
          created_at: utcNow()
        };

        set((state) => ({ templates: [...state.templates, newTemplate] }));
      },

      assignChecklist: (employeeId, employeeName, templateId, dueDate) => {
        const user = useAuthStore.getState().user;
        const template = get().templates.find(t => t.id === templateId);
        if (!template) return;

        const tasks: OnboardingTaskStatus[] = template.tasks.map(t => ({
          task_id: t.id,
          title: t.title,
          completed: false
        }));

        const newAssignment: OnboardingAssignment = {
          id: `assign_${Math.random().toString(36).substring(2, 9)}`,
          tenant_id: user?.tenant_id || "tenant_sdc",
          employee_id: employeeId,
          employee_name: employeeName,
          checklist_id: templateId,
          checklist_name: template.name,
          tasks,
          assigned_at: utcNow(),
          due_date: dueDate,
          escalation_level: 0
        };

        set((state) => ({ assignments: [...state.assignments, newAssignment] }));
      },

      toggleTask: (assignmentId, taskId) => {
        const user = useAuthStore.getState().user;
        set((state) => ({
          assignments: state.assignments.map((as) => {
            if (as.id === assignmentId) {
              const updatedTasks = as.tasks.map(t => {
                if (t.task_id === taskId) {
                  return {
                    ...t,
                    completed: !t.completed,
                    completed_at: !t.completed ? utcNow() : undefined
                  };
                }
                return t;
              });

              return {
                ...as,
                tasks: updatedTasks
              };
            }
            return as;
          })
        }));
      },

      triggerEscalationChecks: () => {
        const assignments = get().assignments;
        const now = new Date();

        const updated = assignments.map((as) => {
          const assigned = new Date(as.assigned_at);
          const diffDays = Math.floor((now.getTime() - assigned.getTime()) / (1000 * 60 * 60 * 24));
          
          let nextLevel: EscalationLevel = as.escalation_level;
          const isCompleted = as.tasks.every(t => t.completed);

          if (!isCompleted) {
            if (diffDays >= 4 && as.escalation_level < 3) {
              nextLevel = 3; // Day 4: Alert to Admin
            } else if (diffDays >= 3 && as.escalation_level < 2) {
              nextLevel = 2; // Day 3: Warning to Employee + Manager
            } else if (diffDays >= 2 && as.escalation_level < 1) {
              nextLevel = 1; // Day 2: Reminder notification to employee
            }
          }

          if (nextLevel !== as.escalation_level) {
            return {
              ...as,
              escalation_level: nextLevel
            };
          }
          return as;
        });

        set({ assignments: updated });
      }
    }),
    {
      name: 'sdc_hrms_onboarding',
      storage: createTenantStorage('onboarding')
    }
  )
);
