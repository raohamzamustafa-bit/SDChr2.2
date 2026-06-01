/* ================================================================
   SDC HR Solutions — Authentication Route Guard
   Verifies active sessions and handles automatic login redirect.
   ================================================================ */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#070b13] flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-4">
          <span className="w-10 h-10 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          <p className="text-sm font-semibold tracking-wider font-heading">Redirecting to SDC Login...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
