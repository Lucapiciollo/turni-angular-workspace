import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { AuditLog, OptimizerResult, RangeMode, SchedulePlan, ScheduleRange, ShiftType, ValidationIssue, Worker } from '../models/turni.models';
export const TurniActions = createActionGroup({
  source: 'Turni',
  events: {
    'Load Planning Data': emptyProps(),
    'Load Planning Data Success': props<{ workers: Worker[]; planCache: Record<string, SchedulePlan>; currentRange: ScheduleRange; issues: ValidationIssue[]; audits: AuditLog[]; optimizer: OptimizerResult }>(),
    'Load Planning Data Failure': props<{ error: string }>(),
    'Set Range Mode': props<{ mode: RangeMode }>(),
    'Navigate Previous Range': emptyProps(),
    'Navigate Next Range': emptyProps(),
    'Open Range': props<{ range: ScheduleRange }>(),
    'Generate Range': props<{ range: ScheduleRange }>(),
    'Regenerate Current Range': emptyProps(),
    'Create Plan': props<{ name: string; startDate: string; endDate: string }>(),
    'Save Plan': emptyProps(),
    'Publish Plan': emptyProps(),
    'Archive Plan': emptyProps(),
    'Optimize Plan': emptyProps(),
    'Assign Worker': props<{ date: string; shift: ShiftType; workerId: string; forced?: boolean }>(),
    'Remove Worker': props<{ date: string; shift: ShiftType; workerId: string }>(),
    'Lock Assignment': props<{ assignmentId: string }>(),
    'Unlock Assignment': props<{ assignmentId: string }>(),
    'Move Assignment': props<{ assignmentId: string; targetDate: string; targetShift: ShiftType; forced?: boolean }>(),
    'Clear Shift': props<{ date: string; shift: ShiftType }>(),
    'Recalculate Issues': emptyProps(),
    'Audit Added': props<{ log: AuditLog }>(),
  }
});
