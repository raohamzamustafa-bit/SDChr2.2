/* ================================================================
   SDC HR Solutions — Storage Utilities & Global UTC Clock
   Ensures strict multi-tenant data isolation and UTC compliance.
   ================================================================ */

import { createJSONStorage } from 'zustand/middleware';

/**
 * Returns current timestamp in UTC format.
 */
export function utcNow(): string {
  return new Date().toISOString();
}

/**
 * Helper to extract current active tenant_id from local storage.
 * Reads the persistent global auth key to identify tenant boundary.
 */
export function getActiveTenantId(): string {
  try {
    const authData = localStorage.getItem('sdc_hrms_auth');
    if (authData) {
      const parsed = JSON.parse(authData);
      if (parsed?.state?.user?.tenant_id) {
        return parsed.state.user.tenant_id;
      }
    }
  } catch (e) {
    console.error('Failed to parse active tenant_id', e);
  }
  return 'default';
}

/**
 * Custom storage engine factory for Zustand persist middleware.
 * Enforces strict multi-tenant boundary by namespacing keys dynamically.
 * Returns a PersistStorage-compatible object via createJSONStorage.
 */
export function createTenantStorage(storeName: string) {
  return createJSONStorage(() => ({
    getItem: (name: string): string | null => {
      // For auth and theme, we use standard global keys
      if (storeName === 'auth' || storeName === 'theme') {
        return localStorage.getItem(`sdc_hrms_${storeName}`);
      }
      const tenantId = getActiveTenantId();
      const scopedKey = `sdc_hrms_${tenantId}_${storeName}`;
      return localStorage.getItem(scopedKey);
    },
    setItem: (name: string, value: string): void => {
      if (storeName === 'auth' || storeName === 'theme') {
        localStorage.setItem(`sdc_hrms_${storeName}`, value);
        return;
      }
      const tenantId = getActiveTenantId();
      const scopedKey = `sdc_hrms_${tenantId}_${storeName}`;
      localStorage.setItem(scopedKey, value);
    },
    removeItem: (name: string): void => {
      if (storeName === 'auth' || storeName === 'theme') {
        localStorage.removeItem(`sdc_hrms_${storeName}`);
        return;
      }
      const tenantId = getActiveTenantId();
      const scopedKey = `sdc_hrms_${tenantId}_${storeName}`;
      localStorage.removeItem(scopedKey);
    }
  }));
}
