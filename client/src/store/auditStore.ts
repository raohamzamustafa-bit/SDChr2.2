/* ================================================================
   SDC HR Solutions — Append-Only Audit Store
   Maintains high-fidelity, unalterable log of all actions.
   ================================================================ */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuditEntry } from '../types';
import { createTenantStorage, utcNow } from '../lib/storage';

interface AuditState {
  logs: AuditEntry[];
  addLog: (log: Omit<AuditEntry, 'id' | 'timestamp' | 'anonymisation_token'>) => void;
  exportToCSV: () => string;
}

export const useAuditStore = create<AuditState>()(
  persist(
    (set, get) => ({
      logs: [],
      addLog: (log) => {
        const newEntry: AuditEntry = {
          ...log,
          id: Math.random().toString(36).substring(2, 11),
          timestamp: utcNow(),
          anonymisation_token: `TOK_${Math.random().toString(36).substring(2, 9).toUpperCase()}`
        };
        set((state) => ({ logs: [newEntry, ...state.logs] }));
      },
      exportToCSV: () => {
        const headers = ["Timestamp (UTC)", "User ID", "User Name", "Action", "Entity", "Entity ID", "Old Value", "New Value", "IP Address", "Anonymization Token"];
        const rows = get().logs.map(log => [
          log.timestamp,
          log.user_id,
          log.user_name,
          log.action,
          log.entity,
          log.entity_id,
          log.old_value || "",
          log.new_value || "",
          log.ip_address,
          log.anonymisation_token
        ]);
        
        const content = [headers, ...rows]
          .map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(","))
          .join("\n");
        return content;
      }
    }),
    {
      name: 'sdc_hrms_audit',
      storage: createTenantStorage('audit')
    }
  )
);
