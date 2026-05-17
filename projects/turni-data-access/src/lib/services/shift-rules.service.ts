import { Injectable } from '@angular/core';
import { Assignment, SchedulePlan, ShiftDefinition, Worker, WorkerAbsence, Holiday } from '../models/turni.models';
import { canAssignWorker, defaultShiftDefinitions } from '../utils/schedule-engine.utils';
@Injectable({ providedIn: 'root' })
export class ShiftRulesService {
  canAssign(params: { worker: Worker; date: string; shift: ShiftDefinition; partialPlan: SchedulePlan | null; currentDayAssignments: Assignment[]; workers: Worker[]; shifts?: ShiftDefinition[]; absences?: WorkerAbsence[]; holidays?: Holiday[] }): boolean {
    return canAssignWorker({ ...params, shifts: params.shifts ?? defaultShiftDefinitions, absences: params.absences ?? [], holidays: params.holidays ?? [] });
  }
}
