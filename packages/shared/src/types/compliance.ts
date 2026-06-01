// ─── Compliance Types ───

export interface ComplianceConfig {
  country: string;
  countryName: string;
  currency: string;
  currencySymbol: string;
  fiscalYearStartMonth: number;
  dateFormat: string;
  taxSlabs: TaxSlab[];
  statutoryDeductions: StatutoryDeduction[];
  leaveDefaults: LeaveDefault[];
  holidays: HolidayConfig[];
  bankExportFormats: string[];
  requiredComplianceFields: ComplianceField[];
  workingHoursPerDay: number;
  workingDaysPerWeek: number;
  overtimeRules: OvertimeRule;
  probationPeriodMonths: number;
  noticePeriodDays: number;
}

export interface TaxSlab {
  minIncome: number;
  maxIncome: number | null;
  rate: number;
  fixedAmount: number;
  description: string;
}

export interface StatutoryDeduction {
  code: string;
  name: string;
  type: 'employee' | 'employer' | 'both';
  calculationType: 'fixed' | 'percentage';
  employeeRate?: number;
  employerRate?: number;
  fixedAmount?: number;
  maxCeiling?: number;
  minSalaryThreshold?: number;
  isActive: boolean;
}

export interface LeaveDefault {
  code: string;
  name: string;
  defaultDays: number;
  isCarryForward: boolean;
  isPaid: boolean;
}

export interface HolidayConfig {
  name: string;
  date: string;
  isRecurring: boolean;
  calendarType: 'gregorian' | 'hijri';
}

export interface ComplianceField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select';
  isRequired: boolean;
  options?: string[];
  description?: string;
}

export interface OvertimeRule {
  regularRate: number;
  weekendRate: number;
  holidayRate: number;
  maxOvertimeHoursPerMonth: number;
}
