/* ================================================================
   SDC HR Solutions — Communications & Letters Vault Desk
   Binds template version history, bulk generators, and window prints.
   ================================================================ */

import React, { useState } from 'react';
import { useLetterStore } from '../store/letterStore';
import { useEmployeeStore } from '../store/employeeStore';
import { Card, Table, Tabs, Badge, Button, Modal, Input, Select, Textarea } from '../components/ui';
import toast from 'react-hot-toast';
import { FileText, Printer, CheckSquare, RefreshCw, Layers } from 'lucide-react';

export const LettersPage: React.FC = () => {
  const { templates, generatedLetters, addTemplate, updateTemplate, generateLetter, acknowledgeLetter, rollbackTemplateVersion } = useLetterStore();
  const { employees } = useEmployeeStore();

  const [activeTab, setActiveTab] = useState('templates');
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);

  // Form states: Generation
  const [selectedTempId, setSelectedTempId] = useState('t_offer');
  const [empId, setEmpId] = useState('emp_imran');
  const [formVals, setFormVals] = useState<Record<string, string>>({
    employeeName: "Imran Khan",
    designation: "Software Engineer",
    department: "Engineering",
    salary: "180000",
    date: "2026-06-01"
  });

  // Form states: New Template
  const [tempName, setTempName] = useState('');
  const [tempContent, setTempContent] = useState('');
  const [tempType, setTempType] = useState<'offer' | 'warning' | 'custom'>('offer');

  // Preview generated letter
  const [previewLetter, setPreviewLetter] = useState<any>(null);

  const handleGenerateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find(e => e.id === empId);
    if (!emp) return;

    generateLetter(selectedTempId, empId, `${emp.first_name} ${emp.last_name}`, formVals);
    toast.success("Corporate Letter successfully generated!");
    setGenerateModalOpen(false);
  };

  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempName || !tempContent) return;

    addTemplate(tempName, tempType, tempContent);
    toast.success("New communications template committed.");
    setTemplateModalOpen(false);
  };

  const handlePrint = (content: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>SDC HR Solutions - Generated Document</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
            .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #8b5cf6; padding-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; color: #4f46e5; }
            .content { font-size: 14px; white-space: pre-wrap; margin-bottom: 60px; }
            .footer { text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">SDC HR Solutions</div>
            <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin-top: 5px;">Precision Workforce Solutions</div>
          </div>
          <div class="content">${content}</div>
          <div class="footer">
            Generated via SDC HRMS Suite on ${new Date().toUTCString()} - Confidential Corporate Record
          </div>
          <script>window.print(); window.close();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="flex flex-col gap-6">
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold font-heading text-slate-100">HR Communications & Letters Vault</h1>
          <p className="text-xs text-slate-400 mt-1">Manage letter templates, verify version histories, generate contracts, and audit acknowledgements.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setTemplateModalOpen(true)} className="flex items-center gap-2">
            <FileText size={16} /> New Template
          </Button>
          <Button variant="primary" onClick={() => setGenerateModalOpen(true)} className="flex items-center gap-2">
            <Printer size={16} /> Generate Letter
          </Button>
        </div>
      </div>

      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: 'templates', label: 'Checklist Library' },
          { id: 'generated', label: `Dispatched Documents (${generatedLetters.length})` }
        ]}
      />

      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          {templates.map((temp) => (
            <Card key={temp.id} className="border border-slate-800/40 p-6 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold font-heading text-slate-100 text-base">{temp.name}</h3>
                  <Badge variant="purple">{temp.type}</Badge>
                </div>
                
                <p className="text-xs text-slate-400 leading-relaxed font-mono bg-slate-950/20 p-4 rounded-xl border border-slate-900/60 line-clamp-4 mb-4">
                  {temp.content}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {temp.placeholders.map(ph => (
                    <Badge key={ph} variant="info" className="text-[10px] font-mono">
                      {"{{" + ph + "}}"}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-800 pt-4 mt-4">
                <span className="text-[10px] text-slate-500 font-medium">Versions: {temp.versions.length} deployed</span>
                <Button variant="secondary" className="px-3 py-1.5 text-xs rounded-xl" onClick={() => {
                  const content = prompt("Modify template layout:", temp.content);
                  if (content) {
                    updateTemplate(temp.id, content);
                    toast.success("Template revised, new version logged.");
                  }
                }}>
                  Deploy Revision
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'generated' && (
        <Card className="p-0 overflow-hidden border border-slate-800/40 animate-fade-in">
          <Table headers={["Dispatch Date", "Employee", "Template Source", "Dispatched By", "Acknowledgment State", "Actions"]}>
            {generatedLetters.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                  No letters dispatched yet.
                </td>
              </tr>
            ) : (
              generatedLetters.map((letItem) => (
                <tr key={letItem.id} className="hover:bg-slate-900/30">
                  <td className="px-6 py-4 text-xs text-slate-400">{letItem.generated_at.split('T')[0]}</td>
                  <td className="px-6 py-4 font-bold text-slate-200">{letItem.employee_name}</td>
                  <td className="px-6 py-4 text-slate-300 text-xs">{letItem.template_name}</td>
                  <td className="px-6 py-4 text-xs text-slate-400">{letItem.generated_by}</td>
                  <td className="px-6 py-4">
                    <Badge variant={letItem.acknowledged ? 'success' : 'warning'}>
                      {letItem.acknowledged ? 'Acknowledged' : 'Pending Receipt'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <Button variant="secondary" className="px-2 py-1 text-xs" onClick={() => setPreviewLetter(letItem)}>
                      View
                    </Button>
                    <button 
                      onClick={() => handlePrint(letItem.content)}
                      className="p-2 bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/20 text-purple-400 rounded-lg cursor-pointer transition-colors"
                      title="Export PDF"
                    >
                      <Printer size={12} />
                    </button>
                    {!letItem.acknowledged && (
                      <button 
                        onClick={() => { acknowledgeLetter(letItem.id); toast.success("Acknowledgment confirmed."); }}
                        className="p-2 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/20 text-emerald-400 rounded-lg cursor-pointer transition-colors"
                        title="Force Acknowledge"
                      >
                        <CheckSquare size={12} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </Table>
        </Card>
      )}

      {/* Generation Modal */}
      {generateModalOpen && (
        <Modal isOpen={generateModalOpen} onClose={() => setGenerateModalOpen(false)} title="Generate HR Document" size="md">
          <form onSubmit={handleGenerateSubmit} className="flex flex-col gap-4 text-xs">
            <Select
              label="Select Core Template"
              value={selectedTempId}
              onChange={e => setSelectedTempId(e.target.value)}
              options={templates.map(t => ({ value: t.id, label: t.name }))}
            />

            <Select
              label="Select Recipient Employee"
              value={empId}
              onChange={e => setEmpId(e.target.value)}
              options={employees.map(e => ({ value: e.id, label: `${e.first_name} ${e.last_name} (${e.employee_code})` }))}
            />

            <h4 className="font-bold text-slate-400 uppercase tracking-wider mt-2 mb-1 text-[10px]">Populate Placeholders</h4>
            {templates.find(t => t.id === selectedTempId)?.placeholders.map(ph => (
              <Input
                key={ph}
                label={ph.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                value={formVals[ph] || ""}
                onChange={e => setFormVals(prev => ({ ...prev, [ph]: e.target.value }))}
                required
              />
            ))}

            <div className="flex justify-end gap-2 mt-4">
              <Button type="button" variant="secondary" onClick={() => setGenerateModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Generate & Dispatch</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* New Template Modal */}
      {templateModalOpen && (
        <Modal isOpen={templateModalOpen} onClose={() => setTemplateModalOpen(false)} title="Create Document Template" size="lg">
          <form onSubmit={handleCreateTemplate} className="flex flex-col gap-4 text-xs">
            <Input
              label="Template Name"
              placeholder="e.g. FBR Standard Warning Memo"
              value={tempName}
              onChange={e => setTempName(e.target.value)}
              required
            />

            <Select
              label="Template Category"
              value={tempType}
              onChange={e => setTempType(e.target.value as any)}
              options={[
                { value: 'offer', label: 'Offer Contract' },
                { value: 'warning', label: 'Warning Memo' },
                { value: 'custom', label: 'Custom Document' }
              ]}
            />

            <Textarea
              label="Template Layout Content (Use double braces e.g. {{employeeName}} for dynamic inserts)"
              value={tempContent}
              onChange={e => setTempContent(e.target.value)}
              placeholder="Dear {{employeeName}}, this serves as a warning in your department {{department}}..."
              required
            />

            <div className="flex justify-end gap-2 mt-4">
              <Button type="button" variant="secondary" onClick={() => setTemplateModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Deploy Template</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Preview Letter Modal */}
      {previewLetter && (
        <Modal isOpen={!!previewLetter} onClose={() => setPreviewLetter(null)} title="Document View pane" size="lg">
          <div className="p-6 bg-slate-950/40 rounded-2xl border border-slate-800 text-slate-300 font-mono text-xs whitespace-pre-wrap leading-relaxed">
            {previewLetter.content}
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="secondary" onClick={() => setPreviewLetter(null)}>Close</Button>
            <Button variant="primary" onClick={() => handlePrint(previewLetter.content)} className="flex items-center gap-2">
              <Printer size={14} /> Print Document
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};
export default LettersPage;
