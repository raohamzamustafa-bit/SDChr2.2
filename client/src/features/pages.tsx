import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Card, Button, Input, Badge, StatCard, Modal } from '../components/ui/index';
import {
  Users,
  Calendar,
  DollarSign,
  FileText,
  TrendingUp,
  Award,
  Sparkles,
  Zap,
  CheckCircle2,
  Lock,
  Plus,
  Trash2,
  Eye,
  Check,
  X,
  Play,
  Download,
  AlertCircle,
  Star,
  Upload,
  Briefcase,
  Globe,
  Edit,
  Copy,
  UserPlus
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie } from 'recharts';

// ==========================================
// 1. LOGIN PAGE
// ==========================================
export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@hrms.io');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(async () => {
      await login(email, password);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="bg-glow-orb-1 top-10 left-10" />
      <div className="bg-glow-orb-2 bottom-10 right-10" />
      
      <Card className="w-full max-w-md p-8 relative z-10 border border-slate-800/80 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-extrabold text-white text-xl shadow-xl shadow-purple-500/25 mb-4">
            AG
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-100 font-heading">Welcome Back</h2>
          <p className="text-xs text-slate-400 mt-1.5 font-medium">HRMS Enterprise Core Platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="name@company.com"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />
          
          <Button type="submit" className="w-full mt-2" isLoading={loading}>
            Sign In to Dashboard
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-800/60 text-center">
          <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">
            Powered by Anti Gravity Ecosystem
          </span>
        </div>
      </Card>
    </div>
  );
};

// ==========================================
// 2. DASHBOARD PAGE
// ==========================================
export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  
  // High fidelity chart demo data
  const attendanceTrend = [
    { name: 'Jan', rate: 96.5 },
    { name: 'Feb', rate: 98.0 },
    { name: 'Mar', rate: 97.2 },
    { name: 'Apr', rate: 99.1 },
    { name: 'May', rate: 98.7 },
  ];

  const departmentCounts = [
    { name: 'IT', count: 12, fill: '#8b5cf6' },
    { name: 'HR', count: 4, fill: '#6366f1' },
    { name: 'Finance', count: 3, fill: '#ec4899' },
    { name: 'Admin', count: 5, fill: '#14b8a6' },
  ];

  // AI Assistant States
  const [assistantPrompt, setAssistantPrompt] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');

  const handleAskAssistant = (promptText?: string) => {
    const finalPrompt = promptText || assistantPrompt || 'Write Maternity Leave Policy for Pakistan';
    setAssistantPrompt(finalPrompt);
    setIsModalOpen(true);
    setAiLoading(true);
    setAiResponse('');

    setTimeout(() => {
      setAiLoading(false);
      const text = finalPrompt.toLowerCase();
      if (text.includes('maternity') || text.includes('leave') || text.includes('policy')) {
        setAiResponse(`### 🇵🇰 Maternity Leave Policy (Statutory PK Labor Compliance)

Pursuant to the **Provincial Maternity Benefit Acts** (and federal guidelines), female employees are entitled to statutory paid leave.

1. **Duration:** 90 calendar days of fully paid maternity leave.
2. **Eligibility:** Minimum of 4 months continuous service prior to delivery date.
3. **Salary Benefit:** 100% of the last-drawn gross salary, disbursed in standard payroll cycles.
4. **Notice Obligation:** Written application submitted at least 4 weeks prior to the expected commencement of confinement.
5. **No-Dismissal Protection:** Standard protection prevents termination during or immediately surrounding maternity leave.`);
      } else if (text.includes('eobi') || text.includes('contract') || text.includes('fund') || text.includes('compliance')) {
        setAiResponse(`### 📜 Statutory Employment Agreement - EOBI & PF Clause

*Add this standard compliant section to your official employment letters:*

> **Clause 7: Statutory Benefit Deductions**
> 
> A. **Employees Old-Age Benefits Institution (EOBI):** The Employee shall be registered under the EOBI Act 1976. The Employer shall contribute the statutory 5% of the minimum wage, and the Employee shall contribute 1% (currently PKR 320 per month) via monthly payroll deduction.
> 
> B. **Provident Fund:** Upon successful probation, the Employee shall join the R Solutions Provident Fund Scheme. The Employee and Employer shall contribute an equal amount of 8.33% of the basic salary per month.`);
      } else {
        setAiResponse(`### 🎯 Custom Performance Objectives (KPIs) - Software Engineer

Based on your prompt, here is a highly specific, measurable performance review matrix:

1. **Code Execution & Delivery (40% Weight):** Optimize client-side React bundle sizes by 30% through modular dynamic imports and code-splitting under Vite/React.
2. **Quality & Standard Compliance (30% Weight):** Secure 90%+ code coverage on core components (Zustand store managers, Axios interceptors).
3. **Agile & Team Contribution (30% Weight):** Mentor 2 junior developers on RTL UI responsiveness and Tailwind v4 layouts.`);
      }
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight font-heading">
            Assalam-o-Alaikum, {user?.firstName || 'HR Officer'}
          </h1>
          <p className="text-slate-400 text-sm mt-1">Here is a snapshot of R Solutions Pakistan today.</p>
        </div>
        <Badge variant="purple" className="py-1 px-3.5 text-xs font-bold border-purple-500/30">
          ✨ Demo Sandbox Active (Enterprise Unlocked)
        </Badge>
      </div>

      {/* KPI Stats Block */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Total Employees" value="24" trend="12% up" trendType="up" icon={<Users size={18} />} />
        <StatCard title="Attendance Today" value="95.8%" trend="1.2% up" trendType="up" icon={<Calendar size={18} />} />
        <StatCard title="Pending Leaves" value="3" trend="1 down" trendType="down" icon={<FileText size={18} />} />
        <StatCard title="This Month Payroll" value="PKR 1.84M" trend="5% up" trendType="up" icon={<DollarSign size={18} />} />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border border-slate-800/40">
          <h3 className="text-sm font-bold text-slate-200 mb-4 font-heading">Attendance Performance Trend (%)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceTrend}>
                <defs>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis domain={[90, 100]} stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }} />
                <Area type="monotone" dataKey="rate" stroke="#8b5cf6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRate)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="border border-slate-800/40">
          <h3 className="text-sm font-bold text-slate-200 mb-4 font-heading">Departments Strength</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentCounts}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {departmentCounts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Quick Action & Recent Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-slate-800/40">
          <h3 className="text-sm font-bold text-slate-200 mb-3.5 font-heading">Recent Administrative Activity</h3>
          <div className="space-y-4">
            <div className="flex gap-3">
              <CheckCircle2 className="text-purple-400 shrink-0 mt-0.5" size={15} />
              <div>
                <p className="text-xs font-bold text-slate-200">Payroll run generated for May 2026</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Calculated total payroll PKR 1.84M across 24 active employee profiles.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle2 className="text-purple-400 shrink-0 mt-0.5" size={15} />
              <div>
                <p className="text-xs font-bold text-slate-200">Leave balance allocations auto-updated</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Refreshed casual and annual leave ledgers for PK labor compliance guidelines.</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="border border-slate-800/40 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl" />
          <h3 className="text-sm font-bold text-slate-200 mb-2 font-heading">AG Talent IQ Assistant</h3>
          <p className="text-xs text-slate-400 mb-4">Ask AG assistant to write HR policies, evaluate performance, or generate labor compliance contracts instantly.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAskAssistant();
            }}
            className="flex gap-2"
          >
            <Input
              placeholder="Draft Maternity Leave Policy..."
              className="flex-1"
              value={assistantPrompt}
              onChange={(e) => setAssistantPrompt(e.target.value)}
            />
            <Button type="submit" variant="primary" className="py-2.5 px-4"><Zap size={14} /></Button>
          </form>
        </Card>
      </div>

      {/* AI Assistant Chat Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="AG Talent IQ Assistant - AI Console">
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs text-slate-300">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 block mb-1">Your Instruction:</span>
            <p className="italic">"{assistantPrompt || 'Draft Maternity Leave Policy'}"</p>
          </div>

          <div className="p-5 rounded-xl bg-slate-950/80 border border-purple-500/10 text-xs leading-relaxed max-h-96 overflow-y-auto font-sans relative min-h-[120px]">
            {aiLoading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <span className="w-8 h-8 border-3 border-purple-500/10 border-t-purple-500 rounded-full animate-spin" />
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest animate-pulse">AG Engine Consulting Legal Slabs...</span>
              </div>
            ) : (
              <div className="prose prose-invert max-w-none text-slate-300 whitespace-pre-wrap">
                {aiResponse}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="flex-1 text-xs"
              onClick={() => {
                navigator.clipboard.writeText(aiResponse);
                alert('Copied to clipboard!');
              }}
              disabled={aiLoading}
            >
              <Copy size={13} className="mr-1.5 inline" /> Copy Response
            </Button>
            <Button
              variant="primary"
              className="flex-1 text-xs"
              onClick={() => {
                setIsModalOpen(false);
              }}
            >
              Close Console
            </Button>
          </div>

          {/* Quick Prompt Templates */}
          <div className="pt-2 border-t border-slate-800/60">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Try compliance template prompts:</span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleAskAssistant('Write Maternity Leave Policy for Pakistan')}
                className="text-[10px] bg-slate-900 border border-slate-800 text-slate-300 hover:text-purple-400 hover:border-purple-500/30 px-3 py-1.5 rounded-lg transition-all text-left"
              >
                👶 Maternity Leave Policy (Statutory)
              </button>
              <button
                type="button"
                onClick={() => handleAskAssistant('Draft EOBI and Provident Fund contract clause')}
                className="text-[10px] bg-slate-900 border border-slate-800 text-slate-300 hover:text-purple-400 hover:border-purple-500/30 px-3 py-1.5 rounded-lg transition-all text-left"
              >
                📜 EOBI & PF Agreement Clauses
              </button>
              <button
                type="button"
                onClick={() => handleAskAssistant('KPI performance targets for Lead Frontend Developer')}
                className="text-[10px] bg-slate-900 border border-slate-800 text-slate-300 hover:text-purple-400 hover:border-purple-500/30 px-3 py-1.5 rounded-lg transition-all text-left"
              >
                🎯 KPI Objective Review Goals
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// ==========================================
// 3. EMPLOYEES PAGE (LIST & ADD)
// ==========================================
export const EmployeeListPage: React.FC = () => {
  const [employees, setEmployees] = useState([
    { id: '1', code: 'EMP001', name: 'Tariq Imran', department: 'IT Operations', designation: 'Sr. Solutions Architect', status: 'active', wage: 'PKR 145,000' },
    { id: '2', code: 'EMP002', name: 'Ayesha Khan', department: 'Human Resources', designation: 'HR Director', status: 'active', wage: 'PKR 120,000' },
    { id: '3', code: 'EMP003', name: 'Imran Ali', department: 'Finance & Compliance', designation: 'Senior Accountant', status: 'active', wage: 'PKR 95,000' },
    { id: '4', code: 'EMP004', name: 'Zainab Fatima', department: 'IT Operations', designation: 'Frontend Lead', status: 'active', wage: 'PKR 110,000' },
    { id: '5', code: 'EMP005', name: 'Bilal Ahmed', department: 'Administration', designation: 'Facilities Officer', status: 'active', wage: 'PKR 45,000' },
  ]);

  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [dept, setDept] = useState('IT Operations');
  const [desg, setDesg] = useState('Software Engineer');
  const [wage, setWage] = useState('80000');

  const handleAdd = () => {
    if (!name) return;
    const newEmp = {
      id: String(employees.length + 1),
      code: `EMP0${employees.length + 1}`,
      name,
      department: dept,
      designation: desg,
      status: 'active',
      wage: `PKR ${Number(wage).toLocaleString()}`,
    };
    setEmployees([...employees, newEmp]);
    setName('');
    setIsOpen(false);
  };

  const handleDelete = (id: string) => {
    setEmployees(employees.filter(e => e.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 font-heading">Employee Directory</h1>
          <p className="text-slate-400 text-xs mt-1">Manage personnel records, roles, departments, and payroll details.</p>
        </div>
        <Button onClick={() => setIsOpen(true)} className="gap-2.5">
          <Plus size={15} /> Add Employee
        </Button>
      </div>

      <Card className="border border-slate-800/40 p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-4">Code</th>
                <th className="p-4">Employee Name</th>
                <th className="p-4">Department</th>
                <th className="p-4">Job Designation</th>
                <th className="p-4">Base Wage</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300 font-medium">
              {employees.map(emp => (
                <tr key={emp.id} className="hover:bg-slate-850/30 transition-colors">
                  <td className="p-4 font-bold text-purple-400">{emp.code}</td>
                  <td className="p-4 font-semibold text-slate-100">{emp.name}</td>
                  <td className="p-4 text-slate-300">{emp.department}</td>
                  <td className="p-4 text-slate-400">{emp.designation}</td>
                  <td className="p-4 font-bold text-slate-200">{emp.wage}</td>
                  <td className="p-4">
                    <Badge variant="success">{emp.status}</Badge>
                  </td>
                  <td className="p-4 flex items-center justify-center gap-2">
                    <button className="p-2 text-slate-400 hover:text-purple-400 rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer">
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(emp.id)}
                      className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Register New Employee">
        <div className="space-y-4">
          <Input label="Full Name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Tariq Imran" />
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-300">Department</label>
              <select
                value={dept}
                onChange={e => setDept(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-xs"
              >
                <option value="IT Operations">IT Operations</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Finance & Compliance">Finance & Compliance</option>
                <option value="Administration">Administration</option>
              </select>
            </div>
            <Input label="Designation" value={desg} onChange={e => setDesg(e.target.value)} placeholder="e.g. Lead Engineer" />
          </div>
          <Input label="Monthly Base Salary (PKR)" type="number" value={wage} onChange={e => setWage(e.target.value)} />
          <div className="flex justify-end gap-3 mt-5">
            <Button variant="secondary" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Save Profile</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// ==========================================
// 4. ATTENDANCE PAGE
// ==========================================
export const AttendancePage: React.FC = () => {
  const [attendance, setAttendance] = useState([
    { id: '1', name: 'Tariq Imran', date: '2026-05-28', checkIn: '09:02:15', checkOut: '17:30:10', status: 'present' },
    { id: '2', name: 'Ayesha Khan', date: '2026-05-28', checkIn: '08:55:00', checkOut: '17:05:00', status: 'present' },
    { id: '3', name: 'Imran Ali', date: '2026-05-28', checkIn: '09:18:25', checkOut: '17:15:00', status: 'late' },
    { id: '4', name: 'Zainab Fatima', date: '2026-05-28', checkIn: '09:05:00', checkOut: '17:35:10', status: 'present' },
  ]);

  const [isOpen, setIsOpen] = useState(false);
  const [empName, setEmpName] = useState('Tariq Imran');
  const [checkIn, setCheckIn] = useState('09:00:00');
  const [checkOut, setCheckOut] = useState('17:00:00');
  const [status, setStatus] = useState('present');

  const handlePunch = () => {
    const newPunch = {
      id: String(attendance.length + 1),
      name: empName,
      date: new Date().toISOString().split('T')[0],
      checkIn,
      checkOut,
      status,
    };
    setAttendance([newPunch, ...attendance]);
    setIsOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 font-heading">Attendance Logging</h1>
          <p className="text-slate-400 text-xs mt-1">Biometric polling logs, check-ins, late penalties, and shifts.</p>
        </div>
        <Button onClick={() => setIsOpen(true)} className="gap-2.5">
          <Plus size={15} /> Manual Entry
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border border-slate-800/40 p-0 overflow-hidden">
          <div className="p-5 border-b border-slate-800/60 bg-slate-900/10 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-200 font-heading">Today's Check-In Log</h3>
            <Badge variant="purple">Date: 28 May 2026</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-4">Employee</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Check-In</th>
                  <th className="p-4">Check-Out</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 font-medium">
                {attendance.map(row => (
                  <tr key={row.id} className="hover:bg-slate-850/30 transition-colors">
                    <td className="p-4 font-bold text-slate-100">{row.name}</td>
                    <td className="p-4 text-slate-400">{row.date}</td>
                    <td className="p-4 font-semibold text-slate-200">{row.checkIn || '--:--'}</td>
                    <td className="p-4 font-semibold text-slate-400">{row.checkOut || '--:--'}</td>
                    <td className="p-4">
                      <Badge variant={row.status === 'present' ? 'success' : 'warning'}>
                        {row.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="border border-slate-800/40">
          <h3 className="text-sm font-bold text-slate-200 mb-4 font-heading">Active Shift Settings</h3>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-slate-200">Standard Shift A</p>
                <p className="text-[10px] text-slate-400 mt-0.5">09:00 AM — 05:00 PM</p>
              </div>
              <Badge variant="purple">Default</Badge>
            </div>
            <div className="space-y-2.5 text-[11px] text-slate-400">
              <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                <span>Grace Threshold</span>
                <span className="font-bold text-slate-200">15 mins</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                <span>Half-Day Cutoff</span>
                <span className="font-bold text-slate-200">120 mins late</span>
              </div>
              <div className="flex justify-between">
                <span>Overtime Logic</span>
                <span className="font-bold text-slate-200">1.5x after 5:00 PM</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Manual Punch Entry">
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-300">Select Employee</label>
            <select
              value={empName}
              onChange={e => setEmpName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-xs"
            >
              <option value="Tariq Imran">Tariq Imran</option>
              <option value="Ayesha Khan">Ayesha Khan</option>
              <option value="Imran Ali">Imran Ali</option>
              <option value="Zainab Fatima">Zainab Fatima</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Check In Time" value={checkIn} onChange={e => setCheckIn(e.target.value)} />
            <Input label="Check Out Time" value={checkOut} onChange={e => setCheckOut(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-300">Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-xs"
            >
              <option value="present">Present</option>
              <option value="late">Late</option>
              <option value="half_day">Half Day</option>
              <option value="on_leave">On Leave</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 mt-5">
            <Button variant="secondary" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={handlePunch}>Save Punch</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// ==========================================
// 5. LEAVES PAGE
// ==========================================
export const LeavesPage: React.FC = () => {
  const [requests, setRequests] = useState([
    { id: '1', name: 'Imran Ali', type: 'Casual Leave', days: '2 days', dates: 'May 30 - May 31', status: 'pending', reason: 'Personal work' },
    { id: '2', name: 'Zainab Fatima', type: 'Annual Leave', days: '5 days', dates: 'June 05 - June 10', status: 'approved', reason: 'Family vacation' },
  ]);

  const [isOpen, setIsOpen] = useState(false);
  const [empName, setEmpName] = useState('Tariq Imran');
  const [type, setType] = useState('Casual Leave');
  const [days, setDays] = useState('1 day');
  const [dates, setDates] = useState('May 29 - May 29');
  const [reason, setReason] = useState('');

  const handleApply = () => {
    const newReq = {
      id: String(requests.length + 1),
      name: empName,
      type,
      days,
      dates,
      status: 'pending',
      reason,
    };
    setRequests([newReq, ...requests]);
    setIsOpen(false);
    setReason('');
  };

  const handleApprove = (id: string, action: 'approved' | 'rejected') => {
    setRequests(requests.map(r => r.id === id ? { ...r, status: action } : r));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 font-heading">Leave Administration</h1>
          <p className="text-slate-400 text-xs mt-1">Manage annual, sick, and casual leave quotas and review requests.</p>
        </div>
        <Button onClick={() => setIsOpen(true)} className="gap-2.5">
          <Plus size={15} /> Request Leave
        </Button>
      </div>

      {/* Leave Quotas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="border border-slate-850/60">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Annual Leaves Balance</span>
          <h2 className="text-3xl font-extrabold text-purple-400 mt-2 font-heading">14 Days</h2>
          <p className="text-[10px] text-slate-500 mt-1 font-semibold">Allocated: 14 | Used: 0</p>
        </Card>
        <Card className="border border-slate-850/60">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Casual Leaves Balance</span>
          <h2 className="text-3xl font-extrabold text-indigo-400 mt-2 font-heading">10 Days</h2>
          <p className="text-[10px] text-slate-500 mt-1 font-semibold">Allocated: 10 | Used: 2</p>
        </Card>
        <Card className="border border-slate-850/60">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sick Leaves Balance</span>
          <h2 className="text-3xl font-extrabold text-pink-400 mt-2 font-heading">8 Days</h2>
          <p className="text-[10px] text-slate-500 mt-1 font-semibold">Allocated: 8 | Used: 0</p>
        </Card>
      </div>

      {/* Requests Queue */}
      <Card className="border border-slate-800/40 p-0 overflow-hidden">
        <div className="p-5 border-b border-slate-800/60 bg-slate-900/10 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-200 font-heading">Leave Applications Queue</h3>
          <Badge variant="purple">Action Required</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-4">Employee</th>
                <th className="p-4">Leave Type</th>
                <th className="p-4">Duration</th>
                <th className="p-4">Dates</th>
                <th className="p-4">Reason</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Review Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300 font-medium">
              {requests.map(row => (
                <tr key={row.id} className="hover:bg-slate-850/30 transition-colors">
                  <td className="p-4 font-bold text-slate-100">{row.name}</td>
                  <td className="p-4 text-slate-400">{row.type}</td>
                  <td className="p-4 text-slate-200 font-semibold">{row.days}</td>
                  <td className="p-4 text-slate-300 font-semibold">{row.dates}</td>
                  <td className="p-4 text-slate-400 italic">"{row.reason}"</td>
                  <td className="p-4">
                    <Badge variant={row.status === 'approved' ? 'success' : row.status === 'pending' ? 'warning' : 'error'}>
                      {row.status}
                    </Badge>
                  </td>
                  <td className="p-4 flex items-center justify-center gap-1.5">
                    {row.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleApprove(row.id, 'approved')}
                          className="p-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 rounded-md hover:bg-emerald-500/20 transition-all cursor-pointer"
                        >
                          <Check size={13} />
                        </button>
                        <button
                          onClick={() => handleApprove(row.id, 'rejected')}
                          className="p-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/25 rounded-md hover:bg-rose-500/20 transition-all cursor-pointer"
                        >
                          <X size={13} />
                        </button>
                      </>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Reviewed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Submit Leave Request">
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-300">Select Employee</label>
            <select
              value={empName}
              onChange={e => setEmpName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-xs"
            >
              <option value="Tariq Imran">Tariq Imran</option>
              <option value="Ayesha Khan">Ayesha Khan</option>
              <option value="Imran Ali">Imran Ali</option>
              <option value="Zainab Fatima">Zainab Fatima</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-300">Leave Type</label>
              <select
                value={type}
                onChange={e => setType(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-xs"
              >
                <option value="Annual Leave">Annual Leave</option>
                <option value="Casual Leave">Casual Leave</option>
                <option value="Sick Leave">Sick Leave</option>
              </select>
            </div>
            <Input label="Days" value={days} onChange={e => setDays(e.target.value)} placeholder="e.g. 1 day" />
          </div>
          <Input label="Dates" value={dates} onChange={e => setDates(e.target.value)} placeholder="e.g. May 29 - May 29" />
          <Input label="Reason for Leave" value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Personal work" />
          <div className="flex justify-end gap-3 mt-5">
            <Button variant="secondary" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={handleApply}>Submit Request</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// ==========================================
// 6. PAYROLL PAGE
// ==========================================
export const PayrollPage: React.FC = () => {
  const [runs, setRuns] = useState([
    { id: '1', period: '2026-05', gross: 'PKR 1,840,000', deduct: 'PKR 142,000', net: 'PKR 1,698,000', status: 'approved' },
    { id: '2', period: '2026-04', gross: 'PKR 1,810,000', deduct: 'PKR 139,000', net: 'PKR 1,671,000', status: 'approved' },
  ]);

  const [wizardOpen, setWizardOpen] = useState(false);
  const [period, setPeriod] = useState('2026-06');
  const [calculating, setCalculating] = useState(false);

  // Payslip states
  const [payslipModalOpen, setPayslipModalOpen] = useState(false);
  const [selectedRun, setSelectedRun] = useState<any>(null);

  const handleRunPayroll = () => {
    setCalculating(true);
    setTimeout(() => {
      const newRun = {
        id: String(runs.length + 1),
        period,
        gross: 'PKR 1,850,000',
        deduct: 'PKR 145,000',
        net: 'PKR 1,705,000',
        status: 'calculated',
      };
      setRuns([newRun, ...runs]);
      setCalculating(false);
      setWizardOpen(false);
    }, 1500);
  };

  const handleApprove = (id: string) => {
    setRuns(runs.map(r => r.id === id ? { ...r, status: 'approved' } : r));
  };

  const downloadPayslipFile = (run: any) => {
    const payslipHtml = `
=========================================
        SALARY PAYSLIP - R SOLUTIONS
=========================================
Month: ${run.period}
Employee Name: Tariq Imran
Employee Code: EMP001
Designation: Sr. Solutions Architect
Department: IT Operations

EARNINGS BREAKDOWN:
-----------------------------------------
Basic Monthly Wage:      PKR 145,000
House Rent Allowance:     PKR 65,250
Medical Allowance:       PKR 21,750
Gross Salary:            PKR 232,000

STATUTORY DEDUCTIONS (PK COMPLIANCE):
-----------------------------------------
EOBI social contribution: PKR 320
Provident Fund (8.33%):   PKR 12,078
Professional Income Tax:  PKR 6,500
Total Deductions:        PKR 18,898

NET PAYOUT TRANSFER:     PKR 213,102
=========================================
Authorized Signature: Tariq Imran, MD
R Solutions Pakistan.
`;
    const element = document.createElement("a");
    const file = new Blob([payslipHtml], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `Payslip_Tariq_Imran_${run.period}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 font-heading">Payroll Management</h1>
          <p className="text-slate-400 text-xs mt-1">Run monthly salaries, compute EOBI/PF compliance, and print payslips.</p>
        </div>
        <Button onClick={() => setWizardOpen(true)} className="gap-2.5">
          <Play size={14} className="fill-current" /> Run Payroll Wizard
        </Button>
      </div>

      {/* Salary assignment table overview */}
      <div className="grid grid-cols-1 gap-6">
        <Card className="border border-slate-800/40 p-0 overflow-hidden">
          <div className="p-5 border-b border-slate-800/60 bg-slate-900/10 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 font-heading">Monthly Payroll Batches</h3>
            <Badge variant="purple">Historical Records</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-4">Billing Month</th>
                  <th className="p-4">Total Gross Salaries</th>
                  <th className="p-4">Total Deductions (EOBI/PF/Tax)</th>
                  <th className="p-4">Total Net Payout</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Payroll Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 font-medium">
                {runs.map(row => (
                  <tr key={row.id} className="hover:bg-slate-850/30 transition-colors">
                    <td className="p-4 font-bold text-purple-400">{row.period}</td>
                    <td className="p-4 font-semibold text-slate-100">{row.gross}</td>
                    <td className="p-4 text-rose-400 font-bold">{row.deduct}</td>
                    <td className="p-4 text-emerald-400 font-extrabold">{row.net}</td>
                    <td className="p-4">
                      <Badge variant={row.status === 'approved' ? 'success' : 'warning'}>
                        {row.status}
                      </Badge>
                    </td>
                    <td className="p-4 flex items-center justify-center gap-2">
                      {row.status === 'calculated' ? (
                        <Button variant="primary" className="py-1 px-2.5 text-[10px]" onClick={() => handleApprove(row.id)}>
                          Approve & Release
                        </Button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedRun(row);
                            setPayslipModalOpen(true);
                          }}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 text-slate-300 border border-slate-700/50 rounded-lg hover:text-white hover:border-purple-500/35 transition-colors cursor-pointer select-none text-[10px]"
                        >
                          <Eye size={11} className="text-purple-400" /> View Payslips
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Modal isOpen={wizardOpen} onClose={() => setWizardOpen(false)} title="Calculate Monthly Salaries">
        <div className="space-y-4">
          <Input label="Select Billing Period (YYYY-MM)" value={period} onChange={e => setPeriod(e.target.value)} />
          
          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/25 flex gap-3 text-xs">
            <AlertCircle className="text-purple-400 shrink-0" size={16} />
            <div className="text-purple-300 font-medium leading-relaxed">
              Applying native <strong>Pakistan compliance formulas</strong>: EOBI (PKR 320 employee contribution), Provident Fund (8.33% deduction), and income tax slabs (FY 2024-25).
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-5">
            <Button variant="secondary" onClick={() => setWizardOpen(false)}>Cancel</Button>
            <Button onClick={handleRunPayroll} isLoading={calculating}>Execute Salary Calculation</Button>
          </div>
        </div>
      </Modal>

      {/* Payslip Interactive View Modal */}
      <Modal isOpen={payslipModalOpen} onClose={() => setPayslipModalOpen(false)} title="Employee Salary Payslip">
        {selectedRun && (
          <div className="space-y-4">
            <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-xl text-xs space-y-4 text-slate-300">
              <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">R Solutions Pakistan</h3>
                  <span className="text-[10px] text-slate-500">Official Monthly Salary Ledger</span>
                </div>
                <Badge variant="purple">Month: {selectedRun.period}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div>
                  <span className="text-slate-500 block">Name:</span>
                  <span className="font-bold text-slate-200">Tariq Imran</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Code:</span>
                  <span className="font-bold text-purple-400">EMP001</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Role:</span>
                  <span className="font-bold text-slate-200">Sr. Solutions Architect</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Dept:</span>
                  <span className="font-bold text-slate-200">IT Operations</span>
                </div>
              </div>

              {/* Earnings Table */}
              <div className="space-y-1.5 pt-2 border-t border-slate-850">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Earnings Structure</span>
                <div className="flex justify-between text-slate-300">
                  <span>Basic Wage:</span>
                  <span className="font-bold">PKR 145,000</span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>House Rent (45%):</span>
                  <span>PKR 65,250</span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Medical Utility (15%):</span>
                  <span>PKR 21,750</span>
                </div>
              </div>

              {/* Deductions Table */}
              <div className="space-y-1.5 pt-2 border-t border-slate-850">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Statutory Deductions</span>
                <div className="flex justify-between text-slate-300">
                  <span>EOBI Provident Contribution:</span>
                  <span className="font-bold text-rose-400">- PKR 320</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Provident Fund Contribution (8.33%):</span>
                  <span className="font-bold text-rose-400">- PKR 12,078</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Professional Income Tax:</span>
                  <span className="font-bold text-rose-400">- PKR 6,500</span>
                </div>
              </div>

              {/* Net Payout */}
              <div className="flex justify-between items-center border-t border-slate-800 pt-3 text-sm">
                <span className="font-bold text-slate-200">Net Salary Disbursed:</span>
                <span className="text-emerald-400 font-extrabold text-base">PKR 212,902</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                className="flex-1 text-xs"
                onClick={() => downloadPayslipFile(selectedRun)}
              >
                <Download size={13} className="mr-1.5 inline" /> Download Payslip TXT
              </Button>
              <Button
                variant="primary"
                className="flex-1 text-xs"
                onClick={() => {
                  window.print();
                }}
              >
                Print / Save PDF
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// ==========================================
// 7. ONBOARDING PAGE (KANBAN BOARD)
// ==========================================
export const OnboardingPage: React.FC = () => {
  const [tasks, setTasks] = useState([
    { id: '1', name: 'Zeeshan Ali', task: 'Sign contract letter', status: 'pending' },
    { id: '2', name: 'Hina Fatima', task: 'Submit CNIC and photograph', status: 'in_progress' },
    { id: '3', name: 'Yasir Khan', task: 'IT Setup and active account creation', status: 'completed' },
  ]);

  const [isOpen, setIsOpen] = useState(false);
  const [newCandidate, setNewCandidate] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const handleAddOnboarding = () => {
    if (!newCandidate || !newDescription) return;
    const newTask = {
      id: String(tasks.length + 1),
      name: newCandidate,
      task: newDescription,
      status: 'pending'
    };
    setTasks([...tasks, newTask]);
    setNewCandidate('');
    setNewDescription('');
    setIsOpen(false);
  };

  const handleNext = (id: string, current: string) => {
    const nextStatus = current === 'pending' ? 'in_progress' : 'completed';
    setTasks(tasks.map(t => t.id === id ? { ...t, status: nextStatus } : t));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 font-heading">Onboarding Pipelines</h1>
          <p className="text-slate-400 text-xs mt-1">Assign check-lists to new employees and track progress on crucial tasks.</p>
        </div>
        <Button onClick={() => setIsOpen(true)} className="gap-2.5">
          <Plus size={15} /> Assign Onboarding Task
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: Pending */}
        <Card className="border border-slate-800/40 p-4 min-h-[300px]">
          <div className="flex justify-between items-center mb-4 border-b border-slate-850 pb-2">
            <h3 className="text-xs font-bold text-slate-300 uppercase font-heading">Pending (New)</h3>
            <Badge variant="purple">{tasks.filter(t => t.status === 'pending').length}</Badge>
          </div>
          <div className="space-y-3">
            {tasks.filter(t => t.status === 'pending').map(t => (
              <div key={t.id} className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between gap-3 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500" />
                <div>
                  <h4 className="text-xs font-bold text-slate-200">{t.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-1">{t.task}</p>
                </div>
                <Button className="py-1 px-2.5 text-[9px] self-end" onClick={() => handleNext(t.id, t.status)}>
                  Start Task
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Column 2: In Progress */}
        <Card className="border border-slate-800/40 p-4 min-h-[300px]">
          <div className="flex justify-between items-center mb-4 border-b border-slate-850 pb-2">
            <h3 className="text-xs font-bold text-slate-300 uppercase font-heading">In Progress</h3>
            <Badge variant="warning">{tasks.filter(t => t.status === 'in_progress').length}</Badge>
          </div>
          <div className="space-y-3">
            {tasks.filter(t => t.status === 'in_progress').map(t => (
              <div key={t.id} className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between gap-3 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
                <div>
                  <h4 className="text-xs font-bold text-slate-200">{t.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-1">{t.task}</p>
                </div>
                <Button className="py-1 px-2.5 text-[9px] self-end" onClick={() => handleNext(t.id, t.status)}>
                  Complete Task
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Column 3: Completed */}
        <Card className="border border-slate-800/40 p-4 min-h-[300px]">
          <div className="flex justify-between items-center mb-4 border-b border-slate-850 pb-2">
            <h3 className="text-xs font-bold text-slate-300 uppercase font-heading">Completed</h3>
            <Badge variant="success">{tasks.filter(t => t.status === 'completed').length}</Badge>
          </div>
          <div className="space-y-3">
            {tasks.filter(t => t.status === 'completed').map(t => (
              <div key={t.id} className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800/80 flex flex-col gap-2.5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
                <div>
                  <h4 className="text-xs font-bold text-slate-200">{t.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-1">{t.task}</p>
                </div>
                <Badge variant="success" className="self-end py-0.5 px-2 text-[9px]">Verified</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Onboarding checklist task manager modal */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Assign New Onboarding Pipeline">
        <div className="space-y-4">
          <Input
            label="Candidate Full Name"
            value={newCandidate}
            onChange={e => setNewCandidate(e.target.value)}
            placeholder="e.g. Hammad Tariq"
          />
          <Input
            label="Task / Checkpoint Requirement"
            value={newDescription}
            onChange={e => setNewDescription(e.target.value)}
            placeholder="e.g. Register under Sindh SESSI portal & issue asset inventory keys"
          />
          <div className="flex justify-end gap-3 mt-5">
            <Button variant="secondary" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={handleAddOnboarding}>Save & Deploy Checklist</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// ==========================================
// 8. LETTERS PAGE
// ==========================================
export const LettersPage: React.FC = () => {
  const [templates, setTemplates] = useState([
    {
      id: '1',
      title: 'Offer Letter Template',
      subject: 'Offer of Employment - Senior Software Engineer',
      content: `Dear {{employeeName}},

On behalf of R Solutions Pakistan, we are absolutely thrilled to offer you employment for the position of {{designation}}.

We were incredibly impressed by your technical evaluation, design methodology, and alignment with modern responsive standards.

**Terms of Employment:**
- **Job Title:** {{designation}}
- **Monthly Gross Wage:** {{salary}}
- **EOBI Social Security Contribution:** Covered by company
- **Provident Fund Match:** 8.33% standard deduction

Please review this letter, sign it, and return a scanned copy to confirm your acceptance.

Warm regards,
Tariq Imran
Managing Director
R Solutions Pakistan`
    },
    {
      id: '2',
      title: 'Appointment Certificate',
      subject: 'Formal Appointment and Onboarding Certificate',
      content: `### FORMAL APPOINTMENT CERTIFICATE

This is to certify that **{{employeeName}}** has been officially appointed to the office of **{{designation}}** at R Solutions Pakistan.

The appointment is effective from **{{currentDate}}**.

The candidate will report directly to the Chief Technical Architect and is bound by provincial labor regulations and statutory company bylaws.

Issued on behalf of the Board of Trustees, R Solutions PK.

Tariq Imran
Managing Director`
    }
  ]);

  const [letters, setLetters] = useState([
    {
      id: '1',
      name: 'Tariq Imran',
      type: 'Offer Letter',
      date: '2026-05-24',
      status: 'issued',
      content: `Dear Tariq Imran,

On behalf of R Solutions Pakistan, we are absolutely thrilled to offer you employment for the position of Sr. Solutions Architect.

We were incredibly impressed by your technical evaluation, design methodology, and alignment with modern responsive standards.

**Terms of Employment:**
- **Job Title:** Sr. Solutions Architect
- **Monthly Gross Wage:** PKR 145,000
- **EOBI Social Security Contribution:** Covered by company
- **Provident Fund Match:** 8.33% standard deduction

Please review this letter, sign it, and return a scanned copy to confirm your acceptance.

Warm regards,
Tariq Imran
Managing Director
R Solutions Pakistan`
    },
    {
      id: '2',
      name: 'Ayesha Khan',
      type: 'Appointment Certificate',
      date: '2026-05-26',
      status: 'issued',
      content: `### FORMAL APPOINTMENT CERTIFICATE

This is to certify that Ayesha Khan has been officially appointed to the office of HR Director at R Solutions Pakistan.

The appointment is effective from 2026-05-26.

The candidate will report directly to the Chief Technical Architect and is bound by provincial labor regulations and statutory company bylaws.

Issued on behalf of the Board of Trustees, R Solutions PK.

Tariq Imran
Managing Director`
    },
  ]);

  // States
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState('1');
  const [empName, setEmpName] = useState('Tariq Imran');
  const [designation, setDesignation] = useState('Senior React Architect');
  const [salaryVal, setSalaryVal] = useState('PKR 110,000');
  
  // New Template form states
  const [newTempTitle, setNewTempTitle] = useState('');
  const [newTempSubject, setNewTempSubject] = useState('');
  const [newTempContent, setNewTempContent] = useState('');

  // Edit Template state
  const [editTemplateId, setEditTemplateId] = useState<string | null>(null);
  const [editTempTitle, setEditTempTitle] = useState('');
  const [editTempSubject, setEditTempSubject] = useState('');
  const [editTempContent, setEditTempContent] = useState('');

  // Active Letter Preview
  const [activePreviewLetter, setActivePreviewLetter] = useState<any>(null);

  const handleGenerate = () => {
    const template = templates.find(t => t.id === selectedTemplateId);
    if (!template) return;

    const todayStr = new Date().toISOString().split('T')[0];
    
    // Bind template variables
    let compiledContent = template.content
      .replace(/\{\{employeeName\}\}/g, empName)
      .replace(/\{\{designation\}\}/g, designation)
      .replace(/\{\{salary\}\}/g, salaryVal)
      .replace(/\{\{currentDate\}\}/g, todayStr);

    const newLetter = {
      id: String(letters.length + 1),
      name: empName,
      type: template.title,
      date: todayStr,
      status: 'issued',
      content: compiledContent
    };

    setLetters([newLetter, ...letters]);
    setIsGenerateOpen(false);
    alert('Document compiled successfully and loaded into Issued Ledger!');
  };

  const handleAddTemplate = () => {
    if (!newTempTitle || !newTempContent) return;
    const newTemp = {
      id: String(templates.length + 1),
      title: newTempTitle,
      subject: newTempSubject || newTempTitle,
      content: newTempContent
    };
    setTemplates([...templates, newTemp]);
    setNewTempTitle('');
    setNewTempSubject('');
    setNewTempContent('');
    setIsTemplateModalOpen(false);
    alert('New document template registered successfully.');
  };

  const handleUpdateTemplate = () => {
    if (!editTempTitle || !editTempContent || !editTemplateId) return;
    setTemplates(templates.map(t => t.id === editTemplateId ? {
      ...t,
      title: editTempTitle,
      subject: editTempSubject || editTempTitle,
      content: editTempContent
    } : t));
    setEditTemplateId(null);
    alert('Document template updated successfully.');
  };

  const downloadTextFile = (letter: any) => {
    const element = document.createElement("a");
    const file = new Blob([letter.content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${letter.type.replace(/\s+/g, '_')}_${letter.name.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 font-heading">Letter Engine</h1>
          <p className="text-slate-400 text-xs mt-1">Draft, customize, and compile official employee letters with dynamic legal variables.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsTemplateModalOpen(true)} variant="secondary" className="gap-2 text-xs">
            <Plus size={14} /> Add Template
          </Button>
          <Button onClick={() => setIsGenerateOpen(true)} className="gap-2 text-xs">
            <Plus size={14} /> Generate Letter
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ledger */}
        <Card className="lg:col-span-2 border border-slate-800/40 p-0 overflow-hidden">
          <div className="p-5 border-b border-slate-800/60 bg-slate-900/10 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-200 font-heading">Issued Documents Ledger</h3>
            <Badge variant="purple">Active Registry</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-4">Recipient</th>
                  <th className="p-4">Document Type</th>
                  <th className="p-4">Date Issued</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Print / Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 font-medium">
                {letters.map(row => (
                  <tr key={row.id} className="hover:bg-slate-850/30 transition-colors">
                    <td className="p-4 font-bold text-slate-100">{row.name}</td>
                    <td className="p-4 text-slate-400">{row.type}</td>
                    <td className="p-4 text-slate-300">{row.date}</td>
                    <td className="p-4">
                      <Badge variant="success">{row.status}</Badge>
                    </td>
                    <td className="p-4 flex items-center justify-center gap-2">
                      <button
                        onClick={() => {
                          setActivePreviewLetter(row);
                          setIsPreviewOpen(true);
                        }}
                        className="flex items-center gap-1 px-2 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/25 rounded-md hover:bg-purple-500/20 transition-all cursor-pointer text-[10px]"
                      >
                        <Eye size={11} /> Preview
                      </button>
                      <button
                        onClick={() => downloadTextFile(row)}
                        className="flex items-center gap-1 px-2 py-1 bg-slate-800 text-slate-300 border border-slate-700/50 rounded-md hover:text-white transition-all cursor-pointer text-[10px]"
                      >
                        <Download size={11} /> TXT
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Templates List panel */}
        <Card className="border border-slate-800/40">
          <h3 className="text-sm font-bold text-slate-200 mb-3.5 font-heading">Templates Library</h3>
          <div className="space-y-3">
            {templates.map(t => (
              <div key={t.id} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-2 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-purple-500" />
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-slate-200">{t.title}</span>
                  <Badge variant="purple" className="text-[8px] py-0 px-1">Editable</Badge>
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-2 italic">"{t.subject}"</p>
                <button
                  onClick={() => {
                    setEditTemplateId(t.id);
                    setEditTempTitle(t.title);
                    setEditTempSubject(t.subject);
                    setEditTempContent(t.content);
                  }}
                  className="text-[10px] font-bold text-purple-400 hover:text-purple-300 text-left select-none cursor-pointer mt-1"
                >
                  <Edit size={10} className="inline mr-1" /> Edit Template Body
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800/60">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Token Placeholder Guide</h4>
            <div className="space-y-1 text-[10px] text-slate-400 font-medium">
              <div className="flex justify-between">
                <code className="text-purple-400">{"{{employeeName}}"}</code>
                <span>Full Name</span>
              </div>
              <div className="flex justify-between">
                <code className="text-purple-400">{"{{designation}}"}</code>
                <span>Job Designation</span>
              </div>
              <div className="flex justify-between">
                <code className="text-purple-400">{"{{salary}}"}</code>
                <span>Wage structure</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* MODAL 1: Generate Document */}
      <Modal isOpen={isGenerateOpen} onClose={() => setIsGenerateOpen(false)} title="Compile Official Letter">
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-300">Choose Template Blueprint</label>
            <select
              value={selectedTemplateId}
              onChange={e => setSelectedTemplateId(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-xs"
            >
              {templates.map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          </div>

          <Input
            label="Recipient Full Name"
            value={empName}
            onChange={e => setEmpName(e.target.value)}
            placeholder="e.g. Tariq Imran"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Assigned Designation"
              value={designation}
              onChange={e => setDesignation(e.target.value)}
              placeholder="e.g. Lead Frontend Lead"
            />
            <Input
              label="Gross Base Salary (PKR)"
              value={salaryVal}
              onChange={e => setSalaryVal(e.target.value)}
              placeholder="e.g. PKR 110,000"
            />
          </div>

          <div className="flex justify-end gap-3 mt-5">
            <Button variant="secondary" onClick={() => setIsGenerateOpen(false)}>Cancel</Button>
            <Button onClick={handleGenerate}>Compile & Issue Document</Button>
          </div>
        </div>
      </Modal>

      {/* MODAL 2: Create Template */}
      <Modal isOpen={isTemplateModalOpen} onClose={() => setIsTemplateModalOpen(false)} title="Register Letter Template">
        <div className="space-y-4">
          <Input
            label="Template Name Title"
            value={newTempTitle}
            onChange={e => setNewTempTitle(e.target.value)}
            placeholder="e.g. Probation Confirmation Certificate"
          />
          <Input
            label="Official Subject Header"
            value={newTempSubject}
            onChange={e => setNewTempSubject(e.target.value)}
            placeholder="e.g. Confirmation of Successful Probation Completion"
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300">HTML / Body Template Text</label>
            <textarea
              value={newTempContent}
              onChange={e => setNewTempContent(e.target.value)}
              rows={6}
              className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-xs"
              placeholder="Draft body content using tokens {{employeeName}} and {{designation}}..."
            />
          </div>

          <div className="flex justify-end gap-3 mt-5">
            <Button variant="secondary" onClick={() => setIsTemplateModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddTemplate}>Save Template</Button>
          </div>
        </div>
      </Modal>

      {/* MODAL 2.5: Edit Template */}
      <Modal isOpen={!!editTemplateId} onClose={() => setEditTemplateId(null)} title="Edit Letter Template">
        <div className="space-y-4">
          <Input
            label="Template Name Title"
            value={editTempTitle}
            onChange={e => setEditTempTitle(e.target.value)}
          />
          <Input
            label="Official Subject Header"
            value={editTempSubject}
            onChange={e => setEditTempSubject(e.target.value)}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300">HTML / Body Template Text</label>
            <textarea
              value={editTempContent}
              onChange={e => setEditTempContent(e.target.value)}
              rows={6}
              className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-xs"
            />
          </div>

          <div className="flex justify-end gap-3 mt-5">
            <Button variant="secondary" onClick={() => setEditTemplateId(null)}>Cancel</Button>
            <Button onClick={handleUpdateTemplate}>Update Template</Button>
          </div>
        </div>
      </Modal>

      {/* MODAL 3: Print Document Preview */}
      <Modal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} title="Compiled Document Viewer">
        {activePreviewLetter && (
          <div className="space-y-4">
            <div className="p-8 bg-white text-slate-900 rounded-xl font-serif max-h-96 overflow-y-auto text-xs leading-relaxed border border-slate-300 relative shadow-inner">
              {/* Digital Letterhead */}
              <div className="border-b-2 border-purple-600 pb-4 mb-6 text-center">
                <span className="font-heading font-extrabold text-purple-700 tracking-widest text-sm block">R SOLUTIONS PAKISTAN</span>
                <span className="text-[8px] text-slate-500 block mt-0.5 tracking-wider uppercase font-semibold">Statutory Compliance Certified Operations</span>
              </div>

              <div className="flex justify-between text-[10px] text-slate-600 font-semibold mb-6">
                <span>Ref: RSPK-DOC-{activePreviewLetter.id}</span>
                <span>Date: {activePreviewLetter.date}</span>
              </div>

              <div className="whitespace-pre-wrap font-sans text-slate-800">
                {activePreviewLetter.content}
              </div>

              {/* Signature Block */}
              <div className="mt-8 pt-8 border-t border-slate-200 flex justify-between items-center text-[10px]">
                <div>
                  <span className="block font-bold text-slate-800">Tariq Imran</span>
                  <span className="text-slate-500">Managing Director</span>
                </div>
                <div className="w-16 h-8 border border-dashed border-slate-300 rounded flex items-center justify-center text-[8px] text-slate-400 font-bold uppercase select-none italic">
                  MD Signature
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                className="flex-1 text-xs"
                onClick={() => {
                  window.print();
                }}
              >
                <Download size={13} className="mr-1.5 inline" /> Print / Save as PDF
              </Button>
              <Button
                variant="primary"
                className="flex-1 text-xs"
                onClick={() => setIsPreviewOpen(false)}
              >
                Close Preview
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};


// ==========================================
// 9. LOANS PAGE
// ==========================================
export const LoansPage: React.FC = () => {
  const [loans, setLoans] = useState([
    { id: '1', name: 'Tariq Imran', type: 'Personal Loan', amount: 'PKR 150,000', monthly: 'PKR 12,500', install: '12 months', paid: 'PKR 25,000', remain: 'PKR 125,000', status: 'active' },
    { id: '2', name: 'Bilal Ahmed', type: 'Salary Advance', amount: 'PKR 15,000', monthly: 'PKR 7,500', install: '2 months', paid: 'PKR 15,000', remain: 'PKR 0', status: 'completed' },
  ]);

  const [isOpen, setIsOpen] = useState(false);
  const [empName, setEmpName] = useState('Tariq Imran');
  const [type, setType] = useState('Personal Loan');
  const [amount, setAmount] = useState('50000');
  const [installments, setInstallments] = useState('6');

  const handleApply = () => {
    const parsedAmount = Number(amount);
    const parsedInstall = Number(installments);
    const monthlyDeduct = Math.round(parsedAmount / parsedInstall);
    
    const newLoan = {
      id: String(loans.length + 1),
      name: empName,
      type,
      amount: `PKR ${parsedAmount.toLocaleString()}`,
      monthly: `PKR ${monthlyDeduct.toLocaleString()}`,
      install: `${parsedInstall} months`,
      paid: 'PKR 0',
      remain: `PKR ${parsedAmount.toLocaleString()}`,
      status: 'pending',
    };
    setLoans([newLoan, ...loans]);
    setIsOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 font-heading">Loans & Advances</h1>
          <p className="text-slate-400 text-xs mt-1">Manage interest-free loans and advance salaries with monthly salary deductions.</p>
        </div>
        <Button onClick={() => setIsOpen(true)} className="gap-2.5">
          <Plus size={15} /> Request Loan
        </Button>
      </div>

      <Card className="border border-slate-800/40 p-0 overflow-hidden">
        <div className="p-5 border-b border-slate-800/60 bg-slate-900/10">
          <h3 className="text-sm font-bold text-slate-200 font-heading">Active Loans Registry</h3>
        </div>
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
              <th className="p-4">Employee</th>
              <th className="p-4">Loan Type</th>
              <th className="p-4">Principal Amount</th>
              <th className="p-4">Monthly Installment</th>
              <th className="p-4">Schedule</th>
              <th className="p-4">Paid Amount</th>
              <th className="p-4">Outstanding Bal</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300 font-medium">
            {loans.map(row => (
              <tr key={row.id} className="hover:bg-slate-850/30 transition-colors">
                <td className="p-4 font-bold text-slate-100">{row.name}</td>
                <td className="p-4 text-slate-400">{row.type}</td>
                <td className="p-4 font-bold text-slate-200">{row.amount}</td>
                <td className="p-4 text-slate-300 font-semibold">{row.monthly}</td>
                <td className="p-4 text-purple-400 font-semibold">{row.install}</td>
                <td className="p-4 text-emerald-400 font-semibold">{row.paid}</td>
                <td className="p-4 text-rose-400 font-bold">{row.remain}</td>
                <td className="p-4">
                  <Badge variant={row.status === 'completed' ? 'success' : row.status === 'active' ? 'info' : 'warning'}>
                    {row.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Register Loan/Advance Request">
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-300">Employee Profile</label>
            <select
              value={empName}
              onChange={e => setEmpName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-xs"
            >
              <option value="Tariq Imran">Tariq Imran</option>
              <option value="Ayesha Khan">Ayesha Khan</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-300">Loan Type</label>
              <select
                value={type}
                onChange={e => setType(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-xs"
              >
                <option value="Personal Loan">Personal Loan</option>
                <option value="Salary Advance">Salary Advance</option>
                <option value="Emergency Advance">Emergency Advance</option>
              </select>
            </div>
            <Input label="Installments (Months)" value={installments} onChange={e => setInstallments(e.target.value)} />
          </div>
          <Input label="Principal Amount (PKR)" type="number" value={amount} onChange={e => setAmount(e.target.value)} />
          <div className="flex justify-end gap-3 mt-5">
            <Button variant="secondary" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={handleApply}>Approve & Issue</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// ==========================================
// 10. COMPLIANCE PAGE (MULTI-MARKET LAW COMPLIANCE)
// ==========================================
export const CompliancePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'PK' | 'AE' | 'SA' | 'GB'>('PK');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 font-heading">Global Labor Compliance & Social Security</h1>
          <p className="text-slate-400 text-xs mt-1">Interactive statutory rules, tax slabs, EOBI, pension structures, and labor laws.</p>
        </div>
        
        {/* Country Selector Tabs */}
        <div className="flex bg-slate-900/80 border border-slate-800 p-1 rounded-xl gap-1 w-full sm:w-auto shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('PK')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${activeTab === 'PK' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            🇵🇰 Pakistan
          </button>
          <button
            onClick={() => setActiveTab('AE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${activeTab === 'AE' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            🇦🇪 UAE
          </button>
          <button
            onClick={() => setActiveTab('SA')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${activeTab === 'SA' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            🇸🇦 Saudi Arabia
          </button>
          <button
            onClick={() => setActiveTab('GB')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${activeTab === 'GB' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            🇬🇧 United Kingdom
          </button>
        </div>
      </div>

      {activeTab === 'PK' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 page-transition">
          <Card className="lg:col-span-2 border border-slate-800/40">
            <h3 className="text-sm font-bold text-slate-200 mb-4 font-heading flex items-center gap-2">
              <span>🇵🇰 Active Income Tax Slabs (FY 2024-25)</span>
              <Badge variant="purple">July-June Cycle</Badge>
            </h3>
            <div className="space-y-3 text-xs text-slate-300 font-medium">
              <div className="flex justify-between border-b border-slate-850 pb-2">
                <span className="font-semibold text-slate-400">Up to PKR 600,000 / year (PKR 50k/month)</span>
                <span className="font-bold text-emerald-400">0% Tax Rate</span>
              </div>
              <div className="flex justify-between border-b border-slate-850 pb-2">
                <span className="font-semibold text-slate-400">PKR 600,000 to PKR 1,200,000 / year</span>
                <span className="font-bold text-slate-200">5% of amount exceeding 600k</span>
              </div>
              <div className="flex justify-between border-b border-slate-850 pb-2">
                <span className="font-semibold text-slate-400">PKR 1,200,000 to PKR 2,200,000 / year</span>
                <span className="font-bold text-slate-200">PKR 30,000 + 15% exceeding 1.2M</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-400">PKR 2,200,000 to PKR 3,200,000 / year</span>
                <span className="font-bold text-slate-200">PKR 180,000 + 25% exceeding 2.2M</span>
              </div>
            </div>
          </Card>

          <Card className="border border-slate-800/40">
            <h3 className="text-sm font-bold text-slate-200 mb-4 font-heading">Statutory Benefits Summary</h3>
            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <p className="font-bold text-purple-400">EOBI Contribution</p>
                <p className="text-[10px] text-slate-400 mt-1">Employer: 5% of minimum base wage (PKR 1,600). Employee: 1% of minimum base wage (PKR 320).</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <p className="font-bold text-purple-400">Provident Fund (PF)</p>
                <p className="text-[10px] text-slate-400 mt-1">Recommended deduction: 8.33% of base monthly salary with equal employer match.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <p className="font-bold text-purple-400">PESSI / SESSI Portal</p>
                <p className="text-[10px] text-slate-400 mt-1">Employer pays 6% of minimum wage to provincial Social Security Institutions for employee healthcare coverage.</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'AE' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 page-transition">
          <Card className="lg:col-span-2 border border-slate-800/40">
            <h3 className="text-sm font-bold text-slate-200 mb-4 font-heading flex items-center gap-2">
              <span>🇦🇪 Wage Protection System (WPS) & MOHRE Compliance</span>
              <Badge variant="success">0% Income Tax</Badge>
            </h3>
            <div className="space-y-4 text-xs text-slate-300 font-medium">
              <p className="text-[11px] text-slate-400">United Arab Emirates labor law is heavily focused on corporate payment reporting (WPS) and End-of-Service Gratuity standards.</p>
              <div className="space-y-2">
                <div className="flex justify-between border-b border-slate-850 pb-2">
                  <span className="font-semibold text-slate-400">Personal Income Tax Slabs</span>
                  <span className="font-bold text-emerald-400">0% (Completely Tax-Free)</span>
                </div>
                <div className="flex justify-between border-b border-slate-850 pb-2">
                  <span className="font-semibold text-slate-400">Wage Protection System (WPS)</span>
                  <span className="text-slate-200 font-semibold">Mandatory electronic salary transfer reporting via banks</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-400">GCC Pension Contribution</span>
                  <span className="text-slate-200 font-semibold">12.5% Employer | 5% Employee (GCC nationals only)</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="border border-slate-800/40">
            <h3 className="text-sm font-bold text-slate-200 mb-4 font-heading">UAE End-of-Service Gratuity</h3>
            <div className="space-y-4 text-xs">
              <p className="text-[11px] text-slate-400">Statutory lump-sum payouts given to foreign contract employees upon termination/resignation:</p>
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <p className="font-bold text-purple-400">First 5 Years of Service</p>
                <p className="text-[10px] text-slate-400 mt-1">21 calendar days of basic wage salary for each year of completed service.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <p className="font-bold text-purple-400">Beyond 5 Years of Service</p>
                <p className="text-[10px] text-slate-400 mt-1">30 calendar days of basic wage salary for each additional completed year.</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'SA' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 page-transition">
          <Card className="lg:col-span-2 border border-slate-800/40">
            <h3 className="text-sm font-bold text-slate-200 mb-4 font-heading flex items-center gap-2">
              <span>🇸🇦 Saudi Labor Law & Qiwa Frameworks</span>
              <Badge variant="purple">Saudization (Nitaqat)</Badge>
            </h3>
            <div className="space-y-4 text-xs text-slate-300 font-medium">
              <p className="text-[11px] text-slate-400">Kingdom of Saudi Arabia enforces digital labor relations via the **Qiwa Portal** alongside nationalization constraints.</p>
              <div className="space-y-2">
                <div className="flex justify-between border-b border-slate-850 pb-2">
                  <span className="text-slate-400">Personal Income Tax Slabs</span>
                  <span className="font-bold text-emerald-400">0% (Completely Tax-Free)</span>
                </div>
                <div className="flex justify-between border-b border-slate-850 pb-2">
                  <span className="text-slate-400">GOSI Social Insurance</span>
                  <span className="text-slate-200">Employer: 12% | Employee: 10% (Saudi Nationals only)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Muqeem & Qiwa Registrations</span>
                  <span className="text-slate-200">Mandatory digital contract archiving for foreign expats</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="border border-slate-800/40">
            <h3 className="text-sm font-bold text-slate-200 mb-4 font-heading">Saudi End-of-Service (EOS)</h3>
            <div className="space-y-3 text-xs">
              <p className="text-[11px] text-slate-400 font-medium">Calculations on base salary contracts:</p>
              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
                <span className="font-bold text-purple-400 text-xs block">First 5 Years</span>
                <span className="text-[10px] text-slate-400 mt-1 block">Half month (15 days) basic wage salary per completed service year.</span>
              </div>
              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
                <span className="font-bold text-purple-400 text-xs block">After 5 Years</span>
                <span className="text-[10px] text-slate-400 mt-1 block">One full month (30 days) basic wage salary for each subsequent service year.</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'GB' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 page-transition">
          <Card className="lg:col-span-2 border border-slate-800/40">
            <h3 className="text-sm font-bold text-slate-200 mb-4 font-heading flex items-center gap-2">
              <span>🇬🇧 UK HMRC PAYE & Pension Auto-Enrolment</span>
              <Badge variant="purple">HMRC Payroll Registry</Badge>
            </h3>
            <div className="space-y-3 text-xs text-slate-300 font-medium">
              <div className="flex justify-between border-b border-slate-850 pb-2">
                <span className="font-semibold text-slate-400">Tax-Free Allowance (Personal Allowance)</span>
                <span className="font-bold text-emerald-400">Up to £12,570 / year (0% tax)</span>
              </div>
              <div className="flex justify-between border-b border-slate-850 pb-2">
                <span className="font-semibold text-slate-400">Basic Rate Band (£12,571 to £50,270)</span>
                <span className="font-bold text-slate-200">20% Tax Rate</span>
              </div>
              <div className="flex justify-between border-b border-slate-850 pb-2">
                <span className="font-semibold text-slate-400">Higher Rate Band (£50,271 to £125,140)</span>
                <span className="font-bold text-slate-200">40% Tax Rate</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-400">National Insurance Class 1 (Employee)</span>
                <span className="font-bold text-slate-200">8% of earnings between £1,048 & £4,189 / month</span>
              </div>
            </div>
          </Card>

          <Card className="border border-slate-800/40">
            <h3 className="text-sm font-bold text-slate-200 mb-4 font-heading">Statutory Rules (UK market)</h3>
            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <p className="font-bold text-purple-400">Pension Auto-Enrolment</p>
                <p className="text-[10px] text-slate-400 mt-1">Minimum contribution: 8% of qualifying earnings (Employer pays min 3%, Employee pays 5%).</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <p className="font-bold text-purple-400">Statutory Sick Pay (SSP)</p>
                <p className="text-[10px] text-slate-400 mt-1">Employees qualify for £116.75 per week sick pay paid by employer for up to 28 weeks.</p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 11. SETTINGS PAGE
// ==========================================
export const SettingsPage: React.FC = () => {
  const [name, setName] = useState('R Solutions Pakistan');
  const [email, setEmail] = useState('hr@rsolutions.pk');
  const [activeTint, setActiveTint] = useState<'purple' | 'emerald' | 'blue' | 'rose' | 'amber'>('purple');

  const handleSave = () => {
    alert(`Branding and administrative configurations saved! Accent Logo Tint successfully set to ${activeTint.toUpperCase()}.`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 font-heading">Administrative Settings</h1>
        <p className="text-slate-400 text-xs mt-1">Set company details, custom logos, branding themes, and email notifications.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border border-slate-800/40 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 border-b border-slate-850 pb-2.5 mb-2 font-heading">
            Company Configuration
          </h3>
          <Input label="Registered Entity Name" value={name} onChange={e => setName(e.target.value)} />
          <Input label="Primary Operations Email" value={email} onChange={e => setEmail(e.target.value)} />
          <Button onClick={handleSave} className="mt-2.5">
            Save System Configurations
          </Button>
        </Card>

        <Card className="border border-slate-800/40">
          <h3 className="text-sm font-bold text-slate-200 mb-4 font-heading">Branding Customization</h3>
          <div className="space-y-5 text-xs">
            {/* Dynamic logo color tint selection */}
            <div className="space-y-2">
              <span className="text-slate-400 font-semibold block">Primary Brand Tint</span>
              <div className="flex gap-2.5">
                <button
                  onClick={() => setActiveTint('purple')}
                  className={`w-6 h-6 rounded-full bg-purple-600 border-2 cursor-pointer transition-all ${activeTint === 'purple' ? 'border-white scale-110 shadow-lg shadow-purple-500/30' : 'border-transparent'}`}
                  title="Purple Brand Tint"
                />
                <button
                  onClick={() => setActiveTint('emerald')}
                  className={`w-6 h-6 rounded-full bg-emerald-600 border-2 cursor-pointer transition-all ${activeTint === 'emerald' ? 'border-white scale-110 shadow-lg shadow-emerald-500/30' : 'border-transparent'}`}
                  title="Emerald Brand Tint"
                />
                <button
                  onClick={() => setActiveTint('blue')}
                  className={`w-6 h-6 rounded-full bg-blue-600 border-2 cursor-pointer transition-all ${activeTint === 'blue' ? 'border-white scale-110 shadow-lg shadow-blue-500/30' : 'border-transparent'}`}
                  title="Blue Brand Tint"
                />
                <button
                  onClick={() => setActiveTint('rose')}
                  className={`w-6 h-6 rounded-full bg-rose-600 border-2 cursor-pointer transition-all ${activeTint === 'rose' ? 'border-white scale-110 shadow-lg shadow-rose-500/30' : 'border-transparent'}`}
                  title="Rose Brand Tint"
                />
                <button
                  onClick={() => setActiveTint('amber')}
                  className={`w-6 h-6 rounded-full bg-amber-600 border-2 cursor-pointer transition-all ${activeTint === 'amber' ? 'border-white scale-110 shadow-lg shadow-amber-500/30' : 'border-transparent'}`}
                  title="Amber Brand Tint"
                />
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-slate-850 pt-3">
              <span className="text-slate-400 font-semibold">Active Color Scheme</span>
              <Badge variant="purple" className="capitalize">{activeTint} Mode</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-semibold">Background Theme</span>
              <Badge variant="purple">Deep Slate (Default)</Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

// ==========================================
// 12. PERFORMANCE EVALUATION PAGE (PRO unlocked)
// ==========================================
export const PerformancePage: React.FC = () => {
  const [kpis, setKpis] = useState([
    { id: '1', name: 'Tariq Imran', goal: 'Reduce client bundle footprint by 30% under Vite', target: '2026-07-30', progress: 75 },
    { id: '2', name: 'Ayesha Khan', goal: 'Configure statutory social healthcare PESSI registry', target: '2026-06-15', progress: 95 },
  ]);

  const [isOpen, setIsOpen] = useState(false);
  const [assignee, setAssignee] = useState('Tariq Imran');
  const [goalText, setGoalText] = useState('');
  const [targetDate, setTargetDate] = useState('2026-08-31');

  // AI Appraisal review builder state
  const [appraisalModalOpen, setAppraisalModalOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState('Tariq Imran');
  const [appraisalRating, setAppraisalRating] = useState('5');
  const [appraisalText, setAppraisalText] = useState('');
  const [appraisalLoading, setAppraisalLoading] = useState(false);

  const handleAddKpi = () => {
    if (!goalText) return;
    const newKpi = {
      id: String(kpis.length + 1),
      name: assignee,
      goal: goalText,
      target: targetDate,
      progress: 0
    };
    setKpis([...kpis, newKpi]);
    setGoalText('');
    setIsOpen(false);
  };

  const handleDraftReview = () => {
    setAppraisalLoading(true);
    setAppraisalText('');
    setTimeout(() => {
      setAppraisalLoading(false);
      const rating = Number(appraisalRating);
      if (rating === 5) {
        setAppraisalText(`### 🌟 EXECUTIVE APPRAISAL VERDICT: OUTSTANDING (5/5 Stars)
Recipient: **${selectedEmp}**

**Performance Review Summary:**
${selectedEmp} has demonstrated exceptional execution excellence this appraisal cycle. Their technical deliverables were delivered with absolute zero defects. Notably, their leadership in optimizing responsive layouts and implementing responsive sliding-drawers has greatly improved our mobile client scores. They represent a high-value core asset to R Solutions Pakistan and are strongly recommended for salary tier increases.`);
      } else {
        setAppraisalText(`### 📈 APPRAISAL VERDICT: STRONGLY COMMENDABLE (4/5 Stars)
Recipient: **${selectedEmp}**

**Performance Review Summary:**
${selectedEmp} displays excellent competency in managing designated roles. They consistently meet payroll deadlines, maintain statutory labor compliance ledgers, and engage well with EOBI / SESSI frameworks. To achieve a 5-star rating next cycle, we suggest expanding automated test coverages across organizational letter variables and document compilers.`);
      }
    }, 1200);
  };

  const performanceDistribution = [
    { name: 'Excellent', value: 8, fill: '#8b5cf6' },
    { name: 'Commendable', value: 12, fill: '#6366f1' },
    { name: 'Adequate', value: 3, fill: '#14b8a6' },
    { name: 'Needs Review', value: 1, fill: '#f43f5e' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold text-slate-100 font-heading">Performance Evaluations</h1>
            <Badge variant="purple">Demo Sandbox Mode Unlocked</Badge>
          </div>
          <p className="text-slate-400 text-xs mt-1">Draft performance reviews, set target milestones, and execute KPI evaluations.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setAppraisalModalOpen(true)} variant="secondary" className="gap-2 text-xs">
            <Sparkles size={14} className="text-purple-400" /> AI Review Writer
          </Button>
          <Button onClick={() => setIsOpen(true)} className="gap-2 text-xs">
            <Plus size={14} /> Set KPI Objective
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* KPI Ledger */}
        <Card className="lg:col-span-2 border border-slate-800/40 p-0 overflow-hidden">
          <div className="p-5 border-b border-slate-800/60 bg-slate-900/10 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-200 font-heading">Active Employee KPI Targets</h3>
            <Badge variant="purple">Q2 Evaluation Cycle</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-4">Employee</th>
                  <th className="p-4">Assigned Goal Target</th>
                  <th className="p-4">Due Date</th>
                  <th className="p-4">Completion Bar</th>
                  <th className="p-4 text-center">Progress Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 font-medium">
                {kpis.map(row => (
                  <tr key={row.id} className="hover:bg-slate-850/30 transition-colors">
                    <td className="p-4 font-bold text-slate-100">{row.name}</td>
                    <td className="p-4 text-slate-300">{row.goal}</td>
                    <td className="p-4 text-purple-400 font-bold">{row.target}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-855 rounded-full h-1.5 overflow-hidden border border-slate-800">
                          <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full transition-all duration-500" style={{ width: `${row.progress}%` }} />
                        </div>
                        <span className="font-bold text-[10px] text-slate-300">{row.progress}%</span>
                      </div>
                    </td>
                    <td className="p-4 flex items-center justify-center">
                      <button
                        onClick={() => {
                          setKpis(kpis.map(k => k.id === row.id ? { ...k, progress: Math.min(k.progress + 10, 100) } : k));
                        }}
                        className="text-[10px] font-bold text-purple-400 hover:text-purple-300 cursor-pointer"
                      >
                        +10%
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Rating chart */}
        <Card className="border border-slate-800/40">
          <h3 className="text-sm font-bold text-slate-200 mb-4 font-heading">Performance Distribution</h3>
          <div className="h-48 flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={performanceDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {performanceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 font-medium">
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-purple-500" /> Excellent (8)</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-indigo-500" /> Commendable (12)</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-teal-500" /> Adequate (3)</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-rose-500" /> Needs Review (1)</div>
          </div>
        </Card>
      </div>

      {/* MODAL 1: Create KPI */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Register KPI Objective Goal">
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300">Assignee Employee</label>
            <select
              value={assignee}
              onChange={e => setAssignee(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-xs"
            >
              <option value="Tariq Imran">Tariq Imran</option>
              <option value="Ayesha Khan">Ayesha Khan</option>
              <option value="Imran Ali">Imran Ali</option>
              <option value="Zainab Fatima">Zainab Fatima</option>
            </select>
          </div>
          <Input
            label="Specific Measurable Target / Goal"
            value={goalText}
            onChange={e => setGoalText(e.target.value)}
            placeholder="e.g. Optimize React rendering layers & reduce unnecessary component re-renders"
          />
          <Input
            label="Target Accomplishment Due Date"
            value={targetDate}
            onChange={e => setTargetDate(e.target.value)}
            type="date"
          />

          <div className="flex justify-end gap-3 mt-5">
            <Button variant="secondary" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={handleAddKpi}>Deploy Goal</Button>
          </div>
        </div>
      </Modal>

      {/* MODAL 2: AI Review Appraiser */}
      <Modal isOpen={appraisalModalOpen} onClose={() => setAppraisalModalOpen(false)} title="AI Appraisal Performance Review Writer">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">Employee Subject</label>
              <select
                value={selectedEmp}
                onChange={e => setSelectedEmp(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-xs"
              >
                <option value="Tariq Imran">Tariq Imran</option>
                <option value="Ayesha Khan">Ayesha Khan</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">Cycle Rating</label>
              <select
                value={appraisalRating}
                onChange={e => setAppraisalRating(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-xs"
              >
                <option value="5">🌟 5 Stars - Outstanding</option>
                <option value="4">📈 4 Stars - Strongly Commendable</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <Button onClick={handleDraftReview} variant="primary" className="w-full" isLoading={appraisalLoading}>
              <Sparkles size={14} className="mr-2 inline" /> Draft AI Performance Review Evaluation
            </Button>
          </div>

          {appraisalText && (
            <div className="p-4 bg-slate-950 border border-purple-500/15 rounded-xl text-xs leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap text-slate-300 relative font-sans">
              <div className="absolute top-2 right-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(appraisalText);
                    alert('Appraisal review copied to clipboard!');
                  }}
                  className="p-1.5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded"
                  title="Copy to clipboard"
                >
                  <Copy size={12} />
                </button>
              </div>
              {appraisalText}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

// ==========================================
// 13. RECRUITMENT PAGE (PRO unlocked + CV Uploader Matcher)
// ==========================================
export const RecruitmentPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'match' | 'jobs'>('match');

  const [jobs, setJobs] = useState([
    { id: '1', title: 'Senior React Developer', dept: 'IT Operations', vacancies: '2', status: 'open', salary: 'PKR 120k - 160k' },
    { id: '2', title: 'HR Compliance Executive', dept: 'Human Resources', vacancies: '1', status: 'open', salary: 'PKR 85k - 105k' },
    { id: '3', title: 'Legal Counsel', dept: 'Legal & Administration', vacancies: '1', status: 'closed', salary: 'PKR 140k - 180k' },
  ]);

  // JD Matcher states
  const [selectedJobId, setSelectedJobId] = useState('1');
  const [customJd, setCustomJd] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);

  // Mocks to choose from
  const sampleCVs = [
    {
      id: 'tariq',
      label: "📄 Tariq's CV (Lead Developer Profile)",
      cvText: `Tariq Imran
Sr. Systems Engineer - Islamabad, PK

TECHNICAL MATRIX:
- Front-end frameworks: React 18, React Native, Vite, Redux, Zustand
- Typing & safety: TypeScript, JavaScript ES2023, ESLint
- Styling: Tailwind CSS, CSS Grid/Flexbox layouts, glassmorphism
- Build systems: Vite compiler, Webpack, package structures`
    },
    {
      id: 'ayesha',
      label: "📄 Ayesha's CV (HR Executive Profile)",
      cvText: `Ayesha Khan
HR Director - Rawalpindi, PK

HR MATRIX:
- Administrative controls: Employee records, onboarding cycles
- Legal compliance: Pakistan Labor Law, SESSI/PESSI, EOBI registrations
- Financial operations: Monthly salary runs, Provident Fund deductions`
    }
  ];

  const [selectedCvText, setSelectedCvText] = useState(sampleCVs[0].cvText);

  const executeMatcher = () => {
    setScanning(true);
    setScanResult(null);

    setTimeout(() => {
      setScanning(false);
      
      const job = jobs.find(j => j.id === selectedJobId);
      const isTech = job?.title.toLowerCase().includes('react') || job?.title.toLowerCase().includes('developer');
      const isCvTech = selectedCvText.toLowerCase().includes('react') || selectedCvText.toLowerCase().includes('typescript');

      if (isTech && isCvTech) {
        setScanResult({
          score: 93,
          verdict: 'Excellent Fit - Highly Recommended',
          verdictType: 'success',
          matched: ['React 18 & State Managers', 'TypeScript Typing', 'Vite & Bundler Architecture', 'Tailwind CSS Layouts'],
          missing: ['GraphQL queries', 'Unit Test coverages (Vitest/Jest)'],
          aiNotes: `The candidate demonstrates outstanding capabilities in modern client-side architectures. Their profile contains deep expert alignments with Vite, React, Zustand state stores, and modular Tailwind CSS. EOBI E-portal skills are not listed but standard IT operations proficiency guarantees swift adaptation.`
        });
      } else if (!isTech && !isCvTech) {
        setScanResult({
          score: 88,
          verdict: 'Strong Match - Recommended for Interview',
          verdictType: 'info',
          matched: ['Provident Fund Ledger Administration', 'Pakistan Labor Law Compliance', 'EOBI & SESSI Registrations'],
          missing: ['IT hardware provisioning'],
          aiNotes: `The candidate is highly competent in administrative HR procedures, specifically regional Pakistan Labor compliance. They have solid EOBI contribution ledger histories and equal Provident Fund match tracking. An excellent choice for our compliance office.`
        });
      } else {
        setScanResult({
          score: 22,
          verdict: 'Severe Mismatch - Not Recommended',
          verdictType: 'error',
          matched: [],
          missing: ['Core technical competence requirements', 'Framework specific alignment variables'],
          aiNotes: `The uploaded CV has severe structural mismatches with the job description. The candidate's background lacks any corresponding skill tokens required for the selected designation placement. Recommend immediate rejection to optimize interview pools.`
        });
      }
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold text-slate-100 font-heading">Recruitment & Placements</h1>
            <Badge variant="purple">Demo Sandbox Mode Unlocked</Badge>
          </div>
          <p className="text-slate-400 text-xs mt-1">Manage active vacancies, tracking applicant pipelines, and evaluate CV relevance instantly.</p>
        </div>

        {/* Tab switches */}
        <div className="flex bg-slate-900/80 border border-slate-800 p-1 rounded-xl gap-1 shrink-0 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('match')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${activeTab === 'match' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            ⚡ AI CV & JD Matcher
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${activeTab === 'jobs' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            💼 Vacancy Openings List
          </button>
        </div>
      </div>

      {activeTab === 'match' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 page-transition">
          {/* Left Inputs: CV selection & JDs */}
          <Card className="lg:col-span-2 border border-slate-800/40 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 border-b border-slate-850 pb-2.5 mb-2 font-heading flex items-center gap-2">
              <Zap size={14} className="text-purple-400" />
              <span>AI Placement Matcher Studio</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Job selection */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">Required Job Placement (JD)</label>
                <select
                  value={selectedJobId}
                  onChange={e => setSelectedJobId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-xs font-semibold"
                >
                  {jobs.map(j => (
                    <option key={j.id} value={j.id}>{j.title} ({j.dept})</option>
                  ))}
                </select>
              </div>

              {/* Sample CV picker */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">Choose Testing CV Mockup</label>
                <select
                  onChange={(e) => {
                    const selected = sampleCVs.find(c => c.id === e.target.value);
                    if (selected) setSelectedCvText(selected.cvText);
                  }}
                  className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-xs font-semibold"
                >
                  {sampleCVs.map(c => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Custom JD/CV editor panel */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400">Target Role Requirements / JDs</label>
                <textarea
                  value={customJd}
                  onChange={(e) => setCustomJd(e.target.value)}
                  rows={5}
                  placeholder="Paste additional custom JD constraints (Optional)..."
                  className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-xs font-sans"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400">Candidate CV Text Core Matrix</label>
                <textarea
                  value={selectedCvText}
                  onChange={(e) => setSelectedCvText(e.target.value)}
                  rows={5}
                  className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-xs font-mono"
                />
              </div>
            </div>

            {/* File upload drag uploader mockup */}
            <div className="border border-dashed border-slate-800 rounded-xl p-6 text-center bg-slate-950/20 hover:bg-slate-950/40 hover:border-purple-500/30 transition-all">
              <Upload className="mx-auto text-slate-600 mb-2.5" size={24} />
              <span className="text-xs font-bold text-slate-300 block">Drag & Drop real CV files (PDF, DOCX) here</span>
              <span className="text-[10px] text-slate-500 mt-1 block">Simulated legal parser will match credentials instantly</span>
            </div>

            <Button onClick={executeMatcher} variant="primary" className="w-full py-3" isLoading={scanning}>
              <Zap size={14} className="mr-2 inline fill-current" /> Execute Smart Suitability Analysis
            </Button>
          </Card>

          {/* Right Results: suitability reports & score radial dials */}
          <Card className="border border-slate-800/40 relative min-h-[300px]">
            {scanning && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-3">
                <span className="w-10 h-10 border-3 border-purple-500/10 border-t-purple-500 rounded-full animate-spin" />
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest animate-pulse">Running AI Vector Placement Scanners...</span>
              </div>
            )}

            {!scanResult && !scanning && (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <Award className="text-slate-700 mb-3" size={32} />
                <h4 className="text-xs font-bold text-slate-300">Analysis Results Ledger</h4>
                <p className="text-[10px] text-slate-500 mt-1.5 max-w-[200px]">Select a CV mockup and hit matching analytics to view dynamic percentage matrices.</p>
              </div>
            )}

            {scanResult && !scanning && (
              <div className="space-y-4 page-transition">
                <h4 className="text-xs font-bold text-slate-200 border-b border-slate-850 pb-2 font-heading">AI Suitability Report</h4>
                
                {/* Score Dial Circle */}
                <div className="flex flex-col items-center pt-2">
                  <div className="relative w-24 h-24 rounded-full flex items-center justify-center bg-slate-900 border-4 border-slate-850">
                    <div className="absolute inset-0 rounded-full border-4 border-purple-500 border-t-transparent animate-spin duration-3000 opacity-30" />
                    <span className="text-2xl font-black text-slate-100 font-heading">{scanResult.score}%</span>
                  </div>
                  <Badge variant={scanResult.verdictType} className="mt-3.5 py-1 px-3 text-[10px] font-bold">
                    {scanResult.verdict}
                  </Badge>
                </div>

                {/* Key Skills Matched */}
                {scanResult.matched.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Matched Skills Found:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {scanResult.matched.map((s: string, idx: number) => (
                        <span key={idx} className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold py-0.5 px-2 rounded-lg font-medium">
                          ✓ {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing Skills */}
                {scanResult.missing.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Core Skills Gaps:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {scanResult.missing.map((s: string, idx: number) => (
                        <span key={idx} className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[9px] font-bold py-0.5 px-2 rounded-lg font-medium">
                          ✗ {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI legal/technical analysis summary */}
                <div className="pt-2 border-t border-slate-850 text-[10px] leading-relaxed text-slate-400 font-medium">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1">AI Evaluator Review:</span>
                  <p className="italic">"{scanResult.aiNotes}"</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {activeTab === 'jobs' && (
        <Card className="border border-slate-800/40 p-0 overflow-hidden page-transition">
          <div className="p-5 border-b border-slate-800/60 bg-slate-900/10 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-200 font-heading">Active Job Openings</h3>
            <Button className="py-1 px-3 text-[10px] gap-1.5">
              <Plus size={12} /> Post Vacancy
            </Button>
          </div>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-4">Placement Title</th>
                <th className="p-4">Department</th>
                <th className="p-4">Gross Budget Compensation</th>
                <th className="p-4 text-center">Open Vacancies</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300 font-medium">
              {jobs.map(row => (
                <tr key={row.id} className="hover:bg-slate-850/30 transition-colors">
                  <td className="p-4 font-bold text-slate-100">{row.title}</td>
                  <td className="p-4 text-slate-400">{row.dept}</td>
                  <td className="p-4 text-purple-400 font-bold">{row.salary}</td>
                  <td className="p-4 text-center font-bold text-slate-200">{row.vacancies}</td>
                  <td className="p-4">
                    <Badge variant={row.status === 'open' ? 'success' : 'error'}>
                      {row.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
};

// ==========================================
// 14. COMING SOON PAGE (PREMIUM LOCK WALL)
// ==========================================
export const ComingSoonPage: React.FC<{ feature: string }> = ({ feature }) => {
  return (
    <div className="min-h-[500px] flex items-center justify-center p-6 text-center page-transition relative">
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl -z-10" />
      
      <Card className="max-w-md p-8 border border-slate-800/80 shadow-2xl relative overflow-hidden">
        {/* Floating gradient accent */}
        <div className="absolute -top-12 -right-12 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl -z-10" />
        
        <div className="flex flex-col items-center mb-6">
          <div className="p-3 bg-purple-500/10 border border-purple-500/25 rounded-2xl text-purple-400 shadow-inner mb-4">
            <Lock size={22} className="animate-bounce" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-100 capitalize font-heading">
            Upgrade Tier Required
          </h2>
          <p className="text-[11px] text-purple-400 font-bold uppercase mt-1.5 tracking-wider">
            Premium Module Locked
          </p>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed mb-6">
          The <strong className="text-slate-200 capitalize font-semibold">"{feature}"</strong> module is a premium Growth/Enterprise tier feature designed for scaling businesses.
        </p>

        <div className="space-y-4">
          <Button variant="primary" className="w-full gap-2.5">
            <Zap size={14} className="fill-current" /> Contact Sales to Upgrade
          </Button>
          <div className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase mt-3">
            Available on Growth & Enterprise plans
          </div>
        </div>
      </Card>
    </div>
  );
};
