/* ================================================================
   SDC HR Solutions — First-Class Feature Flag System
   Guards Tier 2 / Tier 3 modules based on subscription level.
   ================================================================ */

import React from 'react';
import { useTenantStore } from '../store/tenantStore';

/**
 * Custom hook to check if a feature is enabled.
 * @param flagKey The key of the feature flag from the tenantStore state.
 */
export function useFeatureFlag(flagKey: string): boolean {
  const flags = useTenantStore((state) => state.feature_flags);
  // Default to false if not configured, except if flagKey is empty or not in system
  if (!flagKey) return true;
  return !!flags[flagKey];
}

interface FeatureFlagGuardProps {
  flag: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Guard component that renders children if a feature flag is active,
 * otherwise renders a premium upgrade prompt card (never crashes or 404s).
 */
export const FeatureFlagGuard: React.FC<FeatureFlagGuardProps> = ({
  flag,
  children,
  fallback
}) => {
  const isEnabled = useFeatureFlag(flag);

  if (isEnabled) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  // Elegant standard glassmorphism upgrade card fallback
  return (
    <div className="glass-card p-8 rounded-2xl border border-violet-500/20 max-w-lg mx-auto my-12 text-center animate-fade-in relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 rounded-full blur-xl pointer-events-none"></div>
      <div className="w-16 h-16 bg-violet-500/10 border border-violet-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-violet-400">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <h3 className="text-2xl font-bold font-heading text-slate-100 mb-3">SDC Pro Subscription Required</h3>
      <p className="text-slate-400 text-sm leading-relaxed mb-6">
        The <span className="font-semibold text-violet-300">"{flag.replace(/_/g, ' ')}"</span> module is an international Tier 2/3 standard feature. Upgrade your workspace to unlock advanced enterprise capabilities.
      </p>
      <button 
        onClick={() => {
          // Open mock upgrade dialog or notify admin
          alert("Integration Alert: SDC Stripe Billing Integration requires a backend server. Contact sales@sdchr.solutions to upgrade.");
        }}
        className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
      >
        Unlock Enterprise Tier
      </button>
    </div>
  );
};
