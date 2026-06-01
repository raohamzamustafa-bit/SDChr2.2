/* ================================================================
   SDC HR Solutions — Offboarding Exit Settlement Desk
   Enforces separation rules (Resigned, Terminated, Absconder) and clearance checklists.
   ================================================================ */

import React, { useState } from 'react';
import { useSettlementStore } from '../store/settlementStore';
import { useEmployeeStore } from '../store/employeeStore';
import { Card, Table, Badge, Button, Modal, Input, Select } from '../components/ui';
import toast from 'react-hot-toast';
import { FileText, ClipboardList, ShieldAlert, Sparkles, Check, CheckSquare } from 'lucide-react';
import { SeparationType } from '../types';

export const SettlementPage: React.FC = () => {
  const { settlements, calculateAndInitiateSettlement, toggleChecklistItem, approveSettlementFinance, disburseSettlement } = useSettlementStore();
  const { employees } = useEmployeeStore();

  const [selectedEmpId, setSelectedEmpId] = useState('emp_imran');
  const [sepType, setSepType] = useState<SeparationType>('resigned');
  const [sepDate, setSepDate] = useState('2026-06-01');
  const [lastDay, setLastDay] = useState('2026-06-15');
  const [rehire, setRehire] = useState(true);
  const [payoutPercent, setPayoutPercent] = useState(100);

  const handleInitiate = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find(e => e.id === selectedEmpId);
    if (!emp) return;

    calculateAndInitiateSettlement(
      selectedEmpId,
      `${emp.first_name} ${emp.last_name}`,
      sepType,
      sepDate,
      lastDay,
      rehire,
      sepType === 'terminated' ? payoutPercent : undefined
    );

    toast.success("Settlement calculations computed and committed.");
  };

  const handlePrintReceipt = (s: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Clearance Settlement Statement</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #334155; line-height: 1.6; }
            h2 { text-align: center; border-bottom: 2px solid #8b5cf6; padding-bottom: 10px; }
            .details { display: grid; grid-template-cols: 1fr 1fr; margin-bottom: 20px; font-size: 13px; }
            table { w-full; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
            th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; }
            th { bg: #f8fafc; }
          </style>
        </head>
        <body>
          <h2>SDC HR Solutions - Final Settlement Receipt</h2>
          <div class="details">
            <div>Employee Name: <b>${s.employee_name}</b></div>
            <div>Separation Class: <b>${s.separation_type.toUpperCase()}</b></div>
            <div>Clearance Date: <b>${s.last_working_day}</b></div>
            <div>Status: <b>${s.status.toUpperCase()}</b></div>
          </div>
          <table>
            <thead>
              <tr><th>Calculation Component</th><th>Amount (PKR)</th></tr>
            </thead>
            <tbody>
              ${s.benefits.map((b: any) => `
                <tr>
                  <td>${b.name} (${b.type})</td>
                  <td style="color: ${b.type === 'earning' ? 'green' : 'red'}">${b.type === 'earning' ? '+' : '-'}${b.amount}</td>
                </tr>
              `).join('')}
              <tr style="font-weight: bold; background: #f8fafc;">
                <td>Disbursed Net Payoff</td>
                <td>PKR ${s.total_payout}</td>
              </tr>
            </tbody>
          </table>
          <script>window.print(); window.close();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="flex flex-col gap-6">
      
      <div>
        <h1 className="text-2xl font-extrabold font-heading text-slate-100 font-heading">Exit Desk & Settlements</h1>
        <p className="text-xs text-slate-400 mt-1">Initiate offboardings, calculate terminal benefits, enforce clearance checklists, and dispatch finance payouts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Settlement Initiation Panel */}
        <Card className="border border-slate-800/40 p-6 flex flex-col gap-4">
          <h3 className="text-sm font-bold font-heading text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles size={16} className="text-purple-400" /> Initiate Clearance Flow
          </h3>

          <form onSubmit={handleInitiate} className="flex flex-col gap-4 text-xs">
            <Select
              label="Select Personnel Profile"
              value={selectedEmpId}
              onChange={e => setSelectedEmpId(e.target.value)}
              options={employees.filter(e => e.status === 'active').map(e => ({ value: e.id, label: `${e.first_name} ${e.last_name} (${e.employee_code})` }))}
            />

            <Select
              label="Separation Category"
              value={sepType}
              onChange={e => setSepType(e.target.value as SeparationType)}
              options={[
                { value: 'resigned', label: 'Resignation Roster (Full Settlement)' },
                { value: 'terminated', label: 'Involuntary Termination (Configurable %)' },
                { value: 'absconder', label: 'Absconder (Zero Payout Clearance)' }
              ]}
            />

            {sepType === 'terminated' && (
              <Input
                label="Separation Payout Benefit Percentage *"
                type="number"
                value={payoutPercent}
                onChange={e => setPayoutPercent(Number(e.target.value))}
                required
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              <Input label="Resignation Date" type="date" value={sepDate} onChange={e => setSepDate(e.target.value)} />
              <Input label="Last Working Day" type="date" value={lastDay} onChange={e => setLastDay(e.target.value)} />
            </div>

            <Select
              label="Rehire Eligibility Roster"
              value={rehire ? "true" : "false"}
              onChange={e => setRehire(e.target.value === "true")}
              options={[
                { value: "true", label: "Eligible for Future Rehire" },
                { value: "false", label: "Blacklisted (Non-eligible)" }
              ]}
            />

            <Button type="submit" variant="primary" className="w-full mt-2 font-semibold">
              Compute Terminal Settlement
            </Button>
          </form>
        </Card>

        {/* Clearance Settlement Logs */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <h3 className="text-sm font-bold font-heading text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <ClipboardList size={16} className="text-purple-400" /> Clearance Registers Active
          </h3>

          {settlements.length === 0 ? (
            <Card className="py-12 border border-slate-800/40 text-center text-slate-500 text-xs">
              No offboarding exit records deployed in database.
            </Card>
          ) : (
            settlements.map((s) => {
              const itemsCleared = s.checklist.filter(c => c.completed).length;
              const totalItems = s.checklist.length;
              const percent = Math.round((itemsCleared / totalItems) * 100);

              return (
                <Card key={s.id} className="border border-slate-800/40 p-6 flex flex-col gap-4">
                  <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                    <div>
                      <h4 className="font-bold text-slate-200 text-sm">{s.employee_name}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">Exit Date: {s.last_working_day} | Status: <span className="font-bold text-purple-400">{s.separation_type}</span></p>
                    </div>
                    <Badge variant={s.status === 'disbursed' ? 'success' : 'warning'}>
                      {s.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300">
                    {/* Checklist */}
                    <div>
                      <h5 className="font-bold text-[10px] text-slate-400 uppercase tracking-wide mb-2">Internal Handover Checklist ({percent}%)</h5>
                      <div className="flex flex-col gap-1.5">
                        {s.checklist.map((c) => (
                          <label key={c.id} className="flex items-center gap-2 text-[11px] cursor-pointer text-slate-300">
                            <input 
                              type="checkbox" 
                              checked={c.completed} 
                              onChange={() => { toggleChecklistItem(s.id, c.id); toast.success("Asset clearance status updated."); }}
                              className="rounded border-slate-700 bg-slate-900 text-purple-600 focus:ring-purple-500" 
                            />
                            {c.title}
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Benefit calculator */}
                    <div>
                      <h5 className="font-bold text-[10px] text-slate-400 uppercase tracking-wide mb-2">Payout Components</h5>
                      <div className="flex flex-col gap-1">
                        {s.benefits.map((b, i) => (
                          <div key={i} className="flex justify-between pb-1 text-[11px] border-b border-slate-900/60">
                            <span>{b.name}</span>
                            <span className={b.type === 'earning' ? 'text-emerald-400' : 'text-rose-400'}>
                              {b.type === 'earning' ? '+' : '-'}PKR {b.amount.toLocaleString()}
                            </span>
                          </div>
                        ))}
                        <div className="flex justify-between font-bold text-slate-100 pt-2 text-xs">
                          <span>Net Terminal Payoff</span>
                          <span className="font-mono">PKR {s.total_payout.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions deck */}
                  <div className="flex justify-end gap-2 border-t border-slate-800 pt-4 mt-2">
                    <button 
                      onClick={() => handlePrintReceipt(s)}
                      className="p-2 bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/20 text-purple-400 rounded-lg cursor-pointer transition-colors"
                      title="Print Clearance statement"
                    >
                      <FileText size={14} />
                    </button>
                    {s.status === 'processing' && (
                      <Button variant="secondary" className="px-3 py-1.5 text-xs rounded-xl" onClick={() => { approveSettlementFinance(s.id); toast.success("Clearance authorized by Finance."); }}>
                        Finance Signoff
                      </Button>
                    )}
                    {s.status === 'pending_finance' && (
                      <Button variant="primary" className="px-3 py-1.5 text-xs rounded-xl" onClick={() => { disburseSettlement(s.id); toast.success("Settlement disbursed cleanly."); }}>
                        Disburse Funds
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
export default SettlementPage;
