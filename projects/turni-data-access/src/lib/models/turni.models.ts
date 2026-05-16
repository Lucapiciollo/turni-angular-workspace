export type ShiftType = 'MATTINA' | 'POMERIGGIO' | 'NOTTE';
export type AssignmentSource = 'AUTO' | 'MANUAL' | 'FORCED';
export type PlanStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type IssueSeverity = 'ERROR' | 'WARNING' | 'INFO';

export interface Worker {
  id: string;
  name: string;
  initials: string;
  color: 'indigo' | 'green' | 'pink' | 'orange';
  role: string;
  weeklyHours: number;
  allowedShifts: ShiftType[];
}

export interface ShiftDefinition {
  type: ShiftType;
  label: string;
  start: string;
  end: string;
  requiredWorkers: number;
  hours: number;
}

export interface Assignment {
  id: string;
  date: string;
  shift: ShiftType;
  workerId: string;
  source: AssignmentSource;
  locked: boolean;
  forced?: boolean;
}

export interface DaySchedule {
  date: string;
  weekday: string;
  dayNumber: string;
  monthLabel: string;
  badges: string[];
  assignments: Assignment[];
  warnings: ValidationIssue[];
}

export interface SchedulePlan {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: PlanStatus;
  days: DaySchedule[];
  updatedAt: string;
  saved?: boolean;
}

export interface ValidationIssue {
  id: string;
  severity: IssueSeverity;
  title: string;
  message: string;
  date?: string;
  shift?: ShiftType;
  workerId?: string;
}

export type AuditAction =
  | 'CREATE_PLAN' | 'LOAD_DATA' | 'SAVE_PLAN' | 'PUBLISH_PLAN' | 'OPTIMIZE_PLAN'
  | 'ASSIGN_WORKER' | 'REMOVE_WORKER' | 'LOCK_ASSIGNMENT' | 'UNLOCK_ASSIGNMENT'
  | 'MOVE_ASSIGNMENT' | 'FORCE_ASSIGNMENT' | 'CLEAR_SHIFT';

export interface AuditLog {
  id: string;
  action: AuditAction;
  message: string;
  createdAt: string;
  createdBy: string;
  date?: string;
  shift?: ShiftType;
  workerId?: string;
}

export interface WorkerStats {
  workerId: string;
  name: string;
  initials: string;
  color: Worker['color'];
  turni: number;
  ore: number;
  notti: number;
  weekend: number;
  manuali: number;
  completamento: number;
}

export interface OptimizerResult {
  score: number;
  attempts: number;
  errors: number;
  warnings: number;
}
