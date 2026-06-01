/* ================================================================
   SDC HR Solutions — Tenant Configuration Store
   Holds current tenant profile, feature flag layout, and active compliance pack.
   ================================================================ */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CompanyConfig, FeatureFlags, QuietHours, DigestMode, CompliancePack } from '../types';
import { createTenantStorage } from '../lib/storage';
import { getCompliancePack } from '../lib/compliance';

interface TenantState {
  company: CompanyConfig;
  feature_flags: FeatureFlags;
  compliance_config: {
    country_code: string;
    pack: CompliancePack;
  };
  quiet_hours: QuietHours;
  digest_mode: DigestMode;
  
  // Actions
  updateCompany: (profile: Partial<CompanyConfig>) => void;
  toggleFeatureFlag: (flagKey: keyof FeatureFlags) => void;
  setComplianceCountry: (countryCode: string) => void;
  updateQuietHours: (config: QuietHours) => void;
  setDigestMode: (mode: DigestMode) => void;
}

export const useTenantStore = create<TenantState>()(
  persist(
    (set) => ({
      company: {
        name: "SDC HR Solutions",
        logo: "",
        address: "7th Floor, Silver Tower, Main Boulevard, Lahore, Pakistan",
        timezone: "Asia/Karachi",
        currency: "PKR",
        country: "PK"
      },
      feature_flags: {
        performance_appraisal: false,
        training_development: false,
        recruitment_pipeline: false,
        asset_management: false,
        offboarding_exit: false,
        employee_engagement: false,
        hr_analytics: false,
        expense_reimbursement: false,
        multi_tenant_saas: false,
        ai_talent_intelligence: false
      },
      compliance_config: {
        country_code: "PK",
        pack: getCompliancePack("PK")
      },
      quiet_hours: {
        enabled: true,
        start: "22:00",
        end: "07:00"
      },
      digest_mode: "daily",

      updateCompany: (profile) => set((state) => {
        const nextCompany = { ...state.company, ...profile };
        // Sync currency and country with compliance automatically if country changes
        let nextCompliance = state.compliance_config;
        if (profile.country && profile.country !== state.company.country) {
          nextCompliance = {
            country_code: profile.country,
            pack: getCompliancePack(profile.country)
          };
          nextCompany.currency = nextCompliance.pack.currency;
        }
        return {
          company: nextCompany,
          compliance_config: nextCompliance
        };
      }),
      toggleFeatureFlag: (flagKey) => set((state) => ({
        feature_flags: {
          ...state.feature_flags,
          [flagKey]: !state.feature_flags[flagKey]
        }
      })),
      setComplianceCountry: (countryCode) => set((state) => {
        const pack = getCompliancePack(countryCode);
        return {
          company: {
            ...state.company,
            country: countryCode,
            currency: pack.currency
          },
          compliance_config: {
            country_code: countryCode,
            pack
          }
        };
      }),
      updateQuietHours: (config) => set({ quiet_hours: config }),
      setDigestMode: (mode) => set({ digest_mode: mode })
    }),
    {
      name: 'sdc_hrms_tenant',
      storage: createTenantStorage('tenant')
    }
  )
);
