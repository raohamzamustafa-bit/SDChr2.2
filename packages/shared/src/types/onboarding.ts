// ─── Onboarding Types ───

export type OnboardingTaskStatus = 'pending' | 'in_progress' | 'completed' | 'overdue' | 'skipped';

export interface OnboardingChecklist {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  tasks: OnboardingChecklistTask[];
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OnboardingChecklistTask {
  id: string;
  title: string;
  description?: string;
  assigneeRole: string;
  daysFromJoining: number;
  isMandatory: boolean;
  sortOrder: number;
}

export interface OnboardingInstance {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeName?: string;
  checklistId: string;
  checklistName?: string;
  tasks: OnboardingTaskInstance[];
  completedCount: number;
  totalCount: number;
  progressPercentage: number;
  startedAt: string;
  completedAt?: string;
  createdAt: string;
}

export interface OnboardingTaskInstance {
  id: string;
  taskId: string;
  title: string;
  description?: string;
  assigneeId?: string;
  assigneeName?: string;
  status: OnboardingTaskStatus;
  dueDate: string;
  completedAt?: string;
  notes?: string;
  sortOrder: number;
}
