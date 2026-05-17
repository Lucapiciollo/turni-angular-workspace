import { Injectable } from '@angular/core';
import { SchedulePlan, ShiftDefinition, ValidationIssue, Worker } from '../models/turni.models';
import { defaultShiftDefinitions, validatePlan, withRevalidatedPlan } from '../utils/schedule-engine.utils';
@Injectable({ providedIn: 'root' })
export class ScheduleValidationService {
  validate(plan: SchedulePlan, workers: Worker[], shifts: ShiftDefinition[] = defaultShiftDefinitions): ValidationIssue[] { return validatePlan(plan, workers, shifts); }
  revalidate(plan: SchedulePlan, workers: Worker[], shifts: ShiftDefinition[] = defaultShiftDefinitions): { plan: SchedulePlan; issues: ValidationIssue[] } { return withRevalidatedPlan(plan, workers, shifts); }
}
