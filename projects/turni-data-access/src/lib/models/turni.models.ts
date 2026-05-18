export type RangeMode = 'MONTH' | 'WEEK';

export type ShiftType = 'MATTINA' | 'POMERIGGIO' | 'NOTTE';

export type AssignmentSource =
    | 'AUTO'
    | 'FORCED'
    | 'MANUAL'
    | 'ABSENCE';

export type ManualAssignmentReason =
    | 'MANUAL_INSERT'
    | 'SHIFT_CHANGE'
    | 'SHIFT_SWAP';

export type AbsenceType =
    | 'MALATTIA'
    | 'FERIE'
    | 'PERMESSO'
    | 'RIPOSO';

export type AssignmentRuleCode =
    | 'WORKER_DISABLED'
    | 'CAN_WORK_SHIFT'
    | 'ALREADY_WORKED_TODAY'
    | 'ALREADY_ASSIGNED_TO_SHIFT'
    | 'WORKER_IN_SICK_LEAVE'
    | 'WORKER_ABSENT'
    | 'MAX_MONTHLY_HOURS'
    | 'MAX_NIGHT_SHIFTS_MONTH'
    | 'MAX_NIGHT_SHIFTS_WEEK'
    | 'MAX_CONSECUTIVE_DAYS'
    | 'MAX_CONSECUTIVE_SHIFT'
    | 'REST_AFTER_NIGHT';


export type StatsFilterType =
    | 'ALL'
    | 'FORCED'
    | 'EXTRA'
    | 'UNDER_HOURS'
    | 'NO_FREE_WEEKEND';

export type WarningFilterType =
    | 'ALL'
    | 'ERROR'
    | 'WARNING'
    | 'INFO'
    | 'FORCED';

export type SchedulePlanSource =
    | 'GENERATED'
    | 'CACHE'
    | 'REGENERATED';

export type ScheduleWarningSeverity =
    | 'ERROR'
    | 'WARNING'
    | 'INFO';

export type DayHealthStatus =
    | 'OK'
    | 'WARNING'
    | 'ERROR';

export interface RuleCheckResult {
    allowed: boolean;
    hardBlocked: boolean;
    score: number;
    violatedRules: AssignmentRuleCode[];
    messages: string[];
}


export interface ScheduleNavigationExtras {
    workerId?: string;
    statsFilter?: StatsFilterType;
    warningFilter?: WarningFilterType;
    filter?: StatsFilterType | WarningFilterType;
    origin?: string;
    periodDate?: string;
}

export interface WorkerAbsence {
    id: string;
    workerId: string;
    type: AbsenceType;
    startDate: string;
    endDate: string;
    startTime?: string;
    endTime?: string;
    note?: string;
}

export interface WorkerContract {
    weeklyHours: number;
    monthlyHours: number;
    minMonthlyHours?: number;
    maxMonthlyHours?: number;
    partTime: boolean;
}

export interface WorkerRules {
    canWorkMorning: boolean;
    canWorkAfternoon: boolean;
    canWorkNight: boolean;

    maxConsecutiveDays: number;

    maxConsecutiveMorningShifts: number;
    maxConsecutiveAfternoonShifts: number;
    maxConsecutiveNightShifts: number;

    maxNightShiftsPerWeek: number;
    maxNightShiftsPerMonth: number;

    restAfterNight: boolean;
    requireAtLeastOneFreeWeekendPerMonth: boolean;
}

export interface WorkerEditorDraft {
    id?: string;
    firstName: string;
    lastName: string;
    fullName: string;
    name: string;
    color: string;
    role?: string;
    enabled: boolean;
    contract: WorkerContract;
    rules: WorkerRules;
}

export interface Worker {
    id: string;
    firstName?: string;
    lastName?: string;
    fullName: string;
    name: string;
    color: string;
    role?: string;
    skills?: string[];
    enabled?: boolean;
    contract?: WorkerContract;
    rules?: WorkerRules;
}

export interface ShiftDefinition {
    type: ShiftType;
    label: string;
    start: string;
    end: string;
    requiredWorkers: number;
    hours: number;
}

export interface AssignedShift {
    id: string;
    date: string;
    shift: ShiftType;
    workerId: string;
    workerName: string;
    hours: number;

    source: AssignmentSource;

    manualReason?: ManualAssignmentReason;
    changedFromDate?: string;
    changedFromShift?: ShiftType;
    changedFromWorkerId?: string;
    changedWithWorkerId?: string;
    changeNote?: string;

    forcedReason?: string;
    violatedRules: AssignmentRuleCode[];
    extraHours: number;

    isFigurative?: boolean;
    absenceType?: AbsenceType;
    absenceNote?: string;

    replacesWorkerId?: string;
    replacesWorkerName?: string;
    replacedByWorkerId?: string;
    replacedByWorkerName?: string;

    hasEarlyLeave?: boolean;
    leaveTime?: string;
    leaveReason?: 'PERMESSO' | 'USCITA_ANTICIPATA';
    leaveNote?: string;

    isLongShift?: boolean;
    longForWorkerId?: string;
    longForWorkerName?: string;
    longFromTime?: string;
    longReason?: 'PERMESSO' | 'USCITA_ANTICIPATA';
    longNote?: string;
}

export interface DaySchedule {
    date: string;
    label: string;
    isWeekend: boolean;
    assignments: AssignedShift[];
    warnings: ScheduleWarning[];
    indicators: DayScheduleIndicators;
}

export interface DayScheduleIndicators {
    status: DayHealthStatus;
    totalWarnings: number;
    errorWarnings: number;
    uncoveredShifts: number;
    forcedAssignments: number;
    absentWorkers: number;
    sickWorkers: number;
    figurativeAssignments: number;
}

export interface DateRange {
    mode: RangeMode;
    referenceDate: string;
    startDate: string;
    endDate: string;
    label: string;
}

export interface WorkerStats {
    workerId: string;
    workerName: string;

    totalAssignments: number;
    totalHours: number;

    morningCount: number;
    afternoonCount: number;
    nightCount: number;

    maxConsecutiveMorningShiftsReached: number;
    maxConsecutiveAfternoonShiftsReached: number;
    maxConsecutiveNightShiftsReached: number;

    maxNightShiftsInWeek: number;

    weekendWorkedCount: number;
    freeWeekendCount: number;

    forcedAssignmentsCount: number;
    extraHours: number;

    contractMonthlyHours: number;
    minMonthlyHours?: number;
    maxMonthlyHours?: number;
}

export interface ScheduleWarning {
    id: string;
    severity: ScheduleWarningSeverity;
    date?: string;
    shift?: ShiftType;
    workerId?: string;
    workerName?: string;
    message: string;
}

export interface SchedulePlan {
    range: DateRange;
    days: DaySchedule[];
    warnings: ScheduleWarning[];
    stats: WorkerStats[];
    source: SchedulePlanSource;
    generatedAt: string;
}

export interface ShiftReplacementResult {
    plan: SchedulePlan;
    absences: WorkerAbsence[];
    replaced: boolean;
    forced: boolean;
    uncovered: boolean;
    originalWorkerId: string;
    originalWorkerName?: string;
    replacementWorkerId?: string;
    replacementWorkerName?: string;
    message: string;
}

export interface PendingSickReplacement {
    date: string;
    shift: ShiftType;
    originalWorkerId: string;
    originalWorkerName: string;
    replacementWorkerId?: string;
    replacementWorkerName?: string;
    excludedReplacementWorkerIds: string[];
    proposedPlan: SchedulePlan;
    proposedAbsences: WorkerAbsence[];
    message: string;
    forced: boolean;
    uncovered: boolean;
}


export type PlanGenerationStepType =
    | 'STARTED'
    | 'DAY_GENERATED'
    | 'COMPLETED'
    | 'CANCELLED';

export interface PlanGenerationStep {
    type: PlanGenerationStepType;
    progress: number;
    currentDate?: string;
    days?: DaySchedule[];
    plan?: SchedulePlan;
}


export type ShiftChangeMode =
    | 'MOVE_SAME_DAY'
    | 'SWAP_SAME_DAY'
    | 'MOVE_OTHER_DAY';

export interface ShiftChangeParams {
    mode: ShiftChangeMode;
    sourceDate: string;
    sourceShift: ShiftType;
    sourceWorkerId: string;
    targetDate?: string;
    targetShift: ShiftType;
    targetWorkerId?: string;
    note?: string;
}
