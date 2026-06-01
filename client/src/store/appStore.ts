import { create } from 'zustand';

interface AppState {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  sidebarMobileOpen: boolean;
  setSidebarMobileOpen: (open: boolean) => void;
  notifications: any[];
  addNotification: (notification: any) => void;
  clearNotifications: () => void;
}

export const useAppStore = create<AppState>(set => ({
  sidebarCollapsed: false,
  setSidebarCollapsed: collapsed => set({ sidebarCollapsed: collapsed }),
  sidebarMobileOpen: false,
  setSidebarMobileOpen: open => set({ sidebarMobileOpen: open }),
  notifications: [
    { id: '1', title: 'New Leave Request', message: 'Imran Khan has requested Casual Leave.', type: 'info', time: '10m ago' },
    { id: '2', title: 'Compliance Warning', message: 'Verify employee CNIC numbers for Pakistan EOBI.', type: 'warning', time: '1h ago' },
  ],
  addNotification: n => set(state => ({ notifications: [n, ...state.notifications] })),
  clearNotifications: () => set({ notifications: [] }),
}));

