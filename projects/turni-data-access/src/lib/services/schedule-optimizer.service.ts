import { Injectable } from '@angular/core';
import { OptimizerResult, SchedulePlan, ShiftDefinition, ValidationIssue, Worker } from '../models/turni.models';
import { defaultShiftDefinitions, optimizePlan, planPenalty } from '../utils/schedule-engine.utils';
@Injectable({ providedIn: 'root' })
export class ScheduleOptimizerService {
  optimize(plan: SchedulePlan, workers: Worker[], shifts: ShiftDefinition[] = defaultShiftDefinitions, attempts = 120): { plan: SchedulePlan; issues: ValidationIssue[]; optimizer: OptimizerResult } { return optimizePlan(plan, workers, shifts, attempts); }
  score(plan: SchedulePlan, workers: Worker[], shifts: ShiftDefinition[] = defaultShiftDefinitions): number { return planPenalty(plan, workers, shifts); }
}
