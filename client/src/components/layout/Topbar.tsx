/* ================================================================
   SDC HR Solutions — Topbar Dashboard Shell
   Holds mobile hamburgers, breadcrumbs, search filters, alert bells, and themes.
   ================================================================ */

import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import { useThemeStore } from '../../store/themeStore';
import { useNotificationStore } from '../../store/notificationStore';
import { NotificationCentre } from '../NotificationCentre';
import { Menu, Bell, Moon, Sun, LogOut, User, Globe } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export const Topbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggle);
  const { setSidebarMobileOpen } = useAppStore();
  const notifications = useNotificationStore((state) => state.notifications);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Generate simple breadcrumbs from location
  const pathParts = location.pathname.split('/').filter(Boolean);
  const pageTitle = pathParts.length > 0 
    ? pathParts[0].charAt(0).toUpperCase() + pathParts[0].slice(1).replace('-', ' ') 
    : 'Dashboard';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-[#070b13]/60 backdrop-blur-md border-b border-slate-800/60 px-6 flex items-center justify-between sticky top-0 z-30">
      
      {/* Left section: Hamburgers & Breadcrumbs */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarMobileOpen(true)}
          className="lg:hidden p-2 text-slate-400 hover:text-slate-200 cursor-pointer rounded-lg hover:bg-slate-800/40"
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-bold font-heading">SDC HRMS</span>
          <span className="text-slate-700">/</span>
          <span className="text-sm font-semibold text-slate-100 font-heading">{pageTitle}</span>
        </div>
      </div>

      {/* Right section: Control deck */}
      <div className="flex items-center gap-4 relative">
        
        {/* Localization language selector stub */}
        <button 
          onClick={() => alert("Multilingual Localization Pack: Urdu language support wired into i18n dictionaries.")}
          className="p-2 text-slate-400 hover:text-purple-400 transition-colors cursor-pointer rounded-lg hover:bg-slate-800/40"
          title="Switch Language"
        >
          <Globe size={18} />
        </button>

        {/* Dark/Light mode switcher */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer rounded-lg hover:bg-slate-800/40"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="p-2 text-slate-400 hover:text-purple-400 transition-colors cursor-pointer rounded-lg hover:bg-slate-800/40 relative"
            title="Notification Center"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-purple-600 rounded-full text-[9px] font-bold text-white flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>
          
          <NotificationCentre isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
        </div>

        {/* User profile dropdown trigger */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-800/40 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 font-bold font-heading text-xs flex items-center justify-center uppercase">
              {user?.name?.substring(0, 2) || "AD"}
            </div>
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 top-12 w-48 rounded-xl glass-card border border-slate-700/50 shadow-2xl p-2 z-50 animate-scale-in text-left">
              <div className="px-3 py-2 border-b border-slate-800/60 mb-1">
                <p className="text-xs font-semibold text-slate-200 truncate">{user?.name}</p>
                <p className="text-[10px] text-slate-500 truncate mt-0.5">{user?.email}</p>
              </div>
              <button
                onClick={() => { setProfileDropdownOpen(false); navigate('/config'); }}
                className="w-full px-3 py-2 rounded-lg text-xs text-slate-300 hover:text-slate-100 hover:bg-slate-800/40 transition-colors text-left flex items-center gap-2"
              >
                <User size={14} /> Profile Settings
              </button>
              <button
                onClick={handleLogout}
                className="w-full px-3 py-2 rounded-lg text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 transition-colors text-left flex items-center gap-2"
              >
                <LogOut size={14} /> Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
