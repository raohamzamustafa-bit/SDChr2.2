/* ================================================================
   SDC HR Solutions — Corporate Attendance Registry & Clock Desk
   Supports clock triggers, CSV biometric parser, shift management, and penalty configuration.
   ================================================================ */

import React, { useState } from 'react';
import { useAttendanceStore } from '../store/attendanceStore';
import { useEmployeeStore } from '../store/employeeStore';
import { Card, Table, Tabs, Badge, Button, Modal, Input, Select } from '../components/ui';
import toast from 'react-hot-toast';
import { Clock, Plus, Upload, ShieldAlert, Cpu } from 'lucide-react';

export const AttendancePage: React.FC = () => {
  const { 
    records, 
    shifts, 
    latePenaltyRules, 
    correctionRequests, 
    biometricConfig,
    clockIn, 
    clockOut, 
    addShift, 
    addLatePenaltyRule, 
    approveCorrectionRequest, 
    rejectCorrectionRequest,
    importCSVRecords,
    updateBiometricConfig 
  } = useAttendanceStore();

  const { employees } = useEmployeeStore();

  const [activeTab, setActiveTab] = useState('logs');
  const [clockModalOpen, setClockModalOpen] = useState(false);
  const [shiftModalOpen, setShiftModalOpen] = useState(false);
  const [ruleModalOpen, setRuleModalOpen] = useState(false);

  // Form states: Manual clock
  const [selectedEmpId, setSelectedEmpId] = useState('emp_imran');
  const [clockAction, setClockAction] = useState<'in' | 'out'>('in');
  const [notes, setNotes] = useState('');

  // Form states: Shift
  const [shiftName, setShiftName] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [graceMinutes, setGraceMinutes] = useState(15);

  // Form states: Penalty Rule
  const [threshold, setThreshold] = useState(30);
  const [deduction, setDeduction] = useState(500);

  // Form states: Biometric
  const [biomIp, setBiomIp] = useState(biometricConfig.deviceIp);
  const [biomPort, setBiomPort] = useState(biometricConfig.port);

  const handleClockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const todayStr = new Date().toISOString().split('T')[0];
    if (clockAction === 'in') {
      clockIn(selectedEmpId, todayStr, notes);
      toast.success("Clock-in logged successfully.");
    } else {
      clockOut(selectedEmpId, todayStr, notes);
      toast.success("Clock-out logged successfully.");
    }
    setClockModalOpen(false);
    setNotes('');
  };

  const handleShiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shiftName) return;
    addShift(shiftName, startTime, endTime, graceMinutes);
    toast.success("New shift config added to roster.");
    setShiftModalOpen(false);
  };

  const handleRuleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addLatePenaltyRule(threshold, deduction, 'fixed');
    toast.success("Late deduction penalty rule committed.");
    setRuleModalOpen(false);
  };

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      importCSVRecords(text);
      toast.success("Biometric records parsed and imported cleanly!");
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col gap-6">
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold font-heading text-slate-100">Attendance Registry & Roster</h1>
          <p className="text-xs text-slate-400 mt-1">Audit daily clock transitions, manage late penalties, configure shifts, and parse biometric imports.</p>
        </div>
        <div className="flex gap-2">
          {/* Hidden input for CSV */}
          <label className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700/50 text-xs font-semibold cursor-pointer select-none">
            <Upload size={14} /> Import Biometric CSV
            <input type="file" accept=".csv" onChange={handleCSVImport} className="hidden" />
          </label>
          <Button variant="primary" onClick={() => setClockModalOpen(true)} className="flex items-center gap-2">
            <Clock size={16} /> Manual Clock Entry
          </Button>
        </div>
      </div>

      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: 'logs', label: 'Daily Activity Logs' },
          { id: 'corrections', label: `Correction Requests Queue (${correctionRequests.filter(r => r.status === 'pending').length})` },
          { id: 'shifts', label: 'Shift Roster Config' },
          { id: 'penalties', label: 'Late Penalty Rules' },
          { id: 'biometric', label: 'Biometric Integration' }
        ]}
      />

      {activeTab === 'logs' && (
        <Card className="p-0 overflow-hidden border border-slate-800/40 animate-fade-in">
          <Table headers={["Date", "Employee Code", "Employee Name", "Clock In", "Clock Out", "Overtime (Hrs)", "Status", "Notes"]}>
            {records.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                  No attendance records logged for today.
                </td>
              </tr>
            ) : (
              records.map((r) => {
                const emp = employees.find(e => e.id === r.employee_id);
                return (
                  <tr key={r.id} className="hover:bg-slate-900/30">
                    <td className="px-6 py-4 text-xs font-mono font-bold text-slate-300">{r.date}</td>
                    <td className="px-6 py-4 font-bold text-slate-400">{emp?.employee_code || "N/A"}</td>
                    <td className="px-6 py-4 font-semibold text-slate-200">{emp ? `${emp.first_name} ${emp.last_name}` : r.employee_id}</td>
                    <td className="px-6 py-4 text-xs font-mono text-emerald-400 font-bold">{r.clock_in || "Absent"}</td>
                    <td className="px-6 py-4 text-xs font-mono text-purple-400 font-bold">{r.clock_out || "--:--:--"}</td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-300">{r.overtime_hours > 0 ? `${r.overtime_hours} hrs` : "0"}</td>
                    <td className="px-6 py-4">
                      <Badge variant={r.status === 'present' ? 'success' : 'error'}>
                        {r.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400 max-w-[160px] truncate">{r.notes || "Auto-Logged"}</td>
                  </tr>
                );
              })
            )}
          </Table>
        </Card>
      )}

      {activeTab === 'corrections' && (
        <Card className="p-0 overflow-hidden border border-slate-800/40 animate-fade-in">
          <Table headers={["Request Date", "Employee", "Shift Date", "Correction Field", "Proposed Time", "Deduction Reason", "Actions"]}>
            {correctionRequests.filter(r => r.status === 'pending').length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                  No attendance corrections requests pending review.
                </td>
              </tr>
            ) : (
              correctionRequests.filter(r => r.status === 'pending').map((req) => (
                <tr key={req.id} className="hover:bg-slate-900/30">
                  <td className="px-6 py-4 text-xs text-slate-400">{req.submitted_at.split('T')[0]}</td>
                  <td className="px-6 py-4 font-bold text-slate-200">{req.employee_name}</td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-300">{req.date}</td>
                  <td className="px-6 py-4 text-xs font-semibold text-purple-400 capitalize">{req.field}</td>
                  <td className="px-6 py-4 text-xs font-mono font-bold text-emerald-400">{req.new_value}</td>
                  <td className="px-6 py-4 text-xs text-slate-400">{req.reason}</td>
                  <td className="px-6 py-4 flex gap-2">
                    <Button variant="secondary" className="px-2 py-1 text-xs" onClick={() => { approveCorrectionRequest(req.id); toast.success("Correction committed to timeline."); }}>
                      Approve
                    </Button>
                    <Button variant="ghost" className="px-2 py-1 text-xs text-rose-400" onClick={() => { rejectCorrectionRequest(req.id); toast.error("Correction declined."); }}>
                      Reject
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </Table>
        </Card>
      )}

      {activeTab === 'shifts' && (
        <div className="flex flex-col gap-4 animate-fade-in">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold font-heading text-slate-200 uppercase tracking-wider">Active Shift Roster Configs</h3>
            <Button variant="secondary" className="flex items-center gap-1 text-xs" onClick={() => setShiftModalOpen(true)}>
              <Plus size={14} /> Add Shift Config
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {shifts.map((s) => (
              <Card key={s.id} className="border border-slate-800/40 p-6">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold text-slate-100 font-heading text-sm">{s.name}</h4>
                  <Badge variant="purple">{s.grace_minutes}m Grace</Badge>
                </div>
                <div className="flex flex-col gap-1.5 text-xs text-slate-400">
                  <div>Clock In: <span className="font-bold font-mono text-slate-200">{s.start_time}</span></div>
                  <div>Clock Out: <span className="font-bold font-mono text-slate-200">{s.end_time}</span></div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'penalties' && (
        <div className="flex flex-col gap-4 animate-fade-in">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold font-heading text-slate-200 uppercase tracking-wider">Late Penalty Deductions</h3>
            <Button variant="secondary" className="flex items-center gap-1 text-xs" onClick={() => setRuleModalOpen(true)}>
              <Plus size={14} /> Add Penalty Rule
            </Button>
          </div>

          <Table headers={["Threshold Minutes", "Deduction Amount", "Deduction Type", "Status"]}>
            {latePenaltyRules.map((rule) => (
              <tr key={rule.id} className="hover:bg-slate-900/30">
                <td className="px-6 py-4 font-bold text-slate-200">{rule.threshold_minutes} minutes late</td>
                <td className="px-6 py-4 font-mono font-bold text-rose-400">PKR {rule.deduction_amount}</td>
                <td className="px-6 py-4 text-xs font-semibold capitalize text-slate-400">{rule.deduction_type} Deduction</td>
                <td className="px-6 py-4">
                  <Badge variant="success">Active Rule</Badge>
                </td>
              </tr>
            ))}
          </Table>
        </div>
      )}

      {activeTab === 'biometric' && (
        <Card className="p-6 border border-slate-800/40 animate-fade-in flex flex-col gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400 shadow-inner shrink-0">
              <Cpu size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 font-heading text-base">ZKTeco Biometric Machine Connection</h3>
              <p className="text-xs text-slate-400 leading-relaxed mt-1">
                Configure local TCP/IP networking params to pull biometric punches directly into SDC attendance timelines.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <Input label="Biometric Device IP Address" value={biomIp} onChange={e => setBiomIp(e.target.value)} placeholder="e.g. 192.168.10.220" />
            <Input label="Device Port (Default ZK 4370)" type="number" value={biomPort} onChange={e => setBiomPort(Number(e.target.value))} />
          </div>

          <div className="flex items-center gap-2 text-rose-400 bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl">
            <ShieldAlert size={20} className="shrink-0" />
            <div className="text-xs leading-relaxed">
              <span className="font-bold">⚠️ Biometric Notice:</span> Local client sandbox active. Real-time direct TCP connection to biometric readers requires the SDC Express backend daemon. Biometric logs can be processed locally using the <span className="font-bold">Import Biometric CSV</span> route in header.
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-800 pt-4">
            <Button variant="secondary" onClick={() => { updateBiometricConfig(biomIp, biomPort); toast.success("Biometric config updated."); }}>
              Save IP Parameters
            </Button>
          </div>
        </Card>
      )}

      {/* Clock Entry Modal */}
      {clockModalOpen && (
        <Modal isOpen={clockModalOpen} onClose={() => setClockModalOpen(false)} title="Manual Roster Clocking Entry">
          <form onSubmit={handleClockSubmit} className="flex flex-col gap-4 text-xs">
            <Select
              label="Select Target Employee"
              value={selectedEmpId}
              onChange={e => setSelectedEmpId(e.target.value)}
              options={employees.map(e => ({ value: e.id, label: `${e.first_name} ${e.last_name} (${e.employee_code})` }))}
            />

            <Select
              label="Clock Action Type"
              value={clockAction}
              onChange={e => setClockAction(e.target.value as any)}
              options={[
                { value: 'in', label: 'Punch In (Duty Commencement)' },
                { value: 'out', label: 'Punch Out (Duty Completion)' }
              ]}
            />

            <Input
              label="Punch Notes / Justification"
              placeholder="e.g. Work from Home approval..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />

            <div className="flex justify-end gap-2 mt-4">
              <Button type="button" variant="secondary" onClick={() => setClockModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Commit Punch Log</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Shift Config Modal */}
      {shiftModalOpen && (
        <Modal isOpen={shiftModalOpen} onClose={() => setShiftModalOpen(false)} title="Create Shift Config Roster">
          <form onSubmit={handleShiftSubmit} className="flex flex-col gap-4 text-xs">
            <Input label="Shift Name *" value={shiftName} onChange={e => setShiftName(e.target.value)} required placeholder="e.g. Standard Morning" />
            <Input label="Start Time (24h) *" type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required />
            <Input label="End Time (24h) *" type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required />
            <Input label="Grace minutes allowed" type="number" value={graceMinutes} onChange={e => setGraceMinutes(Number(e.target.value))} />

            <div className="flex justify-end gap-2 mt-4">
              <Button type="button" variant="secondary" onClick={() => setShiftModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Create Shift</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Penalty Config Modal */}
      {ruleModalOpen && (
        <Modal isOpen={ruleModalOpen} onClose={() => setRuleModalOpen(false)} title="Create Late Penalty Rule">
          <form onSubmit={handleRuleSubmit} className="flex flex-col gap-4 text-xs">
            <Input label="Threshold minutes Late *" type="number" value={threshold} onChange={e => setThreshold(Number(e.target.value))} required />
            <Input label="Deduction Amount (PKR fixed) *" type="number" value={deduction} onChange={e => setDeduction(Number(e.target.value))} required />

            <div className="flex justify-end gap-2 mt-4">
              <Button type="button" variant="secondary" onClick={() => setRuleModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Create Rule</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
export default AttendancePage;
