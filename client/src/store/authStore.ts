/* ================================================================
   SDC HR Solutions — Authentication & Session Store
   Manages strict secure authentication, login lockout, and active sessions.
   ================================================================ */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Session, UserRole } from '../types';
import { createTenantStorage, utcNow } from '../lib/storage';
import { useAuditStore } from './auditStore';

interface AuthState {
  user: User | null;
  sessions: Session[];
  failedAttempts: number;
  lockoutUntil: string | null;
  resetToken: string | null;
  resetExpiry: string | null;
  
  // Actions
  login: (email: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  revokeSession: (sessionId: string) => void;
  requestPasswordReset: (email: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      sessions: [],
      failedAttempts: 0,
      lockoutUntil: null,
      resetToken: null,
      resetExpiry: null,

      login: async (email, role) => {
        const now = utcNow();
        const lockout = get().lockoutUntil;

        if (lockout && new Date(lockout) > new Date(now)) {
          const diffMin = Math.ceil((new Date(lockout).getTime() - new Date(now).getTime()) / (1000 * 60));
          return { success: false, error: `Account locked. Please try again in ${diffMin} minutes.` };
        }

        // Simulating standard password verification
        // If email is wrong, we count it as a failed attempt to demonstrate lockout rules
        if (!email.includes('@')) {
          const newFailed = get().failedAttempts + 1;
          let lockoutTime: string | null = null;
          if (newFailed >= 10) {
            lockoutTime = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour lockout
          } else if (newFailed >= 5) {
            lockoutTime = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 min lockout
          }

          set({ failedAttempts: newFailed, lockoutUntil: lockoutTime });
          useAuditStore.getState().addLog({
            user_id: "anonymous",
            user_name: "Anonymous User",
            action: "failed_login_attempt",
            entity: "user",
            entity_id: email,
            old_value: `Attempts: ${newFailed}`,
            ip_address: "192.168.1.101"
          });
          return { success: false, error: "Invalid email structure." };
        }

        // Successful simulated login
        const loggedUser: User = {
          id: `USR_${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
          email,
          name: email.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          role,
          tenant_id: "tenant_sdc"
        };

        const newSession: Session = {
          id: `SES_${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
          device: navigator.userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop Workstation',
          browser: navigator.userAgent.split(' ')[0],
          ip: "192.168.1.100",
          created_at: now,
          last_active: now
        };

        set({
          user: loggedUser,
          sessions: [newSession, ...get().sessions],
          failedAttempts: 0,
          lockoutUntil: null
        });

        useAuditStore.getState().addLog({
          user_id: loggedUser.id,
          user_name: loggedUser.name,
          action: "user_login_success",
          entity: "user",
          entity_id: loggedUser.id,
          old_value: "logged_out",
          new_value: "logged_in",
          ip_address: newSession.ip
        });

        return { success: true };
      },

      logout: () => {
        const currentUser = get().user;
        if (currentUser) {
          useAuditStore.getState().addLog({
            user_id: currentUser.id,
            user_name: currentUser.name,
            action: "user_logout",
            entity: "user",
            entity_id: currentUser.id,
            old_value: "logged_in",
            new_value: "logged_out",
            ip_address: "192.168.1.100"
          });
        }
        set({ user: null, sessions: [] });
      },

      revokeSession: (sessionId) => {
        const user = get().user;
        const targetSession = get().sessions.find(s => s.id === sessionId);
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== sessionId)
        }));

        if (user && targetSession) {
          useAuditStore.getState().addLog({
            user_id: user.id,
            user_name: user.name,
            action: "revoke_session",
            entity: "session",
            entity_id: sessionId,
            old_value: JSON.stringify(targetSession),
            new_value: "revoked",
            ip_address: "192.168.1.100"
          });
        }
      },

      requestPasswordReset: (email) => {
        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours expiry
        set({ resetToken: token, resetExpiry: expiry });

        useAuditStore.getState().addLog({
          user_id: "anonymous",
          user_name: "Anonymous User",
          action: "password_reset_request",
          entity: "user",
          entity_id: email,
          old_value: "none",
          new_value: `token_issued: ${token.substring(0, 8)}...`,
          ip_address: "192.168.1.100"
        });
      }
    }),
    {
      name: 'sdc_hrms_auth',
      storage: createTenantStorage('auth')
    }
  )
);
