/* ================================================================
   SDC HR Solutions — Leave Desk & 4-Stage Approval Queue
   Enforces carry forward bounds, overlap alerts, and manager override paths.
   ================================================================ */

import React, { useState } from 'react';
import { useLeaveStore } from '../store/leaveStore';
import { useEmployeeStore } from '../store/employeeStore';
import { useAuthStore } from '../store/authStore';
import { Card, Table, Tabs, Badge, Button, Modal, Input, Select } from '../components/ui';
import toast from 'react-hot-toast';
import { CalendarDays, AlertTriangle, ShieldAlert, Sparkles, Check } from 'lucide-react';

export const LeavePage: React.FC = () => {
  const { 
    leaveTypes, 
    leaveBalances, 
    leaveRequests, 
    addLeaveType, 
    submitLeaveRequest, 
    processApprovalStep, 
    cancelLeaveRequest 
  } = useLeaveStore();

  const { employees } = useEmployeeStore();
  const currentUser = useAuthStore((state) => state.user);

  const [activeTab, setActiveTab] = useState('requests');
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [typeModalOpen, setTypeModalOpen] = useState(false);
  const [balanceInspect, setBalanceInspect] = useState<any[] | null>(null);

  // Form states: Leave Request
  const [empId, setEmpId] = useState('emp_imran');
  const [leaveTypeId, setLeaveTypeId] = useState('lt_annual');
  const [startDate, setStartDate] = useState('2026-06-15');
  const [endDate, setEndDate] = useState('2026-06-17');
  const [days, setDays] = useState(3);
  const [reason, setReason] = useState('');
  const [halfDay, setHalfDay] = useState(false);

  // Form states: Leave Type
  const [typeName, setTypeName] = useState('');
  const [typeQuota, setTypeQuota] = useState(14);
  const [carryForward, setCarryForward] = useState(5);

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find(e => e.id === empId);
    if (!emp) return;

    const matchedType = leaveTypes.find(t => t.id === leaveTypeId);
    const typeName = matchedType?.name || "Leave";

    const res = submitLeaveRequest({
      employee_id: empId,
      employee_name: `${emp.first_name} ${emp.last_name}`,
      leave_type_id: leaveTypeId,
      leave_type_name: typeName,
      start_date: startDate,
      end_date: endDate,
      half_day: halfDay,
      days: Number(days),
      reason
    });

    if (res.success) {
      toast.success("Leave request submitted successfully. 4-Stage Approval Queue initialized.");
      setRequestModalOpen(false);
      setReason('');
    } else {
      toast.error(res.error || "Submission failed.");
    }
  };

  const handleTypeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addLeaveType(typeName, typeQuota, carryForward, true);
    toast.success("New leave type rule saved.");
    setTypeModalOpen(false);
    setTypeName('');
  };

  return (
    <div className="flex flex-col gap-6">
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold font-heading text-slate-100">Leave Desk & Approvals</h1>
          <p className="text-xs text-slate-400 mt-1">Submit employee leaves, audit active quotas, review overlap conflicts, and process the 4-level chain.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setTypeModalOpen(true)} className="flex items-center gap-2">
            <CalendarDays size={16} /> New Leave Type
          </Button>
          <Button variant="primary" onClick={() => setRequestModalOpen(true)} className="flex items-center gap-2">
            <Sparkles size={16} /> Request Leave
          </Button>
        </div>
      </div>

      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: 'requests', label: 'Active Requests Queue' },
          { id: 'balances', label: 'Employee Quota balances' },
          { id: 'types', label: 'Leave Types Registry' }
        ]}
      />

      {activeTab === 'requests' && (
        <Card className="p-0 overflow-hidden border border-slate-800/40 animate-fade-in">
          <Table headers={["Request Date", "Employee Name", "Leave Type", "Duration", "Days", "4-Level Approval Status", "Actions"]}>
            {leaveRequests.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                  No leave requests logged in queue.
                </td>
              </tr>
            ) : (
              leaveRequests.map((req) => {
                // Determine user's eligible approval actions based on their simulated role
                let isApprover = false;
                let activeLevel: any = null;

                if (req.status === 'pending_tl' && currentUser?.role === 'team_lead') {
                  isApprover = true;
                  activeLevel = 'team_lead';
                } else if (req.status === 'pending_manager' && currentUser?.role === 'manager') {
                  isApprover = true;
                  activeLevel = 'manager';
                } else if (req.status === 'pending_director' && currentUser?.role === 'super_admin') {
                  isApprover = true;
                  activeLevel = 'director';
                } else if (req.status === 'pending_hr' && (currentUser?.role === 'hr' || currentUser?.role === 'super_admin')) {
                  isApprover = true;
                  activeLevel = 'hr';
                }

                // Beautiful custom layout to show 4 steps progress
                const stepsLayout = req.approval_chain.map(s => {
                  let stepColor = 'bg-slate-800 border-slate-700 text-slate-500';
                  if (s.status === 'approved') stepColor = 'bg-emerald-600 border-emerald-500 text-white';
                  else if (s.status === 'rejected') stepColor = 'bg-rose-600 border-rose-500 text-white';
                  else if (req.status.includes(s.level)) stepColor = 'bg-amber-600/20 border-amber-500 text-amber-400 animate-pulse';

                  return (
                    <div key={s.level} className="flex flex-col items-center gap-1">
                      <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-[9px] font-bold uppercase tracking-wider ${stepColor}`}>
                        {s.level.substring(0, 2)}
                      </div>
                      <span className="text-[8px] text-slate-500 uppercase">{s.level.replace('_', ' ')}</span>
                    </div>
                  );
                });

                return (
                  <tr key={req.id} className="hover:bg-slate-900/30">
                    <td className="px-6 py-4 text-xs text-slate-500">{req.created_at.split('T')[0]}</td>
                    <td className="px-6 py-4 font-bold text-slate-200">{req.employee_name}</td>
                    <td className="px-6 py-4 text-slate-300 text-xs font-semibold">{req.leave_type_name}</td>
                    <td className="px-6 py-4 text-xs font-mono font-bold text-slate-300">{req.start_date} to {req.end_date}</td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-200">{req.days} days</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-3 items-center">
                        {stepsLayout}
                      </div>
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      {isApprover ? (
                        <>
                          <Button variant="secondary" className="px-2 py-1 text-xs" onClick={() => {
                            processApprovalStep(req.id, activeLevel, 'approve', "Approved via corporate panel");
                            toast.success("Leave level approved.");
                          }}>
                            Approve
                          </Button>
                          <Button variant="ghost" className="px-2 py-1 text-xs text-rose-400" onClick={() => {
                            processApprovalStep(req.id, activeLevel, 'reject', "Declined via corporate panel");
                            toast.error("Leave request declined.");
                          }}>
                            Decline
                          </Button>
                        </>
                      ) : (
                        <span className="text-[10px] text-slate-500 italic">Awaiting Approver</span>
                      )}
                      {req.status === 'approved' && (
                        <Button variant="ghost" className="px-2 py-1 text-xs text-slate-400" onClick={() => { cancelLeaveRequest(req.id); toast.success("Leave cancelled & quota reverted."); }}>
                          Cancel Leave
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </Table>
        </Card>
      )}

      {activeTab === 'balances' && (
        <Card className="p-0 overflow-hidden border border-slate-800/40 animate-fade-in">
          <Table headers={["Employee Code", "Full Name", "Leave Type", "Quota Base", "Days Used", "Remaining Quota", "Actions"]}>
            {employees.map((emp) => {
              const balances = leaveBalances[emp.id] || [];
              if (balances.length === 0) {
                return (
                  <tr key={emp.id}>
                    <td className="px-6 py-4 text-slate-400">{emp.employee_code}</td>
                    <td className="px-6 py-4 font-bold text-slate-200">{emp.first_name} {emp.last_name}</td>
                    <td colSpan={5} className="px-6 py-4 text-xs italic text-slate-500">
                      Quota not initialized. Click Inspect to initialize standard country packs.
                    </td>
                  </tr>
                );
              }

              return balances.map((bal, idx) => (
                <tr key={bal.id} className="hover:bg-slate-900/30">
                  {idx === 0 && (
                    <>
                      <td rowSpan={balances.length} className="px-6 py-4 font-bold text-slate-400 font-heading border-r border-slate-800/40">{emp.employee_code}</td>
                      <td rowSpan={balances.length} className="px-6 py-4 font-bold text-slate-200 border-r border-slate-800/40">{emp.first_name} {emp.last_name}</td>
                    </>
                  )}
                  <td className="px-6 py-4 text-slate-300 font-semibold text-xs">{bal.leave_type_name}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-300">{bal.total} days</td>
                  <td className="px-6 py-4 text-xs font-bold text-rose-400">{bal.used} days</td>
                  <td className="px-6 py-4 text-xs font-bold text-emerald-400">{bal.remaining} days</td>
                  <td className="px-6 py-4">
                    <Button variant="secondary" className="px-2.5 py-1 text-xs" onClick={() => setBalanceInspect(bal.audit_log)}>
                      Audit Log
                    </Button>
                  </td>
                </tr>
              ));
            })}
          </Table>
        </Card>
      )}

      {activeTab === 'types' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
          {leaveTypes.map((type) => (
            <Card key={type.id} className="border border-slate-800/40 p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold font-heading text-slate-100 text-sm">{type.name}</h3>
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: type.color }} />
              </div>
              <div className="flex flex-col gap-2 text-xs text-slate-400">
                <div>Annual Quota: <span className="font-bold text-slate-200">{type.annual_quota} days</span></div>
                <div>Carry Forward Limit: <span className="font-bold text-slate-200">{type.carry_forward_max} days</span></div>
                <div>Probation Accruals: <span className="font-bold text-slate-200">{type.probation_accrual ? "Active" : "Disabled"}</span></div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Request Leave Modal */}
      {requestModalOpen && (
        <Modal isOpen={requestModalOpen} onClose={() => setRequestModalOpen(false)} title="Submit Personnel Leave Request">
          <form onSubmit={handleRequestSubmit} className="flex flex-col gap-4 text-xs">
            <Select
              label="Select Recipient Employee"
              value={empId}
              onChange={e => setEmpId(e.target.value)}
              options={employees.map(e => ({ value: e.id, label: `${e.first_name} ${e.last_name} (${e.employee_code})` }))}
            />

            <Select
              label="Select Leave Type"
              value={leaveTypeId}
              onChange={e => setLeaveTypeId(e.target.value)}
              options={leaveTypes.map(t => ({ value: t.id, label: t.name }))}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input label="Start Date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
              <Input label="End Date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>

            <Input label="Total Days" type="number" value={days} onChange={e => setDays(Number(e.target.value))} />

            <Input label="Leave Justification" placeholder="e.g. Wedding family event in Rawalpindi..." value={reason} onChange={e => setReason(e.target.value)} required />

            <div className="flex justify-end gap-2 mt-4">
              <Button type="button" variant="secondary" onClick={() => setRequestModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Submit Request</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Create Leave Type Modal */}
      {typeModalOpen && (
        <Modal isOpen={typeModalOpen} onClose={() => setTypeModalOpen(false)} title="Create Leave Category Rules">
          <form onSubmit={handleTypeSubmit} className="flex flex-col gap-4 text-xs">
            <Input label="Type Name *" value={typeName} onChange={e => setTypeName(e.target.value)} required placeholder="e.g. Marriage Leave" />
            <Input label="Annual Days Quota *" type="number" value={typeQuota} onChange={e => setTypeQuota(Number(e.target.value))} required />
            <Input label="Maximum Carry Forward Limit" type="number" value={carryForward} onChange={e => setCarryForward(Number(e.target.value))} />

            <div className="flex justify-end gap-2 mt-4">
              <Button type="button" variant="secondary" onClick={() => setTypeModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Commit Rules</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Audit Log Modal */}
      {balanceInspect && (
        <Modal isOpen={!!balanceInspect} onClose={() => setBalanceInspect(null)} title="Leave Balance Audit Trail">
          <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto">
            {balanceInspect.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No transactions logged for this balance.</p>
            ) : (
              balanceInspect.map((log, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs bg-slate-950/20 p-3 rounded-xl border border-slate-800/40 text-slate-300">
                  <div>
                    <p className="font-bold text-slate-200">{log.action} ({log.change > 0 ? `+${log.change}` : log.change} days)</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{log.reason}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-emerald-400 font-bold">{log.balance_after} remaining</p>
                    <p className="text-[9px] text-slate-600 mt-0.5">{log.timestamp.split('T')[0]}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="flex justify-end mt-6">
            <Button variant="secondary" onClick={() => setBalanceInspect(null)}>Close</Button>
          </div>
        </Modal>
      )}
    </div>
  );
};
export default LeavePage;
