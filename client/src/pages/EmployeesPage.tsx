/* ================================================================
   SDC HR Solutions — Employee registry desk
   Supports field-level decryption toggles, document expiries, and HR approvals.
   ================================================================ */

import React, { useState } from 'react';
import { useEmployeeStore } from '../store/employeeStore';
import { useOrgStore } from '../store/departmentStore';
import { Card, Table, Tabs, Badge, Button, Modal, Input, Select } from '../components/ui';
import { decrypt, encrypt } from '../lib/encryption';
import { Employee, Gender, MaritalStatus, EmploymentType, EmployeeStatus } from '../types';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Search, UserPlus, Check, X, ShieldAlert } from 'lucide-react';

export const EmployeesPage: React.FC = () => {
  const { employees, pending_changes, addEmployee, updateEmployee, approveChangeRequest, rejectChangeRequest } = useEmployeeStore();
  const { departments, designations, branches } = useOrgStore();

  const [activeTab, setActiveTab] = useState('registry');
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Form Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [viewEmployee, setViewEmployee] = useState<Employee | null>(null);

  // PII Visibility states (employeeId -> fieldName -> boolean)
  const [piiVisible, setPiiVisible] = useState<Record<string, Record<string, boolean>>>({});

  // Add Employee Form States
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('1995-01-01');
  const [gender, setGender] = useState<Gender>('male');
  const [maritalStatus, setMaritalStatus] = useState<MaritalStatus>('single');
  const [nationalId, setNationalId] = useState('');
  const [passport, setPassport] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [taxId, setTaxId] = useState('');
  const [deptId, setDeptId] = useState('dept_eng');
  const [desigId, setDesigId] = useState('desig_se');
  const [branchId, setBranchId] = useState('br_lh');
  const [joiningDate, setJoiningDate] = useState('2026-06-01');
  const [probationEnd, setProbationEnd] = useState('2026-09-01');
  const [empType, setEmpType] = useState<EmploymentType>('permanent');
  const [salary, setSalary] = useState('');

  const togglePii = (empId: string, field: string) => {
    setPiiVisible(prev => ({
      ...prev,
      [empId]: {
        ...prev[empId],
        [field]: !prev[empId]?.[field]
      }
    }));
  };

  const handleAddEmployeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !salary || !nationalId) {
      toast.error("Please fill in all mandatory registry fields.");
      return;
    }

    addEmployee({
      employee_code: `SDC-${Math.floor(Math.random() * 900) + 100}`,
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      date_of_birth: dob,
      gender,
      marital_status: maritalStatus,
      national_id_encrypted: encrypt(nationalId),
      passport_encrypted: encrypt(passport),
      bank_account_encrypted: encrypt(bankAccount),
      tax_id_encrypted: encrypt(taxId),
      department_id: deptId,
      designation_id: desigId,
      branch_id: branchId,
      date_of_joining: joiningDate,
      probation_end_date: probationEnd,
      employment_type: empType,
      status: 'active',
      rehire_eligible: true,
      salary_encrypted: encrypt(salary),
      emergency_contacts: [],
      documents: []
    });

    toast.success("Employee profile initiated in registry.");
    setAddModalOpen(false);
    
    // Clear form
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setSalary('');
    setNationalId('');
  };

  const filteredEmployees = employees.filter(e => {
    const matchesSearch = `${e.first_name} ${e.last_name} ${e.email} ${e.employee_code}`.toLowerCase().includes(search.toLowerCase());
    const matchesDept = selectedDept === 'all' || e.department_id === selectedDept;
    const matchesStatus = selectedStatus === 'all' || e.status === selectedStatus;
    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-6">
      
      {/* Top Header Controls */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold font-heading text-slate-100">Employee Corporate Registry</h1>
          <p className="text-xs text-slate-400 mt-1">Manage personnel records, self-service approvals, and sensitive PII keys.</p>
        </div>
        <Button variant="primary" onClick={() => setAddModalOpen(true)} className="flex items-center gap-2">
          <UserPlus size={16} /> Initiate Hiring Roster
        </Button>
      </div>

      {/* Tabs */}
      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: 'registry', label: 'Personnel Registry' },
          { id: 'approvals', label: `Change Requests Queue (${pending_changes.filter(r => r.status === 'pending').length})` },
          { id: 'vault', label: 'Document Expiries Vault' }
        ]}
      />

      {activeTab === 'registry' && (
        <>
          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
            <div className="sm:col-span-2">
              <Input
                placeholder="Search by name, code, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                icon={<Search size={16} />}
              />
            </div>
            <Select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              options={[
                { value: 'all', label: 'All Departments' },
                ...departments.map(d => ({ value: d.id, label: d.name }))
              ]}
            />
            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'active', label: 'Active Roster' },
                { value: 'resigned', label: 'Separated (Resigned)' },
                { value: 'terminated', label: 'Separated (Terminated)' },
                { value: 'absconder', label: 'Separated (Absconder)' }
              ]}
            />
          </div>

          {/* Table */}
          <Card className="p-0 overflow-hidden border border-slate-800/40">
            <Table headers={["Code", "Full Name", "Department / Designation", "Employment", "Basic Pay (Encrypted)", "Status", "Actions"]}>
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No matching personnel found.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => {
                  const dept = departments.find(d => d.id === emp.department_id)?.name || "N/A";
                  const desig = designations.find(d => d.id === emp.designation_id)?.title || "N/A";
                  const isVisible = piiVisible[emp.id]?.salary;
                  const salaryVal = isVisible ? decrypt(emp.salary_encrypted) : "••••••••";

                  return (
                    <tr key={emp.id} className="hover:bg-slate-900/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-300 font-heading">{emp.employee_code}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-100">{emp.first_name} {emp.last_name}</span>
                          <span className="text-xs text-slate-500">{emp.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-slate-300">{dept}</span>
                          <span className="text-xs text-slate-500">{desig}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold uppercase text-slate-400">{emp.employment_type}</td>
                      <td className="px-6 py-4 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-200 font-bold">PKR {salaryVal}</span>
                          <button 
                            onClick={() => togglePii(emp.id, 'salary')}
                            className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-slate-300 cursor-pointer"
                          >
                            {isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={emp.status === 'active' ? 'success' : 'error'}>
                          {emp.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Button variant="secondary" className="px-3 py-1.5 text-xs rounded-xl" onClick={() => setViewEmployee(emp)}>
                          Inspect File
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </Table>
          </Card>
        </>
      )}

      {activeTab === 'approvals' && (
        <Card className="p-0 overflow-hidden border border-slate-800/40 animate-fade-in">
          <Table headers={["Request Date", "Employee", "Updated Field", "Proposed New Value", "Original Value", "Actions"]}>
            {pending_changes.filter(r => r.status === 'pending').length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                  No change requests awaiting review.
                </td>
              </tr>
            ) : (
              pending_changes.filter(r => r.status === 'pending').map((req) => (
                <tr key={req.id} className="hover:bg-slate-900/30">
                  <td className="px-6 py-4 text-xs text-slate-400">{req.submitted_at.split('T')[0]}</td>
                  <td className="px-6 py-4 font-bold text-slate-200">{req.employee_name}</td>
                  <td className="px-6 py-4 text-xs font-semibold text-purple-400 capitalize">{req.field.replace(/_encrypted/g, '')}</td>
                  <td className="px-6 py-4 text-xs font-mono font-bold text-emerald-400">{req.new_value}</td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-500">{req.old_value || "Empty"}</td>
                  <td className="px-6 py-4 flex gap-2">
                    <button 
                      onClick={() => { approveChangeRequest(req.id); toast.success("Self-service update committed."); }}
                      className="p-2 bg-emerald-600/20 hover:bg-emerald-600/35 border border-emerald-500/30 text-emerald-400 rounded-lg cursor-pointer transition-colors"
                      title="Approve"
                    >
                      <Check size={14} />
                    </button>
                    <button 
                      onClick={() => { rejectChangeRequest(req.id); toast.error("Self-service update rejected."); }}
                      className="p-2 bg-rose-600/20 hover:bg-rose-600/35 border border-rose-500/30 text-rose-400 rounded-lg cursor-pointer transition-colors"
                      title="Reject"
                    >
                      <X size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </Table>
        </Card>
      )}

      {activeTab === 'vault' && (
        <Card className="p-6 border border-slate-800/40 animate-fade-in flex flex-col gap-4">
          <div className="flex items-center gap-2 text-amber-400 bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl">
            <ShieldAlert size={20} />
            <div className="text-xs">
              <span className="font-bold">Document Expiries Vault Trigger:</span> SDC HRMS automatically parses personnel document indices every 24 hours to alert administrators of expiring CNICs, Visas, and Passports.
            </div>
          </div>

          <Table headers={["Employee Code", "Full Name", "Document Title", "Document Type", "Expiration Date", "Risk Status"]}>
            <tr className="hover:bg-slate-900/30">
              <td className="px-6 py-4 font-bold text-slate-300">SDC-001</td>
              <td className="px-6 py-4 font-semibold text-slate-100">Imran Khan</td>
              <td className="px-6 py-4 text-slate-300">CNIC Scan</td>
              <td className="px-6 py-4 text-xs font-semibold text-slate-400">ID Proof</td>
              <td className="px-6 py-4 text-xs font-mono font-bold text-slate-200">2030-12-31</td>
              <td className="px-6 py-4">
                <Badge variant="success">Secured</Badge>
              </td>
            </tr>
          </Table>
        </Card>
      )}

      {/* View/Inspect Roster Modal */}
      {viewEmployee && (
        <Modal isOpen={!!viewEmployee} onClose={() => setViewEmployee(null)} title={`Personnel File: ${viewEmployee.first_name} ${viewEmployee.last_name}`} size="lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300">
            <div className="flex flex-col gap-3">
              <h4 className="font-bold text-sm text-slate-100 border-b border-slate-800 pb-1.5 font-heading">Employment Profile</h4>
              <div>Code: <span className="font-bold font-heading text-slate-100">{viewEmployee.employee_code}</span></div>
              <div>Joined: <span className="font-semibold text-slate-200">{viewEmployee.date_of_joining}</span></div>
              <div>Probation End: <span className="font-semibold text-slate-200">{viewEmployee.probation_end_date}</span></div>
              <div>Contract: <span className="font-semibold text-slate-200">{viewEmployee.employment_type}</span></div>
              <div>Status: <Badge variant="success" className="ml-2">{viewEmployee.status}</Badge></div>
            </div>

            <div className="flex flex-col gap-3">
              <h4 className="font-bold text-sm text-slate-100 border-b border-slate-800 pb-1.5 font-heading">Encrypted PII Keys</h4>
              
              <div className="flex justify-between items-center bg-slate-950/20 p-2.5 rounded-xl border border-slate-800/40">
                <span>National ID (CNIC):</span>
                <span className="font-mono font-bold">{piiVisible[viewEmployee.id]?.cnic ? decrypt(viewEmployee.national_id_encrypted) : "••••••••"}</span>
                <button onClick={() => togglePii(viewEmployee.id, 'cnic')} className="text-slate-500 hover:text-slate-300 cursor-pointer">
                  {piiVisible[viewEmployee.id]?.cnic ? <EyeOff size={12} /> : <Eye size={12} />}
                </button>
              </div>

              <div className="flex justify-between items-center bg-slate-950/20 p-2.5 rounded-xl border border-slate-800/40">
                <span>Bank Account / IBAN:</span>
                <span className="font-mono font-bold">{piiVisible[viewEmployee.id]?.bank ? decrypt(viewEmployee.bank_account_encrypted) : "••••••••"}</span>
                <button onClick={() => togglePii(viewEmployee.id, 'bank')} className="text-slate-500 hover:text-slate-300 cursor-pointer">
                  {piiVisible[viewEmployee.id]?.bank ? <EyeOff size={12} /> : <Eye size={12} />}
                </button>
              </div>

              <div className="flex justify-between items-center bg-slate-950/20 p-2.5 rounded-xl border border-slate-800/40">
                <span>Passport Code:</span>
                <span className="font-mono font-bold">{piiVisible[viewEmployee.id]?.passport ? decrypt(viewEmployee.passport_encrypted) : "••••••••"}</span>
                <button onClick={() => togglePii(viewEmployee.id, 'passport')} className="text-slate-500 hover:text-slate-300 cursor-pointer">
                  {piiVisible[viewEmployee.id]?.passport ? <EyeOff size={12} /> : <Eye size={12} />}
                </button>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-8">
            <Button variant="secondary" onClick={() => setViewEmployee(null)}>Close File</Button>
          </div>
        </Modal>
      )}

      {/* Add/Hiring Roster Modal */}
      {addModalOpen && (
        <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="Initiate Hiring Roster Record" size="lg">
          <form onSubmit={handleAddEmployeeSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <Input label="First Name *" value={firstName} onChange={e => setFirstName(e.target.value)} required />
            <Input label="Last Name *" value={lastName} onChange={e => setLastName(e.target.value)} required />
            <Input label="Corporate Email *" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            <Input label="Phone Contact" value={phone} onChange={e => setPhone(e.target.value)} />
            <Input label="Base Salary (PKR monthly) *" type="number" value={salary} onChange={e => setSalary(e.target.value)} required />
            <Input label="National ID (CNIC) *" value={nationalId} onChange={e => setNationalId(e.target.value)} required placeholder="35201-XXXXXXX-X" />
            <Input label="Passport Code" value={passport} onChange={e => setPassport(e.target.value)} />
            <Input label="Bank Account / IBAN" value={bankAccount} onChange={e => setBankAccount(e.target.value)} placeholder="PKXX..." />
            <Input label="Tax ID (NTN)" value={taxId} onChange={e => setTaxId(e.target.value)} />
            
            <Select 
              label="Branch Location" 
              value={branchId} 
              onChange={e => setBranchId(e.target.value)}
              options={branches.map(b => ({ value: b.id, label: b.name }))}
            />

            <Select 
              label="Department Unit" 
              value={deptId} 
              onChange={e => setDeptId(e.target.value)}
              options={departments.map(d => ({ value: d.id, label: d.name }))}
            />

            <Select 
              label="Designation Grade" 
              value={desigId} 
              onChange={e => setDesigId(e.target.value)}
              options={designations.map(d => ({ value: d.id, label: d.title }))}
            />

            <Select 
              label="Employment Standard" 
              value={empType} 
              onChange={e => setEmpType(e.target.value as EmploymentType)}
              options={[
                { value: 'permanent', label: 'Permanent Fulltime' },
                { value: 'contract', label: 'Fixed Term Contract' },
                { value: 'probation', label: 'Probation Roster' },
                { value: 'intern', label: 'Intern Roster' }
              ]}
            />

            <Input label="Date of Joining" type="date" value={joiningDate} onChange={e => setJoiningDate(e.target.value)} />
            <Input label="Probation Target End Date" type="date" value={probationEnd} onChange={e => setProbationEnd(e.target.value)} />

            <div className="md:col-span-2 flex justify-end gap-2 mt-6">
              <Button type="button" variant="secondary" onClick={() => setAddModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Commit Registry Entry</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
export default EmployeesPage;
