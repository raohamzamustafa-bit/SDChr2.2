/* ================================================================
   SDC HR Solutions — Corporate Alerts & Notifications Center Store
   Manages notification states, quiet hour suppressions, and unread counts.
   ================================================================ */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppNotification, NotificationType } from '../types';
import { createTenantStorage, utcNow } from '../lib/storage';
import { useTenantStore } from './tenantStore';
import { useAuthStore } from './authStore';

interface NotificationState {
  notifications: AppNotification[];

  // Actions
  triggerNotification: (type: NotificationType, title: string, message: string, actionUrl?: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [
        {
          id: "notif_1",
          tenant_id: "tenant_sdc",
          type: "onboarding",
          title: "Onboarding SLA SLA-4",
          message: "Checklist Assignment for Imran Khan has reached day 2: reminder triggered.",
          read: false,
          created_at: new Date().toISOString()
        },
        {
          id: "notif_2",
          tenant_id: "tenant_sdc",
          type: "approval",
          title: "Leave Request Submitted",
          message: "Imran Khan has applied for 3 days of Annual Leave. Approvers in queue notified.",
          read: true,
          created_at: new Date(Date.now() - 3600000).toISOString()
        }
      ],

      triggerNotification: (type, title, message, actionUrl) => {
        // Enforce quiet hours suppression if enabled
        const tenant = useTenantStore.getState();
        const quietHours = tenant.quiet_hours;

        if (quietHours.enabled) {
          const now = new Date();
          const currentHour = now.getHours();
          const currentMin = now.getMinutes();

          const [startHour, startMin] = quietHours.start.split(':').map(Number);
          const [endHour, endMin] = quietHours.end.split(':').map(Number);

          const nowMins = currentHour * 60 + currentMin;
          const startMins = startHour * 60 + startMin;
          const endMins = endHour * 60 + endMin;

          let isQuiet = false;
          if (startMins > endMins) {
            // Overnights quiet hours (e.g. 22:00 to 07:00)
            isQuiet = nowMins >= startMins || nowMins <= endMins;
          } else {
            isQuiet = nowMins >= startMins && nowMins <= endMins;
          }

          if (isQuiet) {
            console.log(`Notification '${title}' suppressed due to Active Quiet Hours (${quietHours.start} - ${quietHours.end})`);
            return; // Suppress the notification
          }
        }

        const user = useAuthStore.getState().user;
        const newNotif: AppNotification = {
          id: `notif_${Math.random().toString(36).substring(2, 9)}`,
          tenant_id: user?.tenant_id || "tenant_sdc",
          type,
          title,
          message,
          read: false,
          action_url: actionUrl,
          created_at: utcNow()
        };

        set((state) => ({ notifications: [newNotif, ...state.notifications] }));
      },

      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
        }));
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map(n => ({ ...n, read: true }))
        }));
      },

      clearAll: () => {
        set({ notifications: [] });
      }
    }),
    {
      name: 'sdc_hrms_notifications',
      storage: createTenantStorage('notifications')
    }
  )
);
