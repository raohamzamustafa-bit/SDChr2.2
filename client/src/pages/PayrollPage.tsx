/* ================================================================
   SDC HR Solutions — Integrated Payroll & Loans Desk
   Enforces calculation cycles, mandatory preview gates, and WPS banks transfers.
   ================================================================ */

import React, { useState } from 'react';
import { usePayrollStore } from '../store/payrollStore';
import { useEmployeeStore } from '../store/employeeStore';
import { useTenantStore } from '../store/tenantStore';
import { Card, Table, Tabs, Badge, Button, Modal, Input, Select } from '../components/ui';
import toast from 'react-hot-toast';
import { Wallet, Sparkles, RefreshCw, Layers, CheckSquare, Plus, Download, Info } from 'lucide-react';

export const PayrollPage: React.FC = () => {
  const { 
    salaryStructures, 
    employeeSalaries, 
    taxSlabs, 
    payrollRuns, 
    loans, 
    adjustments,
    addSalaryStructure, 
    assignEmployeeSalary, 
    runPayrollCalculation, 
    finalizePayrollRun, 
    reversePayrollRun, 
    exportWPS, 
    applyForLoan, 
    approveLoanStep, 
    prepayLoan, 
    addAdjustment 
  } = usePayrollStore();

  const { employees } = useEmployeeStore();
  const activePack = useTenantStore((state) => state.compliance_config.pack);

  const [activeTab, setActiveTab] = useState('runs');

  // Modals
  const [runModalOpen, setRunModalOpen] = useState(false);
  const [structureModalOpen, setStructureModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [loanModalOpen, setLoanModalOpen] = useState(false);
  const [adjModalOpen, setAdjModalOpen] = useState(false);
  
  const [previewRun, setPreviewRun] = useState<any>(null);
  const [viewPayslip, setViewPayslip] = useState<any>(null);

  // Form states: Payroll Run
  const [runMonth, setRunMonth] = useState('2026-06');

  // Form states: New Structure
  const [structName, setStructName] = useState('');
  const [houseRent, setHouseRent] = useState(40);
  const [medAllow, setMedAllow] = useState(10);

  // Form states: Assignment
  const [selectedEmpId, setSelectedEmpId] = useState('emp_imran');
  const [selectedStructId, setSelectedStructId] = useState('struct_standard');
  const [basicPay, setBasicPay] = useState(180000);

  // Form states: Loan application
  const [loanEmpId, setLoanEmpId] = useState('emp_imran');
  const [loanType, setLoanType] = useState('Interest Free Personal');
  const [loanPrincipal, setLoanPrincipal] = useState(100000);
  const [loanInsts, setLoanInsts] = useState(10);

  // Form states: Adjustment
  const [adjEmpId, setAdjEmpId] = useState('emp_imran');
  const [adjType, setAdjType] = useState<'bonus' | 'fine'>('bonus');
  const [adjAmount, setAdjAmount] = useState(10000);
  const [adjReason, setAdjReason] = useState('Performance KPI Reward');

  const handlePrint = (content: string) => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(`<html><head><title>SDC HR Solutions — Payslip</title><style>body{font-family:monospace;white-space:pre-wrap;padding:40px;}</style></head><body>${content.replace(/\n/g, '<br>')}</body></html>`);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleRunSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = runPayrollCalculation(runMonth);
    if (res.success) {
      setPreviewRun(res.payrollRun);
      setRunModalOpen(false);
    }
  };

  const handleFinalize = () => {
    if (!previewRun) return;
    usePayrollStore.setState((state) => ({
      payrollRuns: [previewRun, ...state.payrollRuns]
    }));
    finalizePayrollRun(previewRun.id);
    toast.success("Payroll run finalized and statutory ledgers committed!");
    setPreviewRun(null);
  };

  const handleStructureSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addSalaryStructure(structName, [
      { id: "c_house", name: "House Rent Allowance", type: "earning", calculation: "percentage", value: houseRent, base_component_id: "basic" },
      { id: "c_med", name: "Medical Allowance", type: "earning", calculation: "percentage", value: medAllow, base_component_id: "basic" }
    ]);
    toast.success("Corporate salary structure registered.");
    setStructureModalOpen(false);
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find(e => e.id === selectedEmpId);
    if (!emp) return;
    assignEmployeeSalary(selectedEmpId, `${emp.first_name} ${emp.last_name}`, selectedStructId, Number(basicPay));
    toast.success("Salary assignment saved.");
    setAssignModalOpen(false);
  };

  const handleLoanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find(e => e.id === loanEmpId);
    if (!emp) return;
    applyForLoan(loanEmpId, `${emp.first_name} ${emp.last_name}`, loanType, Number(loanPrincipal), Number(loanInsts));
    toast.success("Corporate loan application initialized in approval queue.");
    setLoanModalOpen(false);
  };

  const handleAdjSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find(e => e.id === adjEmpId);
    if (!emp) return;
    addAdjustment(adjEmpId, `${emp.first_name} ${emp.last_name}`, adjType, Number(adjAmount), runMonth, adjReason);
    toast.success("Payroll adjustment saved.");
    setAdjModalOpen(false);
  };

  const handleDownloadWPS = (runId: string) => {
    const csvContent = exportWPS(runId);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `WPS_BankTransfer_${runMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("WPS bank transfer CSV file downloaded.");
  };

  return (
    <div className="flex flex-col gap-6">
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold font-heading text-slate-100 font-heading">Payroll Config & Advances</h1>
          <p className="text-xs text-slate-400 mt-1">Configure compensation packages, deploy statutory tax slabs, run payrolls, and review loan cycles.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setAssignModalOpen(true)} className="flex items-center gap-1.5">
            <Plus size={14} /> Assign Salary
          </Button>
          <Button variant="primary" onClick={() => setRunModalOpen(true)} className="flex items-center gap-1.5">
            <Wallet size={14} /> Run Monthly Payroll
          </Button>
        </div>
      </div>

      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: 'runs', label: 'Payroll Runs History' },
          { id: 'loans', label: `Corporate Advances Queue (${loans.filter(l => l.status.startsWith('pending')).length})` },
          { id: 'structures', label: 'Salary Structures Base' },
          { id: 'adjustments', label: 'Adjustments Ledger' }
        ]}
      />

      {activeTab === 'runs' && (
        <div className="flex flex-col gap-6 animate-fade-in">
          {previewRun && (
            <Card className="border border-purple-500/20 bg-purple-950/5 p-6 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 font-heading uppercase tracking-wide">Mandatory Payroll calculation Preview</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Please inspect calculated statutory splits and deductions before finalizing transaction registers.</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => setPreviewRun(null)}>Discard Draft</Button>
                  <Button variant="primary" onClick={handleFinalize}>Commit & Finalize Register</Button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <Card className="p-3 bg-slate-900/40 border-slate-800">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Total Gross Salaries</div>
                  <div className="text-lg font-bold text-slate-200 font-mono mt-1">PKR {previewRun.total_gross.toLocaleString()}</div>
                </Card>
                <Card className="p-3 bg-slate-900/40 border-slate-800">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Total Statutory Deductions</div>
                  <div className="text-lg font-bold text-rose-400 font-mono mt-1">PKR {previewRun.total_deductions.toLocaleString()}</div>
                </Card>
                <Card className="p-3 bg-slate-900/40 border-slate-800">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Total Net Disbursement</div>
                  <div className="text-lg font-bold text-emerald-400 font-mono mt-1">PKR {previewRun.total_net.toLocaleString()}</div>
                </Card>
              </div>

              <Table headers={["Employee Name", "Gross earnings", "Deductions Sum", "Net Payoff", "Actions"]}>
                {previewRun.payslips.map((ps: any) => (
                  <tr key={ps.employee_id}>
                    <td className="px-6 py-3 font-semibold text-slate-100">{ps.employee_name}</td>
                    <td className="px-6 py-3 font-mono font-bold text-slate-300">PKR {ps.gross.toLocaleString()}</td>
                    <td className="px-6 py-3 font-mono font-bold text-rose-400">PKR {ps.total_deductions.toLocaleString()}</td>
                    <td className="px-6 py-3 font-mono font-bold text-emerald-400">PKR {ps.net_pay.toLocaleString()}</td>
                    <td className="px-6 py-3">
                      <Button variant="secondary" className="px-2 py-1 text-xs" onClick={() => setViewPayslip(ps)}>
                        Inspect Slip
                      </Button>
                    </td>
                  </tr>
                ))}
              </Table>
            </Card>
          )}

          <Card className="p-0 overflow-hidden border border-slate-800/40">
            <Table headers={["Payroll Period", "Staff Count", "Gross Ledger", "Statutory Deds", "Disbursed Net", "Status", "Actions"]}>
              {payrollRuns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No finalized registers saved in database. Run monthly calculations above.
                  </td>
                </tr>
              ) : (
                payrollRuns.map((run) => (
                  <tr key={run.id} className="hover:bg-slate-900/30">
                    <td className="px-6 py-4 font-bold text-slate-300 font-heading">{run.month}</td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-200">{run.payslips.length} members</td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-400">PKR {run.total_gross.toLocaleString()}</td>
                    <td className="px-6 py-4 font-mono font-bold text-rose-400">PKR {run.total_deductions.toLocaleString()}</td>
                    <td className="px-6 py-4 font-mono font-bold text-emerald-400">PKR {run.total_net.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <Badge variant={run.status === 'finalized' ? 'success' : 'error'}>
                        {run.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <button 
                        onClick={() => handleDownloadWPS(run.id)}
                        className="p-2 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/20 text-emerald-400 rounded-lg cursor-pointer transition-colors"
                        title="Download WPS CSV"
                      >
                        <Download size={12} />
                      </button>
                      <Button variant="secondary" className="px-2.5 py-1 text-xs" onClick={() => {
                        const reason = prompt("Enter reversal reason (logged to audit registers):");
                        if (reason) {
                          reversePayrollRun(run.id, reason);
                          toast.error("Payroll run reversed.");
                        }
                      }}>
                        Reverse
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </Table>
          </Card>
        </div>
      )}

      {activeTab === 'loans' && (
        <div className="flex flex-col gap-4 animate-fade-in">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold font-heading text-slate-200 uppercase tracking-wider">Active Advances & Installment Ledger</h3>
            <Button variant="secondary" className="flex items-center gap-1 text-xs" onClick={() => setLoanModalOpen(true)}>
              <Plus size={14} /> Apply Advance
            </Button>
          </div>

          <Card className="p-0 overflow-hidden border border-slate-800/40">
            <Table headers={["Date Requested", "Employee Name", "Type", "Principal", "Monthly recovery", "Installments Paid", "Balance Outstanding", "Status", "Actions"]}>
              {loans.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                    No active loan ledger balances.
                  </td>
                </tr>
              ) : (
                loans.map((loan) => {
                  let isApprover = false;
                  let activeLevel: any = null;

                  if (loan.status === 'pending_manager') { isApprover = true; activeLevel = 'manager'; }
                  else if (loan.status === 'pending_hr') { isApprover = true; activeLevel = 'hr'; }
                  else if (loan.status === 'pending_admin') { isApprover = true; activeLevel = 'admin'; }

                  return (
                    <tr key={loan.id} className="hover:bg-slate-900/30">
                      <td className="px-6 py-4 text-xs text-slate-400">{loan.created_at.split('T')[0]}</td>
                      <td className="px-6 py-4 font-semibold text-slate-100">{loan.employee_name}</td>
                      <td className="px-6 py-4 text-xs text-slate-300">{loan.type}</td>
                      <td className="px-6 py-4 font-mono font-bold text-slate-200">PKR {loan.principal.toLocaleString()}</td>
                      <td className="px-6 py-4 font-mono text-slate-400">PKR {loan.monthly_installment}</td>
                      <td className="px-6 py-4 text-xs text-slate-300 font-bold">{loan.paid_installments} / {loan.total_installments}</td>
                      <td className="px-6 py-4 font-mono font-bold text-amber-400">PKR {loan.remaining_balance.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <Badge variant={loan.status === 'approved' ? 'success' : 'warning'}>
                          {loan.status.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 flex gap-2">
                        {isApprover ? (
                          <>
                            <Button variant="secondary" className="px-2 py-1 text-xs" onClick={() => { approveLoanStep(loan.id, activeLevel, 'approve'); toast.success("Loan level authorized."); }}>
                              Authorize
                            </Button>
                            <Button variant="ghost" className="px-2 py-1 text-xs text-rose-400" onClick={() => { approveLoanStep(loan.id, activeLevel, 'reject'); toast.error("Loan rejected."); }}>
                              Decline
                            </Button>
                          </>
                        ) : (
                          loan.status === 'approved' && (
                            <Button variant="secondary" className="px-2 py-1 text-xs" onClick={() => {
                              const amt = prompt("Enter prepayment amount (PKR):");
                              if (amt) {
                                prepayLoan(loan.id, Number(amt));
                                toast.success("Installment prepayment logged.");
                              }
                            }}>
                              Prepay
                            </Button>
                          )
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </Table>
          </Card>
        </div>
      )}

      {activeTab === 'structures' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          {salaryStructures.map((s) => (
            <Card key={s.id} className="border border-slate-800/40 p-6 flex flex-col justify-between">
              <div>
                <h3 className="font-bold font-heading text-slate-100 text-base mb-3">{s.name}</h3>
                
                <div className="flex flex-col gap-2.5">
                  <div className="flex justify-between items-center bg-slate-950/20 p-2.5 rounded-xl border border-slate-900/60 text-xs">
                    <span className="font-bold text-slate-300">Basic Monthly Pay</span>
                    <Badge variant="purple">100% of Base</Badge>
                  </div>

                  {s.components.map((c) => (
                    <div key={c.id} className="flex justify-between items-center bg-slate-950/20 p-2.5 rounded-xl border border-slate-900/60 text-xs">
                      <span className="text-slate-300">{c.name} ({c.type})</span>
                      <Badge variant="info">
                        {c.calculation === 'percentage' ? `${c.value}% of Basic` : `PKR ${c.value}`}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'adjustments' && (
        <div className="flex flex-col gap-4 animate-fade-in">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold font-heading text-slate-200 uppercase tracking-wider">KPI Adjustments & Fines Ledger</h3>
            <Button variant="secondary" className="flex items-center gap-1 text-xs" onClick={() => setAdjModalOpen(true)}>
              <Plus size={14} /> Add Adjustment
            </Button>
          </div>

          <Card className="p-0 overflow-hidden border border-slate-800/40">
            <Table headers={["Employee Name", "Type", "Ledger Amount", "Payroll month", "Adjustment Justification"]}>
              {adjustments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No adjustments logged for this cycle.
                  </td>
                </tr>
              ) : (
                adjustments.map((adj) => (
                  <tr key={adj.id} className="hover:bg-slate-900/30">
                    <td className="px-6 py-4 font-semibold text-slate-100">{adj.employee_name}</td>
                    <td className="px-6 py-4">
                      <Badge variant={adj.type === 'bonus' ? 'success' : 'error'}>
                        {adj.type}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-200">PKR {adj.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-400">{adj.month}</td>
                    <td className="px-6 py-4 text-xs text-slate-300">{adj.reason}</td>
                  </tr>
                ))
              )}
            </Table>
          </Card>
        </div>
      )}

      {/* Monthly Payroll Calculation Modal */}
      {runModalOpen && (
        <Modal isOpen={runModalOpen} onClose={() => setRunModalOpen(false)} title="Initiate Monthly Payroll calculation">
          <form onSubmit={handleRunSubmit} className="flex flex-col gap-4 text-xs">
            <Input label="Target Payroll Period" type="month" value={runMonth} onChange={e => setRunMonth(e.target.value)} required />
            
            <div className="flex gap-2 items-start bg-slate-950/20 p-3 rounded-xl border border-slate-800/40 text-slate-400">
              <Info size={16} className="text-purple-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Calculations dynamically load statutory rates from active compliance configs (<span className="font-bold text-purple-300">{activePack.country_name} pack</span>) alongside active loan installments and fines.
              </p>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button type="button" variant="secondary" onClick={() => setRunModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Compute Payroll Register</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Salary Assignment Modal */}
      {assignModalOpen && (
        <Modal isOpen={assignModalOpen} onClose={() => setAssignModalOpen(false)} title="Assign Salary structure to Employee">
          <form onSubmit={handleAssignSubmit} className="flex flex-col gap-4 text-xs">
            <Select
              label="Select Personnel Profile"
              value={selectedEmpId}
              onChange={e => setSelectedEmpId(e.target.value)}
              options={employees.map(e => ({ value: e.id, label: `${e.first_name} ${e.last_name} (${e.employee_code})` }))}
            />

            <Select
              label="Salary Structure Template"
              value={selectedStructId}
              onChange={e => setSelectedStructId(e.target.value)}
              options={salaryStructures.map(s => ({ value: s.id, label: s.name }))}
            />

            <Input
              label="Basic Monthly Pay (PKR)"
              type="number"
              value={basicPay}
              onChange={e => setBasicPay(Number(e.target.value))}
              required
            />

            <div className="flex justify-end gap-2 mt-4">
              <Button type="button" variant="secondary" onClick={() => setAssignModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Commit Assignment</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Loan Application Modal */}
      {loanModalOpen && (
        <Modal isOpen={loanModalOpen} onClose={() => setLoanModalOpen(false)} title="Initialize Advance / Loan Request">
          <form onSubmit={handleLoanSubmit} className="flex flex-col gap-4 text-xs">
            <Select
              label="Recipient Employee"
              value={loanEmpId}
              onChange={e => setLoanEmpId(e.target.value)}
              options={employees.map(e => ({ value: e.id, label: `${e.first_name} ${e.last_name} (${e.employee_code})` }))}
            />

            <Input label="Loan Category" value={loanType} onChange={e => setLoanType(e.target.value)} required />
            <Input label="Principal Amount (PKR)" type="number" value={loanPrincipal} onChange={e => setLoanPrincipal(Number(e.target.value))} required />
            <Input label="Total Installments Months" type="number" value={loanInsts} onChange={e => setLoanInsts(Number(e.target.value))} required />

            <div className="flex justify-end gap-2 mt-4">
              <Button type="button" variant="secondary" onClick={() => setLoanModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Submit Request</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Adjustment Modal */}
      {adjModalOpen && (
        <Modal isOpen={adjModalOpen} onClose={() => setAdjModalOpen(false)} title="Log Roster Adjustment Ledger">
          <form onSubmit={handleAdjSubmit} className="flex flex-col gap-4 text-xs">
            <Select
              label="Target Employee"
              value={adjEmpId}
              onChange={e => setAdjEmpId(e.target.value)}
              options={employees.map(e => ({ value: e.id, label: `${e.first_name} ${e.last_name} (${e.employee_code})` }))}
            />

            <Select
              label="Adjustment Class"
              value={adjType}
              onChange={e => setAdjType(e.target.value as any)}
              options={[
                { value: 'bonus', label: 'Earning Bonus / KPI Incentive' },
                { value: 'fine', label: 'Deduction Fine / Disciplinary Penalty' }
              ]}
            />

            <Input label="Amount (PKR)" type="number" value={adjAmount} onChange={e => setAdjAmount(Number(e.target.value))} required />
            <Input label="Justification" value={adjReason} onChange={e => setAdjReason(e.target.value)} required />

            <div className="flex justify-end gap-2 mt-4">
              <Button type="button" variant="secondary" onClick={() => setAdjModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Log Adjustment</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* View Payslip Modal */}
      {viewPayslip && (
        <Modal isOpen={!!viewPayslip} onClose={() => setViewPayslip(null)} title="Personnel Payslip View" size="lg">
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl text-slate-300 flex flex-col gap-6 text-xs">
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-100 font-heading">SDC HR Solutions</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Lahore Headquarters, Pakistan</p>
              </div>
              <div className="text-right">
                <h4 className="text-sm font-bold text-slate-200 uppercase font-heading">Payslip statement</h4>
                <p className="text-[10px] text-purple-400 font-bold mt-0.5">Month: {viewPayslip.month}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>Employee Name: <span className="font-bold text-slate-100">{viewPayslip.employee_name}</span></div>
              <div className="text-right">Staff ID: <span className="font-bold text-slate-100">{viewPayslip.employee_id}</span></div>
            </div>

            <div className="grid grid-cols-2 gap-6 items-start">
              <div>
                <h4 className="font-bold text-slate-400 uppercase tracking-wider mb-2 text-[10px]">Earnings</h4>
                <div className="flex flex-col gap-2">
                  {viewPayslip.earnings.map((e: any, i: number) => (
                    <div key={i} className="flex justify-between border-b border-slate-800/40 pb-1.5">
                      <span>{e.name}</span>
                      <span className="font-mono font-bold text-slate-200">PKR {e.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold text-slate-100 pt-1.5">
                    <span>Gross Total</span>
                    <span className="font-mono">PKR {viewPayslip.gross.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-400 uppercase tracking-wider mb-2 text-[10px]">Deductions</h4>
                <div className="flex flex-col gap-2">
                  {viewPayslip.deductions.map((d: any, i: number) => (
                    <div key={i} className="flex justify-between border-b border-slate-800/40 pb-1.5">
                      <span>{d.name}</span>
                      <span className="font-mono font-bold text-rose-400">PKR {d.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold text-slate-100 pt-1.5">
                    <span>Deductions Sum</span>
                    <span className="font-mono">PKR {viewPayslip.total_deductions.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-950/40 border border-slate-800/60 p-4 rounded-xl flex justify-between items-center text-sm font-bold">
              <span className="text-slate-400 uppercase font-heading text-xs">Net Disbursement pay</span>
              <span className="font-mono text-emerald-400 text-base">PKR {viewPayslip.net_pay.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="secondary" onClick={() => setViewPayslip(null)}>Close</Button>
            <Button variant="primary" onClick={() => handlePrint(`EMPLOYEE PAYSLIP STATEMENT\nName: ${viewPayslip.employee_name}\nMonth: ${viewPayslip.month}\nGross: PKR ${viewPayslip.gross}\nDeductions: PKR ${viewPayslip.total_deductions}\nNet: PKR ${viewPayslip.net_pay}`)}>
              Print Payslip
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};
export default PayrollPage;
