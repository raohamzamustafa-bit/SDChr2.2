// ─── User & Auth Types ───

export type UserRole =
  | 'super_admin'
  | 'tenant_admin'
  | 'hr_manager'
  | 'hr_officer'
  | 'department_head'
  | 'manager'
  | 'employee';

export interface User {
  id: string;
  tenantId: string;
  email: string;
  role: UserRole;
  employeeId?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export interface LoginDto {
  email: string;
  password: string;
  tenantSlug?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthUser {
  user: User;
  tokens: AuthTokens;
  tenant: {
    id: string;
    name: string;
    slug: string;
    tier: number;
    branding: Record<string, string>;
  };
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
}
