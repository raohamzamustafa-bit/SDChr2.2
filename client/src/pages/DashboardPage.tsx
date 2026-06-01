/* ================================================================
   SDC HR Solutions — Executive Intelligence Dashboard
   Aggregates live operational counters and presents locked Tier 2 widgets.
   ================================================================ */

import React from 'react';
import { Card, StatCard, Badge, Button } from '../components/ui';
import { useAuthStore } from '../store/authStore';
import { useEmployeeStore } from '../store/employeeStore';
import { useAttendanceStore } from '../store/attendanceStore';
import { useLeaveStore } from '../store/leaveStore';
import { usePayrollStore } from '../store/payrollStore';
import { 
  Users, 
  CalendarCheck, 
  Clock, 
  Wallet, 
  Lock, 
  Sparkles, 
  TrendingUp, 
  Gift, 
  AlertTriangle 
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const employees = useEmployeeStore((state) => state.employees);
  const attendance = useAttendanceStore((state) => state.records);
  const leaves = useLeaveStore((state) => state.leaveRequests);
  const payrolls = usePayrollStore((state) => state.payrollRuns);

  // Live Calculations
  const totalEmployees = employees.length;
  const activeLeaves = leaves.filter(r => r.status === 'approved' || r.status.startsWith('pending')).length;
  const pendingLeaves = leaves.filter(r => r.status === 'pending_tl' || r.status.startsWith('pending_')).length;
  
  const todayStr = new Date().toISOString().split('T')[0];
  const presentToday = attendance.filter(r => r.date === todayStr && r.status === 'present').length;
  const attendancePercentage = totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 100;

  // Mock Payroll MTD standard calculations
  const totalPayrollMTD = payrolls.length > 0 ? payrolls[0].total_net : 2480000;

  // Analytics Chart mock data
  const attendanceTrendData = [
    { name: 'Mon', Present: 92 },
    { name: 'Tue', Present: 95 },
    { name: 'Wed', Present: 98 },
    { name: 'Thu', Present: 94 },
    { name: 'Fri', Present: 90 },
    { name: 'Sat', Present: 88 },
  ];

  const deptHeadcountData = [
    { name: 'Engineering', Headcount: 12 },
    { name: 'Human Resource', Headcount: 4 },
    { name: 'Finance & Accounts', Headcount: 3 },
    { name: 'Marketing', Headcount: 6 },
  ];

  return (
    <div className="flex flex-col gap-6">
      
      {/* Top Banner Greeting */}
      <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-heading text-slate-100 tracking-tight">
            Welcome Back, {user?.name || "HR Executive"}
          </h1>
          <p className="text-sm text-slate-400 mt-1 leading-relaxed">
            Corporate Operations Hub for SDC HR Solutions. Here is today's localized UTC operational status.
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="purple" className="px-3 py-1 text-xs">
            UTC Localized Clock
          </Badge>
          <Badge variant="success" className="px-3 py-1 text-xs">
            System Synchronized
          </Badge>
        </div>
      </div>

      {/* Primary KPI Metrics Deck */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Headcount"
          value={totalEmployees}
          trend="4.2%"
          trendType="up"
          icon={<Users size={20} />}
        />
        <StatCard
          title="Attendance Score"
          value={`${attendancePercentage}%`}
          trend="1.8%"
          trendType="up"
          icon={<CalendarCheck size={20} />}
        />
        <StatCard
          title="Pending Leave Approvals"
          value={pendingLeaves}
          trend={`${activeLeaves} Active`}
          trendType="neutral"
          icon={<Clock size={20} />}
        />
        <StatCard
          title="Payroll Disbursed MTD"
          value={`PKR ${totalPayrollMTD.toLocaleString()}`}
          trend="Budget balanced"
          trendType="neutral"
          icon={<Wallet size={20} />}
        />
      </div>

      {/* Two-Column Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Attendance Trends */}
        <Card className="lg:col-span-2 flex flex-col justify-between min-h-[340px] border border-slate-800/40">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold font-heading text-slate-200 uppercase tracking-wider">Attendance Frequency (7-day trend)</h3>
            <Badge variant="info">Live Sync</Badge>
          </div>
          <div className="flex-1 w-full min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceTrendData}>
                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={[80, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                <Line type="monotone" dataKey="Present" stroke="#8b5cf6" strokeWidth={3} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Headcount breakdown by Department */}
        <Card className="flex flex-col justify-between min-h-[340px] border border-slate-800/40">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold font-heading text-slate-200 uppercase tracking-wider">Dept distribution</h3>
            <Badge variant="purple">Headcount</Badge>
          </div>
          <div className="flex-1 w-full min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptHeadcountData}>
                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={9} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                <Bar dataKey="Headcount" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Locked Tier 2/3 Feature Preview Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={18} className="text-purple-400" />
          <h2 className="text-lg font-bold font-heading text-slate-200">SDC Pro Subscription Modules Available</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <Card className="border border-slate-800/60 p-6 flex flex-col justify-between opacity-70 bg-slate-950/20 relative group hover:opacity-92 transition-all">
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
                <Lock size={18} />
              </div>
              <h3 className="text-base font-bold font-heading text-slate-100 mb-2">Performance Appraisal Engine</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Deploy 360-degree reviews, self-appraisals, corporate objective maps, and KPI linked payroll bonuses.
              </p>
            </div>
            <Button variant="secondary" className="w-full py-2 rounded-xl text-xs" onClick={() => alert("Stripe Subscription required. Contact sales@sdchr.solutions to unlock PRO.")}>
              Upgrade Workspace
            </Button>
          </Card>

          <Card className="border border-slate-800/60 p-6 flex flex-col justify-between opacity-70 bg-slate-950/20 relative group hover:opacity-92 transition-all">
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
                <Lock size={18} />
              </div>
              <h3 className="text-base font-bold font-heading text-slate-100 mb-2">Active ATS Recruitment Pipeline</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Manage online job openings, applicant databases, visual interview stages, and automatic offers.
              </p>
            </div>
            <Button variant="secondary" className="w-full py-2 rounded-xl text-xs" onClick={() => alert("Stripe Subscription required. Contact sales@sdchr.solutions to unlock PRO.")}>
              Upgrade Workspace
            </Button>
          </Card>

          <Card className="border border-slate-800/60 p-6 flex flex-col justify-between opacity-70 bg-slate-950/20 relative group hover:opacity-92 transition-all">
            <div>
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center mb-4">
                <Lock size={18} />
              </div>
              <h3 className="text-base font-bold font-heading text-slate-100 mb-2">Advanced HR BI Analytics</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Review dynamic reports on corporate attrition rates, hiring cost matrices, and department budgets.
              </p>
            </div>
            <Button variant="secondary" className="w-full py-2 rounded-xl text-xs" onClick={() => alert("Stripe Subscription required. Contact sales@sdchr.solutions to unlock PRO.")}>
              Upgrade Workspace
            </Button>
          </Card>

        </div>
      </div>
    </div>
  );
};
export default DashboardPage;
