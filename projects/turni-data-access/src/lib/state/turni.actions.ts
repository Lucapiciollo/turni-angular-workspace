import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Assignment, AuditLog, DaySchedule, OptimizerResult, SchedulePlan, ShiftType, ValidationIssue, Worker } from '../models/turni.models';

export const TurniActions = createActionGroup({
  source: 'Turni',
  events: {
    'Load Planning Data': emptyProps(),
    'Load Planning Data Success': props<{ workers: Worker[]; plan: SchedulePlan; issues: ValidationIssue[]; audits: AuditLog[]; optimizer: OptimizerResult }>(),
    'Load Planning Data Failure': props<{ error: string }>(),

    'Create Plan': props<{ name: string; startDate: string; endDate: string }>(),
    'Save Plan': emptyProps(),
    'Publish Plan': emptyProps(),
    'Archive Plan': emptyProps(),
    'Optimize Plan': emptyProps(),
    'Optimize Plan Success': props<{ plan: SchedulePlan; issues: ValidationIssue[]; optimizer: OptimizerResult }>(),

    'Assign Worker': props<{ date: string; shift: ShiftType; workerId: string; forced?: boolean }>(),
    'Remove Worker': props<{ date: string; shift: ShiftType; workerId: string }>(),
    'Lock Assignment': props<{ assignmentId: string }>(),
    'Unlock Assignment': props<{ assignmentId: string }>(),
    'Move Assignment': props<{ assignmentId: string; targetDate: string; targetShift: ShiftType; forced?: boolean }>(),
    'Clear Shift': props<{ date: string; shift: ShiftType }>(),

    'Recalculate Issues': emptyProps(),
    'Audit Added': props<{ log: AuditLog }>()
  }
});
