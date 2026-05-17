import { Injectable } from '@angular/core';
import { GeneratePlanOptions, SchedulePlan, ScheduleRange, ShiftDefinition, Worker, WorkerAbsence, Holiday } from '../models/turni.models';
import { defaultShiftDefinitions, generatePlan, regenerateAutomaticKeepingManual } from '../utils/schedule-engine.utils';
@Injectable({ providedIn: 'root' })
export class ShiftSchedulerService {
  generate(options: GeneratePlanOptions): SchedulePlan { return generatePlan({ ...options, shifts: options.shifts ?? defaultShiftDefinitions }); }
  generateForRange(range: ScheduleRange, workers: Worker[], shifts: ShiftDefinition[] = defaultShiftDefinitions, absences: WorkerAbsence[] = [], holidays: Holiday[] = [], previousPlan: SchedulePlan | null = null): SchedulePlan { return generatePlan({ range, workers, shifts, absences, holidays, previousPlan }); }
  regenerateKeepingManual(plan: SchedulePlan, workers: Worker[], shifts: ShiftDefinition[] = defaultShiftDefinitions): SchedulePlan { return regenerateAutomaticKeepingManual(plan, workers, shifts); }
}
