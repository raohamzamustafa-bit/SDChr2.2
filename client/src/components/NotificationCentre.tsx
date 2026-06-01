/* ================================================================
   SDC HR Solutions — Notification Center
   Dynamic slider exhibiting corporate alerts and quiet hours indicators.
   ================================================================ */

import React from 'react';
import { useNotificationStore } from '../store/notificationStore';
import { Badge } from './ui';
import { formatDistanceToNow } from 'date-fns';

interface NotificationCentreProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCentre: React.FC<NotificationCentreProps> = ({ isOpen, onClose }) => {
  const { notifications, markAsRead, markAllAsRead, clearAll } = useNotificationStore();
  const unread = notifications.filter(n => !n.read);

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-16 w-80 max-h-[480px] overflow-y-auto z-50 rounded-2xl glass-card border border-slate-700/50 shadow-2xl p-4 animate-scale-in text-left">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <h4 className="font-bold text-slate-100 font-heading text-sm">Alert Feed</h4>
          {unread.length > 0 && (
            <Badge variant="warning" className="px-1.5 py-0.5 text-[10px]">
              {unread.length}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs">
          <button 
            onClick={markAllAsRead}
            className="text-purple-400 hover:text-purple-300 font-medium cursor-pointer"
          >
            Mark all
          </button>
          <span className="text-slate-600">|</span>
          <button 
            onClick={clearAll}
            className="text-rose-400 hover:text-rose-300 font-medium cursor-pointer"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
            <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p>All caught up! No recent alerts.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div 
              key={n.id}
              onClick={() => markAsRead(n.id)}
              className={`p-3 rounded-xl border text-xs cursor-pointer transition-all duration-200 ${
                n.read 
                  ? 'bg-slate-950/20 border-slate-800/40 text-slate-400 hover:bg-slate-900/30' 
                  : 'bg-purple-950/10 border-purple-500/20 text-slate-200 hover:bg-purple-950/20 shadow-sm'
              }`}
            >
              <div className="flex justify-between items-start gap-2 mb-1">
                <span className="font-bold font-heading">{n.title}</span>
                <span className="text-[9px] text-slate-500 font-medium shrink-0">
                  {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                </span>
              </div>
              <p className="line-clamp-2 leading-relaxed">{n.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
