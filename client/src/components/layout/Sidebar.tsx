/* ================================================================
   SDC HR Solutions — Collapsible Global Sidebar
   Exhibits navigation channels for Tier 1 and locked Tier 2/3 cards.
   ================================================================ */

import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import { useTenantStore } from '../../store/tenantStore';
import { Badge } from '../ui';
import clsx from 'clsx';
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  Mail,
  CalendarCheck,
  CalendarDays,
  CreditCard,
  UserX,
  FileBarChart2,
  Settings,
  Lock,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  GraduationCap,
  Briefcase,
  Layers,
  Sparkles
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const { sidebarCollapsed, setSidebarCollapsed, sidebarMobileOpen, setSidebarMobileOpen } = useAppStore();
  const flags = useTenantStore((state) => state.feature_flags);

  const menuItems = [
    { label: "Dashboard", path: "/", icon: LayoutDashboard },
    { label: "Employees", path: "/employees", icon: Users },
    { label: "Onboarding", path: "/onboarding", icon: CheckSquare },
    { label: "Letters Vault", path: "/letters", icon: Mail },
    { label: "Attendance", path: "/attendance", icon: CalendarCheck },
    { label: "Leave Desk", path: "/leaves", icon: CalendarDays },
    { label: "Payroll Config", path: "/payroll", icon: CreditCard },
    { label: "Exit Desk", path: "/settlement", icon: UserX },
    { label: "Reports Center", path: "/reports", icon: FileBarChart2 },
    // Tier 2 Premium locks
    { label: "Performance", path: "/performance", icon: TrendingUp, flag: "performance_appraisal" },
    { label: "Talent Training", path: "/training", icon: GraduationCap, flag: "training_development" },
    { label: "Recruitment", path: "/recruitment", icon: Briefcase, flag: "recruitment_pipeline" },
    { label: "Asset Center", path: "/assets", icon: Layers, flag: "asset_management" },
    { label: "AG Talent IQ", path: "/ai-talent", icon: Sparkles, flag: "ai_talent_intelligence" }
  ];

  const adminItems = [
    { label: "Global Settings", path: "/config", icon: Settings }
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {sidebarMobileOpen && (
        <div 
          onClick={() => setSidebarMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={clsx(
          "fixed top-0 bottom-0 left-0 z-40 bg-[#0c1220]/95 backdrop-blur-lg border-r border-slate-800/60 transition-all duration-300 flex flex-col justify-between",
          sidebarCollapsed ? "w-20" : "w-64",
          sidebarMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Top Header Logo */}
        <div>
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800/60 relative">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-white font-heading text-lg shadow-md shadow-purple-500/20">
                S
              </div>
              {!sidebarCollapsed && (
                <div className="flex flex-col">
                  <span className="font-bold text-slate-100 font-heading text-sm tracking-wide">SDC Solutions</span>
                  <span className="text-[10px] text-purple-400 font-semibold tracking-wider uppercase">Enterprise</span>
                </div>
              )}
            </div>

            {/* Collapse toggle desktop */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex absolute -right-3.5 top-4.5 w-7 h-7 rounded-full bg-slate-900 border border-slate-700/60 items-center justify-center text-slate-400 hover:text-slate-200 cursor-pointer shadow-md shadow-slate-950/50"
            >
              {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
          </div>

          {/* Navigation channels */}
          <nav className="p-4 flex flex-col gap-1.5 overflow-y-auto max-h-[calc(100vh-140px)]">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isLocked = item.flag && !flags[item.flag];

              return (
                <NavLink
                  key={item.label}
                  to={item.path}
                  onClick={() => setSidebarMobileOpen(false)}
                  className={({ isActive }) =>
                    clsx(
                      "flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer relative group",
                      isActive 
                        ? "bg-purple-600/10 text-purple-400 border border-purple-500/20 font-semibold" 
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent"
                    )
                  }
                >
                  <Icon size={18} className="shrink-0" />
                  {!sidebarCollapsed && (
                    <span className="font-heading truncate">{item.label}</span>
                  )}
                  {isLocked && !sidebarCollapsed && (
                    <Badge variant="neutral" className="ml-auto px-1.5 py-0.5 text-[9px] flex items-center gap-1 shrink-0 bg-slate-800 text-slate-400 border-slate-700">
                      <Lock size={8} /> Pro
                    </Badge>
                  )}
                  {/* Tooltip in collapsed mode */}
                  {sidebarCollapsed && (
                    <div className="absolute left-24 px-3 py-1.5 bg-slate-950 text-slate-100 rounded-lg text-xs font-semibold opacity-0 scale-90 origin-left group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 shadow-xl border border-slate-800 pointer-events-none whitespace-nowrap z-50">
                      {item.label} {isLocked ? "(Pro Only)" : ""}
                    </div>
                  )}
                </NavLink>
              );
            })}

            {/* Admin Channel */}
            {(user?.role === 'super_admin' || user?.role === 'admin' || user?.role === 'hr') && (
              <>
                <div className="h-[1px] bg-slate-800/60 my-2" />
                {adminItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.label}
                      to={item.path}
                      onClick={() => setSidebarMobileOpen(false)}
                      className={({ isActive }) =>
                        clsx(
                          "flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer border border-transparent relative group",
                          isActive 
                            ? "bg-purple-600/10 text-purple-400 border-purple-500/20 font-semibold" 
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                        )
                      }
                    >
                      <Icon size={18} className="shrink-0" />
                      {!sidebarCollapsed && <span className="font-heading truncate">{item.label}</span>}
                      {sidebarCollapsed && (
                        <div className="absolute left-24 px-3 py-1.5 bg-slate-950 text-slate-100 rounded-lg text-xs font-semibold opacity-0 scale-90 origin-left group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 shadow-xl border border-slate-800 pointer-events-none whitespace-nowrap z-50">
                          {item.label}
                        </div>
                      )}
                    </NavLink>
                  );
                })}
              </>
            )}
          </nav>
        </div>

        {/* Footer User Avatar Profile */}
        <div className="p-4 border-t border-slate-800/60 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold font-heading text-sm shadow-inner shrink-0 uppercase">
            {user?.name?.substring(0, 2) || "AD"}
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col truncate">
              <span className="text-sm font-semibold text-slate-200 truncate">{user?.name}</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{user?.role?.replace('_', ' ')}</span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
