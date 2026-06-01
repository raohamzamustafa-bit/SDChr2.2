/* ================================================================
   SDC HR Solutions — Corporate Reports & BI Center
   Supports CSV export engines, printable tables, and scheduled stubs.
   ================================================================ */

import React, { useState } from 'react';
import { Card, Table, Badge, Button, Select } from '../components/ui';
import { useEmployeeStore } from '../store/employeeStore';
import { useOrgStore } from '../store/departmentStore';
import toast from 'react-hot-toast';
import { FileBarChart2, Download, Printer, ShieldAlert, Sparkles } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { employees } = useEmployeeStore();
  const { departments } = useOrgStore();

  const [reportType, setReportType] = useState('headcount');
  const [selectedDept, setSelectedDept] = useState('all');

  const handleExportCSV = () => {
    const headers = ["Employee Code", "Full Name", "Email", "Department", "Joining Date", "Status"];
    const rows = employees.map(e => [
      e.employee_code,
      `${e.first_name} ${e.last_name}`,
      e.email,
      departments.find(d => d.id === e.department_id)?.name || "N/A",
      e.date_of_joining,
      e.status
    ]);

    const csvContent = [headers, ...rows]
      .map(e => e.map(v => `"${v}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `HR_Report_${reportType}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV report downloaded successfully.");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-6">
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold font-heading text-slate-100">BI Analytics & Corporate Reports</h1>
          <p className="text-xs text-slate-400 mt-1">Export personnel rosters, evaluate departmental attrition budgets, and track compliance indices.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handlePrint} className="flex items-center gap-1.5 text-xs">
            <Printer size={14} /> Print layout
          </Button>
          <Button variant="primary" onClick={handleExportCSV} className="flex items-center gap-1.5 text-xs">
            <Download size={14} /> Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Selection panel */}
        <Card className="border border-slate-800/40 p-6 flex flex-col gap-4">
          <h3 className="text-sm font-bold font-heading text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <FileBarChart2 size={16} className="text-purple-400" /> Report filter deck
          </h3>

          <div className="flex flex-col gap-4 text-xs">
            <Select
              label="Select Analytics Category"
              value={reportType}
              onChange={e => setReportType(e.target.value)}
              options={[
                { value: 'headcount', label: 'Department Headcount Roster' },
                { value: 'turnover', label: 'Hiring & Turnover Ratios' },
                { value: 'statutory', label: 'FBR/EOBI Statutory Contributions' },
                { value: 'leaves', label: 'Monthly Leave Frequency Summary' }
              ]}
            />

            <Select
              label="Assigned Department"
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              options={[
                { value: 'all', label: 'All Corporate Units' },
                ...departments.map(d => ({ value: d.id, label: d.name }))
              ]}
            />
          </div>
        </Card>

        {/* Display register */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          
          {/* Scheduled reports stubs alert */}
          <div className="flex items-start gap-4 text-purple-400 bg-purple-500/10 border border-purple-500/20 p-4 rounded-xl">
            <Sparkles size={20} className="shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <span className="font-bold">✨ SDC Scheduler Engine (PRO Feature):</span> Configure automated report dispatches directly to stakeholders. This option is scheduled via CRON daemon in Express backends.
              <div className="flex items-center gap-2 mt-2">
                <Button variant="outline" className="px-2 py-1 text-[10px]" onClick={() => alert("BI Scheduler requires SDC Express Backend daemon.")}>
                  Schedule Report Dispatch
                </Button>
                <Badge variant="purple">Backend Required</Badge>
              </div>
            </div>
          </div>

          <Card className="p-0 overflow-hidden border border-slate-800/40">
            <Table headers={["Staff Code", "Full Name", "Department Unit", "Hired Date", "Statutory Contribs", "Status"]}>
              {employees.map((emp) => {
                const deptName = departments.find(d => d.id === emp.department_id)?.name || "General";
                return (
                  <tr key={emp.id} className="hover:bg-slate-900/30">
                    <td className="px-6 py-4 font-bold text-slate-300 font-heading">{emp.employee_code}</td>
                    <td className="px-6 py-4 font-semibold text-slate-100">{emp.first_name} {emp.last_name}</td>
                    <td className="px-6 py-4 text-xs text-slate-400">{deptName}</td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-300">{emp.date_of_joining}</td>
                    <td className="px-6 py-4 font-mono font-bold text-purple-400 text-xs">EOBI / SESSI</td>
                    <td className="px-6 py-4">
                      <Badge variant="success">{emp.status}</Badge>
                    </td>
                  </tr>
                );
              })}
            </Table>
          </Card>

        </div>
      </div>
    </div>
  );
};
export default ReportsPage;
