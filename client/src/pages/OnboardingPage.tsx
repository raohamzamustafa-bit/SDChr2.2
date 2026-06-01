/* ================================================================
   SDC HR Solutions — Onboarding & Task Orchestration Desk
   Supports custom checklists, SLA triggers, and Day 2/3/4 alerts.
   ================================================================ */

import React, { useState, useEffect } from 'react';
import { useOnboardingStore } from '../store/onboardingStore';
import { useOrgStore } from '../store/departmentStore';
import { useEmployeeStore } from '../store/employeeStore';
import { Card, Table, Tabs, Badge, Button, Modal, Input, Select, ProgressBar } from '../components/ui';
import toast from 'react-hot-toast';
import { CheckSquare, UserPlus, FilePlus, ChevronRight, AlertTriangle } from 'lucide-react';

export const OnboardingPage: React.FC = () => {
  const { templates, assignments, addTemplate, assignChecklist, toggleTask, triggerEscalationChecks } = useOnboardingStore();
  const { departments } = useOrgStore();
  const { employees } = useEmployeeStore();

  const [activeTab, setActiveTab] = useState('assignments');
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);

  // Form states: Assignment
  const [empId, setEmpId] = useState('emp_imran');
  const [tempId, setTempId] = useState('temp_eng');
  const [dueDate, setDueDate] = useState('2026-06-10');

  // Form states: Template
  const [tempName, setTempName] = useState('');
  const [tempDept, setTempDept] = useState('dept_eng');

  // Trigger escalations checking on mount
  useEffect(() => {
    triggerEscalationChecks();
  }, [triggerEscalationChecks]);

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find(e => e.id === empId);
    if (!emp) return;

    assignChecklist(empId, `${emp.first_name} ${emp.last_name}`, tempId, dueDate);
    toast.success("Checklist successfully assigned to employee.");
    setAssignModalOpen(false);
  };

  const handleTemplateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempName) return;

    addTemplate(tempName, tempDept);
    toast.success("New department checklist template added.");
    setTemplateModalOpen(false);
    setTempName('');
  };

  return (
    <div className="flex flex-col gap-6">
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold font-heading text-slate-100">Onboarding Orchestration</h1>
          <p className="text-xs text-slate-400 mt-1">Deploy department templates, track completion progress, and monitor SLA timelines.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setTemplateModalOpen(true)} className="flex items-center gap-2">
            <FilePlus size={16} /> New Template
          </Button>
          <Button variant="primary" onClick={() => setAssignModalOpen(true)} className="flex items-center gap-2">
            <UserPlus size={16} /> Assign Onboarding
          </Button>
        </div>
      </div>

      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: 'assignments', label: 'Active Assignments' },
          { id: 'templates', label: 'Checklist Templates Library' }
        ]}
      />

      {activeTab === 'assignments' && (
        <Card className="p-0 overflow-hidden border border-slate-800/40 animate-fade-in">
          <Table headers={["Date Assigned", "Employee", "Template Pack", "Progress Meter", "Due Date", "Escalation Level", "Actions"]}>
            {assignments.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                  No active personnel onboarding records.
                </td>
              </tr>
            ) : (
              assignments.map((as) => {
                const completed = as.tasks.filter(t => t.completed).length;
                const total = as.tasks.length;
                const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

                // Color of escalation tag
                let escVariant: 'success' | 'warning' | 'error' | 'neutral' = 'success';
                let escLabel = 'On Track (Day 1)';
                if (as.escalation_level === 1) {
                  escVariant = 'warning';
                  escLabel = 'Reminder (Day 2)';
                } else if (as.escalation_level === 2) {
                  escVariant = 'warning';
                  escLabel = 'Warning (Day 3)';
                } else if (as.escalation_level === 3) {
                  escVariant = 'error';
                  escLabel = 'Escalated to Admin (Day 4)';
                }

                return (
                  <tr key={as.id} className="hover:bg-slate-900/30">
                    <td className="px-6 py-4 text-xs text-slate-400">{as.assigned_at.split('T')[0]}</td>
                    <td className="px-6 py-4 font-bold text-slate-200">{as.employee_name}</td>
                    <td className="px-6 py-4 text-slate-300 text-xs">{as.checklist_name}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 w-36">
                        <ProgressBar value={percent} />
                        <span className="text-[10px] text-slate-400 font-bold">{percent}% completed ({completed}/{total})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono font-bold text-slate-200">{as.due_date}</td>
                    <td className="px-6 py-4">
                      <Badge variant={escVariant}>{escLabel}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Button variant="secondary" className="px-2.5 py-1 text-xs" onClick={() => {
                        // Toggle first task to demonstrate reactivity easily!
                        if (as.tasks.length > 0) {
                          toggleTask(as.id, as.tasks[0].task_id);
                          toast.success(`Task status updated!`);
                        }
                      }}>
                        Tick Task
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </Table>
        </Card>
      )}

      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          {templates.map((temp) => (
            <Card key={temp.id} className="border border-slate-800/40 p-6 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-slate-100 font-heading text-base">{temp.name}</h3>
                  <Badge variant="purple">
                    {departments.find(d => d.id === temp.department_id)?.name || "General"}
                  </Badge>
                </div>
                
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Checklist Tasks ({temp.tasks.length})</h4>
                <div className="flex flex-col gap-2">
                  {temp.tasks.map(t => (
                    <div key={t.id} className="flex gap-2.5 items-start bg-slate-950/20 p-2.5 rounded-xl border border-slate-900/60 text-xs">
                      <span className="w-5 h-5 rounded-md bg-purple-500/10 flex items-center justify-center font-bold text-purple-400 shrink-0">{t.order}</span>
                      <div>
                        <p className="font-bold text-slate-200">{t.title}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{t.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Assign Modal */}
      {assignModalOpen && (
        <Modal isOpen={assignModalOpen} onClose={() => setAssignModalOpen(false)} title="Assign Personnel Onboarding checklist">
          <form onSubmit={handleAssignSubmit} className="flex flex-col gap-4 text-xs">
            <Select
              label="Select Target Employee"
              value={empId}
              onChange={e => setEmpId(e.target.value)}
              options={employees.map(e => ({ value: e.id, label: `${e.first_name} ${e.last_name} (${e.employee_code})` }))}
            />

            <Select
              label="Select Onboarding Template Pack"
              value={tempId}
              onChange={e => setTempId(e.target.value)}
              options={templates.map(t => ({ value: t.id, label: t.name }))}
            />

            <Input
              label="Target Due Date (SLA)"
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
            />

            <div className="flex justify-end gap-2 mt-4">
              <Button type="button" variant="secondary" onClick={() => setAssignModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Deploy Checklist</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Template Modal */}
      {templateModalOpen && (
        <Modal isOpen={templateModalOpen} onClose={() => setTemplateModalOpen(false)} title="Create Onboarding checklist Pack">
          <form onSubmit={handleTemplateSubmit} className="flex flex-col gap-4 text-xs">
            <Input
              label="Template Name"
              placeholder="e.g. Finance Team Checklist"
              value={tempName}
              onChange={e => setTempName(e.target.value)}
              required
            />

            <Select
              label="Assigned Department"
              value={tempDept}
              onChange={e => setTempDept(e.target.value)}
              options={departments.map(d => ({ value: d.id, label: d.name }))}
            />

            <div className="flex justify-end gap-2 mt-4">
              <Button type="button" variant="secondary" onClick={() => setTemplateModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Create Template</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
export default OnboardingPage;
