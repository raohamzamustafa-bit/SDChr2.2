/* ================================================================
   SDC HR Solutions — Global Application Structure Layout
   Binds Sidebar, Topbar, and standard page outlets.
   ================================================================ */

import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useAppStore } from '../../store/appStore';
import clsx from 'clsx';

export const AppLayout: React.FC = () => {
  const sidebarCollapsed = useAppStore((state) => state.sidebarCollapsed);

  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 flex overflow-hidden">
      
      {/* Dynamic Collapsible Sidebar */}
      <Sidebar />

      {/* Primary content panels */}
      <div 
        className={clsx(
          "flex-1 flex flex-col min-h-screen transition-all duration-300",
          sidebarCollapsed ? "lg:pl-20" : "lg:pl-64"
        )}
      >
        <Topbar />

        <main className="flex-1 p-6 relative z-10 max-h-[calc(100vh-64px)] overflow-y-auto">
          {/* Moving background glowing orbs to fit premium design aesthetics! */}
          <div className="bg-glow-orb-1 -top-12 -left-12" />
          <div className="bg-glow-orb-2 -bottom-24 -right-12" />
          
          <Suspense fallback={
            <div className="flex-1 min-h-[60vh] flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <span className="w-10 h-10 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                <p className="text-sm font-semibold tracking-wider font-heading text-slate-400">Loading SDC HRMS Suite...</p>
              </div>
            </div>
          }>
            <div className="page-transition">
              <Outlet />
            </div>
          </Suspense>
        </main>
      </div>
    </div>
  );
};
