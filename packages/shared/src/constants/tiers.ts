// ─── Tier Definitions ───

export const TIERS = {
  STARTER: 1,
  GROWTH: 2,
  ENTERPRISE: 3,
} as const;

export const TIER_NAMES: Record<number, string> = {
  1: 'Starter',
  2: 'Growth',
  3: 'Enterprise & SaaS',
};

export const TIER_DESCRIPTIONS: Record<number, string> = {
  1: 'Core HR operations for SMEs up to 100 employees',
  2: 'Performance, talent & growth tools for 100–1,000 employees',
  3: 'Multi-tenant SaaS, AI talent intelligence & enterprise tooling',
};

export const TIER_MODULES: Record<number, string[]> = {
  1: [
    'auth',
    'employees',
    'departments',
    'attendance',
    'leaves',
    'payroll',
    'onboarding',
    'letters',
    'loans',
    'compliance',
    'settings',
    'reports',
    'notifications',
    'documents',
  ],
  2: [
    'performance',
    'recruitment',
    'training',
    'assets',
    'expenses',
    'org_chart',
    'report_builder',
    'geo_checkin',
  ],
  3: [
    'saas_admin',
    'ai_talent',
    'analytics',
    'api_gateway',
    'white_label',
    'billing',
    'sar_packaging',
  ],
};

/** Get all modules available for a given tier (includes all lower tiers) */
export function getModulesForTier(tier: number): string[] {
  const modules: string[] = [];
  for (let t = 1; t <= tier; t++) {
    modules.push(...(TIER_MODULES[t] || []));
  }
  return modules;
}
