/* ================================================================
   SDC HR Solutions — System Configuration Console
   Holds 9-tab settings dashboard including Feature Flags, Compliance Packs, and Audit Logs.
   ================================================================ */

import React, { useState } from 'react';
import { useTenantStore } from '../store/tenantStore';
import { useOrgStore } from '../store/departmentStore';
import { useAuditStore } from '../store/auditStore';
import { Card, Table, Tabs, Badge, Button, Input, Select } from '../components/ui';
import toast from 'react-hot-toast';
import { Settings, Shield, Globe, ToggleLeft, Activity, Users, CreditCard, Layers } from 'lucide-react';

export const ConfigPage: React.FC = () => {
  const { company, feature_flags, compliance_config, updateCompany, toggleFeatureFlag, setComplianceCountry } = useTenantStore();
  const { departments, designations, branches, addDepartment, addDesignation, addBranch } = useOrgStore();
  const { logs, exportToCSV } = useAuditStore();

  const [activeTab, setActiveTab] = useState('profile');

  // Form states: Profile
  const [compName, setCompName] = useState(company.name);
  const [compAddress, setCompAddress] = useState(company.address);

  // Form states: Org structures additions
  const [newDeptName, setNewDeptName] = useState('');
  const [newDesigTitle, setNewDesigTitle] = useState('');
  const [newBranchName, setNewBranchName] = useState('');

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompany({ name: compName, address: compAddress });
    toast.success("Company profile settings updated.");
  };

  const handleExportAudit = () => {
    const csvContent = exportToCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "Audit_Trail_Register.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Audit log CSV exported.");
  };

  return (
    <div className="flex flex-col gap-6">
      
      <div>
        <h1 className="text-2xl font-extrabold font-heading text-slate-100">Enterprise Settings Console</h1>
        <p className="text-xs text-slate-400 mt-1">Configure SDC workspaces, adjust multi-tenant features, load compliance packs, and download audit trials.</p>
      </div>

      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: 'profile', label: 'Company Profile', icon: <Settings size={14} /> },
          { id: 'org', label: 'Organization Units', icon: <Users size={14} /> },
          { id: 'compliance', label: 'Compliance Pack', icon: <Globe size={14} /> },
          { id: 'flags', label: 'Feature Flags', icon: <ToggleLeft size={14} /> },
          { id: 'audit', label: 'Audit Log Trail', icon: <Activity size={14} /> }
        ]}
      />

      {activeTab === 'profile' && (
        <Card className="border border-slate-800/40 p-6 max-w-lg animate-fade-in">
          <form onSubmit={handleProfileSave} className="flex flex-col gap-4 text-xs">
            <Input label="Company Corporate Title" value={compName} onChange={e => setCompName(e.target.value)} required />
            <Input label="Headquarters Address" value={compAddress} onChange={e => setCompAddress(e.target.value)} required />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Timezone Register" value={company.timezone} disabled />
              <Input label="Corporate Currency Base" value={company.currency} disabled />
            </div>

            <Button type="submit" variant="primary" className="mt-2 font-semibold">
              Commit Profile Changes
            </Button>
          </form>
        </Card>
      )}

      {activeTab === 'org' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in items-start">
          {/* Departments */}
          <Card className="border border-slate-800/40 p-6 flex flex-col gap-4">
            <h3 className="text-sm font-bold font-heading text-slate-200 uppercase tracking-wider">Departments ({departments.length})</h3>
            <div className="flex flex-col gap-2">
              {departments.map(d => (
                <div key={d.id} className="flex justify-between items-center bg-slate-950/20 p-2.5 rounded-xl border border-slate-900/60 text-xs">
                  <span className="font-bold text-slate-200">{d.name}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2 text-xs">
              <Input placeholder="New dept..." value={newDeptName} onChange={e => setNewDeptName(e.target.value)} />
              <Button onClick={() => { addDepartment(newDeptName); toast.success("Dept added."); setNewDeptName(''); }}>Add</Button>
            </div>
          </Card>

          {/* Designations */}
          <Card className="border border-slate-800/40 p-6 flex flex-col gap-4">
            <h3 className="text-sm font-bold font-heading text-slate-200 uppercase tracking-wider">Designations</h3>
            <div className="flex flex-col gap-2">
              {designations.map(d => (
                <div key={d.id} className="flex justify-between items-center bg-slate-950/20 p-2.5 rounded-xl border border-slate-900/60 text-xs">
                  <span className="font-bold text-slate-200">{d.title}</span>
                  <Badge variant="purple">{d.grade}</Badge>
                </div>
              ))}
            </div>
            <div className="flex gap-2 text-xs">
              <Input placeholder="New title..." value={newDesigTitle} onChange={e => setNewDesigTitle(e.target.value)} />
              <Button onClick={() => { addDesignation(newDesigTitle, "G-3", "A"); toast.success("Designation added."); setNewDesigTitle(''); }}>Add</Button>
            </div>
          </Card>

          {/* Branches */}
          <Card className="border border-slate-800/40 p-6 flex flex-col gap-4">
            <h3 className="text-sm font-bold font-heading text-slate-200 uppercase tracking-wider">Branches</h3>
            <div className="flex flex-col gap-2">
              {branches.map(b => (
                <div key={b.id} className="flex justify-between items-center bg-slate-950/20 p-2.5 rounded-xl border border-slate-900/60 text-xs">
                  <span className="font-bold text-slate-200">{b.name}</span>
                  <span className="text-[10px] text-slate-500">{b.location}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'compliance' && (
        <Card className="border border-slate-800/40 p-6 max-w-lg animate-fade-in flex flex-col gap-4">
          <h3 className="text-sm font-bold font-heading text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Globe size={16} className="text-purple-400" /> Active Statutory Compliance Pack
          </h3>

          <div className="text-xs text-slate-400 leading-relaxed bg-slate-950/20 p-4 rounded-xl border border-slate-800/40 mb-2">
            Selecting a country pack dynamically updates standard leave quotas, fiscal cycle months, and statutory pension calculations (e.g. EOBI/PF splits).
          </div>

          <Select
            label="Load Country Compliance Pack"
            value={compliance_config.country_code}
            onChange={e => {
              setComplianceCountry(e.target.value);
              toast.success(`Compliance standard loaded for ${e.target.value}!`);
            }}
            options={[
              { value: 'PK', label: 'Pakistan (FBR Tax, EOBI Statutory Pension)' },
              { value: 'AE', label: 'United Arab Emirates (WPS FTA Compliant)' },
              { value: 'IN', label: 'India (ITR EPF Statutory)' },
              { value: 'UK', label: 'United Kingdom (HMRC PAYE)' }
            ]}
          />

          <div className="flex flex-col gap-2.5 text-xs text-slate-300 mt-4 border-t border-slate-800 pt-4">
            <h4 className="font-bold font-heading text-slate-100 uppercase text-[10px]">Loaded Pack Statutory Rates</h4>
            {compliance_config.pack.statutory_contributions.map((sc, i) => (
              <div key={i} className="flex justify-between items-start bg-slate-950/20 p-3 rounded-xl border border-slate-900/60">
                <div>
                  <div className="font-bold text-slate-200">{sc.name}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{sc.description}</div>
                </div>
                <Badge variant="purple" className="shrink-0">
                  {Math.round(sc.employer_rate * 100)}% Emp / {Math.round(sc.employee_rate * 100)}% Staff
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'flags' && (
        <Card className="border border-slate-800/40 p-6 animate-fade-in flex flex-col gap-4">
          <h3 className="text-sm font-bold font-heading text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <ToggleLeft size={16} className="text-purple-400" /> SDC Feature Flags Board (Super Admin Console)
          </h3>

          <div className="text-xs text-slate-400 leading-relaxed bg-slate-950/20 p-4 rounded-xl border border-slate-800/40 mb-4">
            Toggle global subscription tiers dynamically to isolate modules and demonstrate upgrade prompts.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.keys(feature_flags).map((flag) => {
              const val = feature_flags[flag];
              return (
                <div key={flag} className="flex justify-between items-center p-3.5 bg-slate-950/20 rounded-xl border border-slate-800/40 text-xs text-slate-300">
                  <span className="font-semibold capitalize text-slate-200">{flag.replace(/_/g, ' ')}</span>
                  <div className="flex items-center gap-3">
                    <Badge variant={val ? 'success' : 'neutral'}>
                      {val ? 'PRO Unlocked' : 'Basic Lock'}
                    </Badge>
                    <Button 
                      variant="secondary" 
                      className="px-2.5 py-1 text-[10px] rounded-lg"
                      onClick={() => {
                        toggleFeatureFlag(flag as any);
                        toast.success(`Feature ${flag.replace(/_/g, ' ')} toggled!`);
                      }}
                    >
                      Toggle
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {activeTab === 'audit' && (
        <div className="flex flex-col gap-4 animate-fade-in">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold font-heading text-slate-200 uppercase tracking-wider">Append-Only Audit Logs</h3>
            <Button variant="primary" onClick={handleExportAudit} className="flex items-center gap-1 text-xs">
              Export Audit Register (CSV)
            </Button>
          </div>

          <Card className="p-0 overflow-hidden border border-slate-800/40">
            <Table headers={["Timestamp (UTC)", "User Name", "Action Class", "Entity", "IP Address", "Security Token"]}>
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/30 text-xs">
                  <td className="px-6 py-3 font-mono text-slate-500">{log.timestamp}</td>
                  <td className="px-6 py-3 font-semibold text-slate-300">{log.user_name}</td>
                  <td className="px-6 py-3 text-purple-400 font-bold">{log.action}</td>
                  <td className="px-6 py-3 text-slate-400 capitalize">{log.entity}</td>
                  <td className="px-6 py-3 text-slate-500 font-mono">{log.ip_address}</td>
                  <td className="px-6 py-3 font-mono text-[10px] font-bold text-slate-500">{log.anonymisation_token}</td>
                </tr>
              ))}
            </Table>
          </Card>
        </div>
      )}
    </div>
  );
};
export default ConfigPage;
