// ─── Feature Flag Definitions ───
// Feature flags control tier-gated functionality.
// A tenant's `feature_flags` JSONB column overrides these defaults.

export interface FeatureFlagDefinition {
  key: string;
  label: string;
  description: string;
  tier: number;       // minimum tier required
  defaultEnabled: boolean;
  category: 'core' | 'hr' | 'payroll' | 'talent' | 'enterprise' | 'saas';
}

export const FEATURE_FLAGS: FeatureFlagDefinition[] = [
  // ─── Tier 1: Starter ───
  { key: 'employees',        label: 'Employee Management',       description: 'Employee profiles, documents, org structure',      tier: 1, defaultEnabled: true,  category: 'core' },
  { key: 'attendance',       label: 'Attendance Tracking',       description: 'Check-in/out, biometric, overtime',                tier: 1, defaultEnabled: true,  category: 'hr' },
  { key: 'leaves',           label: 'Leave Management',          description: 'Leave types, balances, request/approval',          tier: 1, defaultEnabled: true,  category: 'hr' },
  { key: 'payroll',          label: 'Payroll Processing',        description: 'Salary structures, payroll runs, payslips',        tier: 1, defaultEnabled: true,  category: 'payroll' },
  { key: 'onboarding',       label: 'Onboarding',                description: 'Checklist templates, task tracking, escalation',   tier: 1, defaultEnabled: true,  category: 'hr' },
  { key: 'letters',          label: 'Letter Engine',             description: 'Template-based letter & certificate generation',   tier: 1, defaultEnabled: true,  category: 'hr' },
  { key: 'loans',            label: 'Loan Management',           description: 'Salary advance, loan ledger, EMI tracking',       tier: 1, defaultEnabled: true,  category: 'payroll' },
  { key: 'documents',        label: 'Document Storage',          description: 'Employee document uploads via MinIO',              tier: 1, defaultEnabled: true,  category: 'core' },
  { key: 'notifications',    label: 'Notifications',             description: 'In-app and email notifications',                  tier: 1, defaultEnabled: true,  category: 'core' },
  { key: 'basic_reports',    label: 'Basic Reports',             description: 'Pre-built attendance, payroll, leave reports',     tier: 1, defaultEnabled: true,  category: 'core' },
  { key: 'wps_export',       label: 'WPS/Bank Export',           description: 'Wage Protection System & bank file exports',      tier: 1, defaultEnabled: true,  category: 'payroll' },
  { key: 'pwa',              label: 'PWA Mobile App',            description: 'Progressive Web App capabilities',                tier: 1, defaultEnabled: true,  category: 'core' },

  // ─── Tier 2: Growth ───
  { key: 'performance',      label: '360° Performance',          description: 'Feedback loops, OKR/KPI tracking, appraisals',    tier: 2, defaultEnabled: false, category: 'talent' },
  { key: 'recruitment',      label: 'Recruitment Pipeline',      description: 'ATS, job postings, candidate tracking',           tier: 2, defaultEnabled: false, category: 'talent' },
  { key: 'training',         label: 'Training & LMS',            description: 'Training plans, ROI monitoring',                  tier: 2, defaultEnabled: false, category: 'talent' },
  { key: 'assets',           label: 'Asset Management',          description: 'Asset allocation, lifecycle tracking',            tier: 2, defaultEnabled: false, category: 'hr' },
  { key: 'expenses',         label: 'Expense Reimbursement',     description: 'Expense claims, approval, finance integration',   tier: 2, defaultEnabled: false, category: 'payroll' },
  { key: 'org_chart',        label: 'Interactive Org Chart',     description: 'Visual organizational hierarchy',                 tier: 2, defaultEnabled: false, category: 'hr' },
  { key: 'report_builder',   label: 'Custom Report Builder',    description: 'Drag-and-drop report creation',                   tier: 2, defaultEnabled: false, category: 'enterprise' },
  { key: 'geo_checkin',      label: 'Geo-Fenced Check-in',      description: 'Mobile GPS-based attendance with geofencing',      tier: 2, defaultEnabled: false, category: 'hr' },
  { key: 'pulse_surveys',    label: 'Pulse Surveys',             description: 'Employee engagement surveys',                     tier: 2, defaultEnabled: false, category: 'talent' },

  // ─── Tier 3: Enterprise & SaaS ───
  { key: 'saas_admin',       label: 'SaaS Administration',      description: 'Tenant provisioning, subdomain routing',          tier: 3, defaultEnabled: false, category: 'saas' },
  { key: 'white_label',      label: 'White-Label Branding',     description: 'Custom logos, colors, domains per tenant',         tier: 3, defaultEnabled: false, category: 'saas' },
  { key: 'billing',          label: 'Stripe/Invoice Billing',   description: 'Subscription management, invoicing',              tier: 3, defaultEnabled: false, category: 'saas' },
  { key: 'ai_talent',        label: 'AI Talent Intelligence',   description: 'NLP skills extraction, resume parsing, matching', tier: 3, defaultEnabled: false, category: 'enterprise' },
  { key: 'api_gateway',      label: 'Public API Gateway',       description: 'OpenAPI 3.0 for BI tools (PowerBI, Tableau)',      tier: 3, defaultEnabled: false, category: 'enterprise' },
  { key: 'predictive_analytics', label: 'Predictive Analytics', description: 'Attrition prediction, payroll forecasting',       tier: 3, defaultEnabled: false, category: 'enterprise' },
  { key: 'sar_packaging',    label: 'SAR Data Packaging',       description: 'Automated Subject Access Request packaging',      tier: 3, defaultEnabled: false, category: 'enterprise' },
];

/** Check if a feature is available for a given tier and feature flags */
export function isFeatureEnabled(
  featureKey: string,
  tenantTier: number,
  tenantFlags: Record<string, boolean> = {}
): boolean {
  // Explicit override in tenant flags
  if (featureKey in tenantFlags) return tenantFlags[featureKey];

  const flag = FEATURE_FLAGS.find(f => f.key === featureKey);
  if (!flag) return false;

  // Check tier requirement
  if (tenantTier < flag.tier) return false;

  return flag.defaultEnabled;
}

/** Get all enabled features for a tenant */
export function getEnabledFeatures(
  tenantTier: number,
  tenantFlags: Record<string, boolean> = {}
): string[] {
  return FEATURE_FLAGS
    .filter(f => isFeatureEnabled(f.key, tenantTier, tenantFlags))
    .map(f => f.key);
}
