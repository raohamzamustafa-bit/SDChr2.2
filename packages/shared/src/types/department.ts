// ─── Department & Designation Types ───

export interface Department {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  parentId?: string;
  headId?: string;
  headName?: string;
  description?: string;
  isActive: boolean;
  employeeCount?: number;
  children?: Department[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateDepartmentDto {
  name: string;
  code: string;
  parentId?: string;
  headId?: string;
  description?: string;
}

export interface Designation {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  grade?: number;
  departmentId?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDesignationDto {
  name: string;
  code: string;
  grade?: number;
  departmentId?: string;
  description?: string;
}
