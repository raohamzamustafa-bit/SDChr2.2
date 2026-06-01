// ─── Tenant Types ───

export type TenantTier = 1 | 2 | 3;
export type SubscriptionStatus = 'active' | 'trial' | 'suspended' | 'cancelled';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  tier: TenantTier;
  featureFlags: Record<string, boolean>;
  complianceConfig: ComplianceConfigRef;
  branding: TenantBranding;
  settings: TenantSettings;
  subscriptionStatus: SubscriptionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TenantBranding {
  logo?: string;
  primaryColor?: string;
  accentColor?: string;
  companyName?: string;
  favicon?: string;
}

export interface TenantSettings {
  timezone: string;
  dateFormat: string;
  currency: string;
  currencySymbol: string;
  weekStartDay: number; // 0=Sun, 1=Mon, ...
  fiscalYearStartMonth: number; // 1=Jan, 7=Jul (Pakistan)
  workingDaysPerWeek: number;
  defaultLanguage: string;
}

export interface ComplianceConfigRef {
  country: string;
  region?: string;
  packVersion: string;
}

export interface CreateTenantDto {
  name: string;
  slug: string;
  tier?: TenantTier;
  country: string;
  timezone?: string;
  currency?: string;
  adminEmail: string;
  adminPassword: string;
}
