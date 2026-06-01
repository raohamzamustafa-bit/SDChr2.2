/* ================================================================
   SDC HR Solutions — Secure Enterprise Login Portal
   Binds security lockouts, role toggles, and session lists.
   ================================================================ */

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { Button, Input, Select, Card } from '../components/ui';
import { UserRole } from '../types';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, login, failedAttempts, lockoutUntil, requestPasswordReset } = useAuthStore();

  const [email, setEmail] = useState('admin@sdchr.solutions');
  const [role, setRole] = useState<UserRole>('super_admin');
  const [password, setPassword] = useState('••••••••••••');
  const [loading, setLoading] = useState(false);
  const [lockoutTimeLeft, setLockoutTimeLeft] = useState(0);

  // Lockout countdown timer
  useEffect(() => {
    if (!lockoutUntil) return;

    const timer = setInterval(() => {
      const diff = new Date(lockoutUntil).getTime() - Date.now();
      if (diff <= 0) {
        setLockoutTimeLeft(0);
        clearInterval(timer);
      } else {
        setLockoutTimeLeft(Math.ceil(diff / 1000));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [lockoutUntil]);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await login(email, role);
    setLoading(false);

    if (res.success) {
      toast.success("Authentication successful. Welcome to SDC HRMS!");
      navigate('/');
    } else {
      toast.error(res.error || "Authentication failed. Access Denied.");
    }
  };

  const handleForgotPassword = () => {
    if (!email || !email.includes('@')) {
      toast.error("Please fill in a valid email structure first.");
      return;
    }
    requestPasswordReset(email);
    toast.success("Security Notice: Password reset token generated and logged to audit trails (SMTP Backend Stub).");
  };

  return (
    <div className="min-h-screen bg-[#070b13] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background flowing gradient blobs */}
      <div className="bg-glow-orb-1 -top-20 -left-20" />
      <div className="bg-glow-orb-2 -bottom-20 -right-20" />

      <Card className="w-full max-w-md border border-slate-800 p-8 rounded-3xl relative z-10 animate-scale-in">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-white font-heading text-xl shadow-lg shadow-purple-500/20 mb-3">
            S
          </div>
          <h2 className="text-2xl font-bold font-heading text-slate-100">SDC HR Solutions</h2>
          <p className="text-xs text-slate-500 font-medium tracking-wide mt-1 uppercase">Precision Workforce Intelligence</p>
        </div>

        {lockoutTimeLeft > 0 ? (
          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/20 text-rose-400 text-xs leading-relaxed text-center mb-4">
            ⚠️ Security Threshold Exceeded. Lockout active. Please wait{" "}
            <span className="font-bold">{lockoutTimeLeft}</span> seconds before retrying.
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Corporate Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="name@sdchr.solutions"
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Select
            label="Corporate Role Profile"
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            options={[
              { value: 'super_admin', label: 'Super Admin (Full Tenant Override)' },
              { value: 'admin', label: 'Admin (System Configuration)' },
              { value: 'hr', label: 'HR Manager (Recruitment & Operations)' },
              { value: 'manager', label: 'Line Manager (Approvals)' },
              { value: 'employee', label: 'Standard Employee Self-Service' }
            ]}
          />

          <div className="flex justify-between items-center text-xs mt-1">
            <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer select-none">
              <input type="checkbox" defaultChecked className="rounded border-slate-700 bg-slate-900 text-purple-600 focus:ring-purple-500" />
              Remember this station
            </label>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-purple-400 hover:text-purple-300 font-semibold cursor-pointer"
            >
              Forgot Password?
            </button>
          </div>

          <Button
            type="submit"
            isLoading={loading}
            className="w-full py-3 rounded-xl mt-4 font-semibold text-sm bg-gradient-to-r from-purple-600 to-indigo-600"
          >
            Authenticate Credentials
          </Button>
        </form>

        {failedAttempts > 0 && lockoutTimeLeft === 0 ? (
          <p className="text-[10px] text-slate-500 text-center mt-4">
            Security Logging active: {failedAttempts} consecutive failed login attempts detected. Lockout at 5.
          </p>
        ) : null}
      </Card>
    </div>
  );
};
export default LoginPage;
