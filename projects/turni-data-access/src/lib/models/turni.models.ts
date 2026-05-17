export type ShiftType = 'MATTINA' | 'POMERIGGIO' | 'NOTTE';
export type AssignmentSource = 'AUTO' | 'MANUAL' | 'FORCED';
export type PlanStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type IssueSeverity = 'ERROR' | 'WARNING' | 'INFO';
export type RangeMode = 'MONTH' | 'WEEK';
export type AbsenceType = 'FERIE' | 'MALATTIA' | 'PERMESSO' | 'NON_DISPONIBILE';

export interface WorkerContract { weeklyHours: number; monthlyTargetHours?: number; partTime?: boolean; partTimePercentage?: number; }
export interface WorkerRules { maxConsecutiveDays?: number; maxWeeklyHours?: number; maxMonthlyHours?: number; maxNightShiftsPerMonth?: number; minRestHoursBetweenShifts?: number; preferredShifts?: ShiftType[]; restAfterNight?: boolean; allowWeekend?: boolean; allowHolidays?: boolean; }
export interface Worker {
  id: string; name: string; initials: string; color: 'indigo'|'green'|'pink'|'orange'|'cyan'|'slate'; role: string;
  allowedShifts: ShiftType[]; weeklyHours: number; contract?: WorkerContract; rules?: WorkerRules;
  unavailableDates?: string[]; skills?: string[]; roles?: string[];
  maxConsecutiveDays?: number; maxNightShiftsPerMonth?: number; minRestHoursBetweenShifts?: number; restAfterNight?: boolean; allowWeekend?: boolean; allowHolidays?: boolean; preferredShifts?: ShiftType[];
}
export interface WorkerAbsence { workerId: string; startDate: string; endDate: string; type: AbsenceType; note?: string; }
export interface Holiday { date: string; name: string; }
export interface ShiftRequirement { role?: string; skill?: string; count: number; }
export interface ShiftDefinition { type: ShiftType; label: string; start: string; end: string; requiredWorkers: number; hours: number; crossesMidnight?: boolean; requirements?: ShiftRequirement[]; }
export interface Assignment { id: string; date: string; shift: ShiftType; workerId: string; source: AssignmentSource; locked: boolean; forced?: boolean; createdAt?: string; updatedAt?: string; }
export interface DaySchedule { date: string; weekday: string; dayNumber: string; monthLabel: string; badges: string[]; assignments: Assignment[]; warnings: ValidationIssue[]; }
export interface ScheduleRange { key: string; mode: RangeMode; label: string; startDate: string; endDate: string; visibleDays: number; anchorDate?: string; }
export interface SchedulePlan { id: string; rangeKey: string; mode: RangeMode; name: string; startDate: string; endDate: string; status: PlanStatus; days: DaySchedule[]; absences: WorkerAbsence[]; holidays: Holiday[]; updatedAt: string; createdAt?: string; publishedAt?: string; saved?: boolean; }
export interface ValidationIssue { id: string; severity: IssueSeverity; title: string; message: string; date?: string; shift?: ShiftType; workerId?: string; assignmentId?: string; }
export type AuditAction = 'CREATE_PLAN'|'LOAD_DATA'|'SAVE_PLAN'|'PUBLISH_PLAN'|'ARCHIVE_PLAN'|'OPTIMIZE_PLAN'|'ASSIGN_WORKER'|'REMOVE_WORKER'|'LOCK_ASSIGNMENT'|'UNLOCK_ASSIGNMENT'|'MOVE_ASSIGNMENT'|'FORCE_ASSIGNMENT'|'CLEAR_SHIFT'|'NAVIGATE_RANGE'|'CHANGE_RANGE_MODE'|'REGENERATE_KEEPING_LOCKED'|'RECALCULATE_ISSUES'|'EXPORT_CSV';
export interface AuditLog { id: string; action: AuditAction; message: string; createdAt: string; createdBy: string; date?: string; shift?: ShiftType; workerId?: string; oldValue?: unknown; newValue?: unknown; }
export interface WorkerStats { workerId: string; name: string; initials: string; color: Worker['color']; turni: number; ore: number; notti: number; weekend: number; festivi: number; manuali: number; forzati: number; completamento: number; }
export interface OptimizerResult { score: number; attempts: number; errors: number; warnings: number; }
export interface GeneratePlanOptions { range: ScheduleRange; workers: Worker[]; shifts: ShiftDefinition[]; absences?: WorkerAbsence[]; holidays?: Holiday[]; previousPlan?: SchedulePlan | null; prioritizeNights?: boolean; }
export interface MoveAssignmentPayload { assignmentId: string; targetDate: string; targetShift: ShiftType; forced?: boolean; }
export interface CanAssignContext { worker: Worker; date: string; shift: ShiftDefinition; partialPlan: SchedulePlan | null; currentDayAssignments: Assignment[]; workers: Worker[]; shifts: ShiftDefinition[]; absences: WorkerAbsence[]; holidays: Holiday[]; }
