// ─── Attendance Types ───

export type AttendanceSource = 'manual' | 'biometric' | 'geo' | 'system';
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'half_day' | 'on_leave' | 'holiday' | 'weekend';

export interface AttendanceRecord {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeName?: string;
  employeeCode?: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  source: AttendanceSource;
  status: AttendanceStatus;
  workingHours?: number;
  overtimeHours?: number;
  lateMinutes?: number;
  earlyLeaveMinutes?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAttendanceDto {
  employeeId: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  source?: AttendanceSource;
  status?: AttendanceStatus;
  notes?: string;
}

export interface AttendancePolicy {
  id: string;
  tenantId: string;
  name: string;
  shiftStartTime: string;   // "09:00"
  shiftEndTime: string;     // "18:00"
  graceMinutes: number;     // e.g. 15 minutes
  halfDayThresholdHours: number;
  overtimeAfterHours: number;
  overtimeRateMultiplier: number;
  latePenaltyPerIncident?: number;
  latePenaltyCurrency?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceSummary {
  employeeId: string;
  month: number;
  year: number;
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  totalHalfDays: number;
  totalLeaves: number;
  totalOvertimeHours: number;
  totalWorkingHours: number;
  totalLatePenalty: number;
}

export interface AttendanceFilters {
  employeeId?: string;
  departmentId?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: AttendanceStatus;
}
