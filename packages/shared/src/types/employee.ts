// ─── Employee Types ───

export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'intern' | 'probation';
export type EmploymentStatus = 'active' | 'on_leave' | 'terminated' | 'resigned' | 'retired' | 'absconding';
export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';
export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed';

export interface Employee {
  id: string;
  tenantId: string;
  employeeCode: string;

  // Basic Info
  firstName: string;
  lastName: string;
  fullName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: Gender;
  maritalStatus?: MaritalStatus;
  profilePhotoUrl?: string;

  // Employment
  departmentId?: string;
  departmentName?: string;
  designationId?: string;
  designationName?: string;
  reportingManagerId?: string;
  reportingManagerName?: string;
  employmentType: EmploymentType;
  employmentStatus: EmploymentStatus;
  dateOfJoining: string;
  dateOfLeaving?: string;
  probationEndDate?: string;

  // Compliance
  complianceFields: Record<string, string>;

  // Address
  address?: EmployeeAddress;

  // Emergency Contact
  emergencyContact?: EmergencyContact;

  createdAt: string;
  updatedAt: string;
}

export interface EmployeeAddress {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface CreateEmployeeDto {
  employeeCode: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: Gender;
  maritalStatus?: MaritalStatus;
  departmentId?: string;
  designationId?: string;
  reportingManagerId?: string;
  employmentType: EmploymentType;
  dateOfJoining: string;
  probationEndDate?: string;
  nationalId?: string;
  passportNumber?: string;
  bankAccount?: string;
  bankName?: string;
  iban?: string;
  complianceFields?: Record<string, string>;
}

export interface UpdateEmployeeDto extends Partial<CreateEmployeeDto> {}

export interface EmployeeListFilters {
  departmentId?: string;
  designationId?: string;
  employmentType?: EmploymentType;
  employmentStatus?: EmploymentStatus;
  search?: string;
}
