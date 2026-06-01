/* ================================================================
   SDC HR Solutions — Global Application Router
   Maps all lazy-loaded corporate pages and wraps them in guards.
   ================================================================ */

import React, { lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthGuard } from './components/guards/AuthGuard';
import { FeatureFlagGuard } from './components/guards/FeatureFlagGuard';
import { AppLayout } from './components/layout/AppLayout';

// Lazy load pages for code splitting & premium performance
const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const EmployeesPage = lazy(() => import('./pages/EmployeesPage'));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'));
const LettersPage = lazy(() => import('./pages/LettersPage'));
const AttendancePage = lazy(() => import('./pages/AttendancePage'));
const LeavePage = lazy(() => import('./pages/LeavePage'));
const PayrollPage = lazy(() => import('./pages/PayrollPage'));
const SettlementPage = lazy(() => import('./pages/SettlementPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const ConfigPage = lazy(() => import('./pages/ConfigPage'));

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Login Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Corporate Core Routes */}
        <Route path="/" element={<AuthGuard><AppLayout /></AuthGuard>}>
          <Route index element={<DashboardPage />} />
          <Route path="employees" element={<EmployeesPage />} />
          <Route path="onboarding" element={<OnboardingPage />} />
          <Route path="letters" element={<LettersPage />} />
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="leaves" element={<LeavePage />} />
          <Route path="payroll" element={<PayrollPage />} />
          <Route path="settlement" element={<SettlementPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="config" element={<ConfigPage />} />

          {/* Premium modules wrapped with first-class FeatureFlagGuards */}
          <Route 
            path="performance" 
            element={
              <FeatureFlagGuard flag="performance_appraisal">
                <div className="p-6">Performance appraisal module loaded successfully.</div>
              </FeatureFlagGuard>
            } 
          />
          <Route 
            path="training" 
            element={
              <FeatureFlagGuard flag="training_development">
                <div className="p-6">Training & development module loaded successfully.</div>
              </FeatureFlagGuard>
            } 
          />
          <Route 
            path="recruitment" 
            element={
              <FeatureFlagGuard flag="recruitment_pipeline">
                <div className="p-6">Recruitment pipeline module loaded successfully.</div>
              </FeatureFlagGuard>
            } 
          />
          <Route 
            path="assets" 
            element={
              <FeatureFlagGuard flag="asset_management">
                <div className="p-6">Asset management module loaded successfully.</div>
              </FeatureFlagGuard>
            } 
          />
          <Route 
            path="ai-talent" 
            element={
              <FeatureFlagGuard flag="ai_talent_intelligence">
                <div className="p-6">AG Talent IQ Assistant loaded successfully.</div>
              </FeatureFlagGuard>
            } 
          />
        </Route>

        {/* Global Fallback Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
export default AppRouter;
