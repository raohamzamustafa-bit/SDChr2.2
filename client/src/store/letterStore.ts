/* ================================================================
   SDC HR Solutions — HR Communications & Letters Store
   Manages placeholder expansion, PDF print formats, and version control.
   ================================================================ */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LetterTemplate, GeneratedLetter, LetterType, LetterVersion } from '../types';
import { createTenantStorage, utcNow } from '../lib/storage';
import { useAuditStore } from './auditStore';
import { useAuthStore } from './authStore';

interface LetterState {
  templates: LetterTemplate[];
  generatedLetters: GeneratedLetter[];

  // Actions
  addTemplate: (name: string, type: LetterType, content: string) => void;
  updateTemplate: (id: string, content: string) => void;
  rollbackTemplateVersion: (templateId: string, versionId: string) => void;
  generateLetter: (templateId: string, employeeId: string, employeeName: string, values: Record<string, string>) => void;
  acknowledgeLetter: (letterId: string) => void;
}

export const useLetterStore = create<LetterState>()(
  persist(
    (set, get) => ({
      templates: [
        {
          id: "t_offer",
          tenant_id: "tenant_sdc",
          name: "Standard Employment Offer Letter",
          type: "offer",
          content: "Dear {{employeeName}},\n\nOn behalf of SDC HR Solutions, we are pleased to offer you the position of {{designation}} in our {{department}} department. Your basic monthly salary will be PKR {{salary}}.\n\nWe look forward to welcoming you to our team on {{date}}.\n\nWarm regards,\nSDC HR Solutions Team.",
          placeholders: ["employeeName", "designation", "department", "salary", "date"],
          versions: [
            { id: "v_1", content: "Dear {{employeeName}},\n\nOn behalf of SDC HR Solutions, we are pleased to offer you the position of {{designation}} in our {{department}} department. Your basic monthly salary will be PKR {{salary}}.\n\nWe look forward to welcoming you to our team on {{date}}.\n\nWarm regards,\nSDC HR Solutions Team.", created_at: new Date().toISOString(), created_by: "HR Manager" }
          ],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ],
      generatedLetters: [],

      addTemplate: (name, type, content) => {
        const user = useAuthStore.getState().user;
        const placeholders = Array.from(content.matchAll(/\{\{(.*?)\}\}/g)).map(m => m[1]);

        const newTemplate: LetterTemplate = {
          id: `t_${Math.random().toString(36).substring(2, 9)}`,
          tenant_id: user?.tenant_id || "tenant_sdc",
          name,
          type,
          content,
          placeholders,
          versions: [
            {
              id: `v_${Math.random().toString(36).substring(2, 9)}`,
              content,
              created_at: utcNow(),
              created_by: user?.name || "HR"
            }
          ],
          created_at: utcNow(),
          updated_at: utcNow()
        };

        set((state) => ({ templates: [...state.templates, newTemplate] }));
      },

      updateTemplate: (id, content) => {
        const user = useAuthStore.getState().user;
        const placeholders = Array.from(content.matchAll(/\{\{(.*?)\}\}/g)).map(m => m[1]);

        set((state) => ({
          templates: state.templates.map(t => {
            if (t.id === id) {
              const newVersion: LetterVersion = {
                id: `v_${Math.random().toString(36).substring(2, 9)}`,
                content,
                created_at: utcNow(),
                created_by: user?.name || "HR"
              };
              return {
                ...t,
                content,
                placeholders,
                versions: [newVersion, ...t.versions],
                updated_at: utcNow()
              };
            }
            return t;
          })
        }));
      },

      rollbackTemplateVersion: (templateId, versionId) => {
        set((state) => ({
          templates: state.templates.map(t => {
            if (t.id === templateId) {
              const version = t.versions.find(v => v.id === versionId);
              if (version) {
                return {
                  ...t,
                  content: version.content,
                  placeholders: Array.from(version.content.matchAll(/\{\{(.*?)\}\}/g)).map(m => m[1]),
                  updated_at: utcNow()
                };
              }
            }
            return t;
          })
        }));
      },

      generateLetter: (templateId, employeeId, employeeName, values) => {
        const user = useAuthStore.getState().user;
        const template = get().templates.find(t => t.id === templateId);
        if (!template) return;

        // Perform expansion on placeholders
        let expandedContent = template.content;
        Object.entries(values).forEach(([key, val]) => {
          expandedContent = expandedContent.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), val);
        });

        const newLetter: GeneratedLetter = {
          id: `let_${Math.random().toString(36).substring(2, 9)}`,
          tenant_id: user?.tenant_id || "tenant_sdc",
          template_id: templateId,
          template_name: template.name,
          employee_id: employeeId,
          employee_name: employeeName,
          content: expandedContent,
          acknowledged: false,
          generated_at: utcNow(),
          generated_by: user?.name || "System"
        };

        set((state) => ({ generatedLetters: [newLetter, ...state.generatedLetters] }));
      },

      acknowledgeLetter: (letterId) => {
        set((state) => ({
          generatedLetters: state.generatedLetters.map(l => l.id === letterId ? {
            ...l,
            acknowledged: true,
            acknowledged_at: utcNow()
          } : l)
        }));
      }
    }),
    {
      name: 'sdc_hrms_letters',
      storage: createTenantStorage('letters')
    }
  )
);
