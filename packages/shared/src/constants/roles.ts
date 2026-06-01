// ─── Role Definitions & Hierarchy ───

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  TENANT_ADMIN: 'tenant_admin',
  HR_MANAGER: 'hr_manager',
  HR_OFFICER: 'hr_officer',
  DEPARTMENT_HEAD: 'department_head',
  MANAGER: 'manager',
  EMPLOYEE: 'employee',
} as const;

export type RoleKey = keyof typeof ROLES;
export type RoleValue = (typeof ROLES)[RoleKey];

/** Higher number = more privilege */
export const ROLE_HIERARCHY: Record<string, number> = {
  super_admin: 100,
  tenant_admin: 90,
  hr_manager: 70,
  hr_officer: 60,
  department_head: 50,
  manager: 40,
  employee: 10,
};

export const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  tenant_admin: 'Admin',
  hr_manager: 'HR Manager',
  hr_officer: 'HR Officer',
  department_head: 'Department Head',
  manager: 'Manager',
  employee: 'Employee',
};

/** Module-action permission matrix */
export const DEFAULT_PERMISSIONS: Record<string, Record<string, string[]>> = {
  super_admin: { '*': ['*'] },
  tenant_admin: { '*': ['create', 'read', 'update', 'delete', 'approve', 'export'] },
  hr_manager: {
    employees: ['create', 'read', 'update', 'delete'],
    attendance: ['create', 'read', 'update', 'approve'],
    leaves: ['create', 'read', 'update', 'approve'],
    payroll: ['create', 'read', 'update', 'approve'],
    onboarding: ['create', 'read', 'update'],
    letters: ['create', 'read', 'update'],
    loans: ['create', 'read', 'update', 'approve'],
    departments: ['create', 'read', 'update'],
    reports: ['read', 'export'],
    settings: ['read', 'update'],
  },
  hr_officer: {
    employees: ['create', 'read', 'update'],
    attendance: ['create', 'read', 'update'],
    leaves: ['create', 'read'],
    payroll: ['read'],
    onboarding: ['create', 'read', 'update'],
    letters: ['create', 'read'],
    loans: ['create', 'read'],
    departments: ['read'],
    reports: ['read'],
  },
  department_head: {
    employees: ['read'],
    attendance: ['read', 'approve'],
    leaves: ['read', 'approve'],
    onboarding: ['read'],
    reports: ['read'],
  },
  manager: {
    employees: ['read'],
    attendance: ['read'],
    leaves: ['read', 'approve'],
  },
  employee: {
    employees: ['read'],      // own profile only
    attendance: ['read'],     // own records
    leaves: ['create', 'read'],
    loans: ['read'],
  },
};

export function hasPermission(role: string, module: string, action: string): boolean {
  const perms = DEFAULT_PERMISSIONS[role];
  if (!perms) return false;
  if (perms['*']?.includes('*')) return true;
  if (perms['*']?.includes(action)) return true;
  return perms[module]?.includes(action) ?? false;
}
