// ─── Leave Types ───

export type LeaveRequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface LeaveType {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  defaultDays: number;
  isCarryForward: boolean;
  maxCarryForwardDays: number;
  isPaid: boolean;
  isEncashable: boolean;
  applicableGender?: string;
  requiresApproval: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveBalance {
  id: string;
  tenantId: string;
  employeeId: string;
  leaveTypeId: string;
  leaveTypeName?: string;
  year: number;
  totalDays: number;
  usedDays: number;
  pendingDays: number;
  remainingDays: number;
  carriedForwardDays: number;
}

export interface LeaveRequest {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeName?: string;
  leaveTypeId: string;
  leaveTypeName?: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: LeaveRequestStatus;
  approvedById?: string;
  approvedByName?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeaveRequestDto {
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface CreateLeaveTypeDto {
  name: string;
  code: string;
  defaultDays: number;
  isCarryForward?: boolean;
  maxCarryForwardDays?: number;
  isPaid?: boolean;
  isEncashable?: boolean;
  applicableGender?: string;
  requiresApproval?: boolean;
}
