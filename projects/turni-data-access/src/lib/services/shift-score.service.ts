import { Injectable } from '@angular/core';
import { Holiday, SchedulePlan, ShiftDefinition, Worker } from '../models/turni.models';
import { defaultShiftDefinitions, workerScore } from '../utils/schedule-engine.utils';
@Injectable({ providedIn: 'root' })
export class ShiftScoreService {
  score(worker: Worker, date: string, shift: ShiftDefinition, partialPlan: SchedulePlan | null, shifts: ShiftDefinition[] = defaultShiftDefinitions, holidays: Holiday[] = []): number { return workerScore(worker, date, shift, partialPlan, shifts, holidays); }
  sort(workers: Worker[], date: string, shift: ShiftDefinition, partialPlan: SchedulePlan | null, shifts: ShiftDefinition[] = defaultShiftDefinitions, holidays: Holiday[] = []): Worker[] { return [...workers].sort((a,b) => this.score(a,date,shift,partialPlan,shifts,holidays) - this.score(b,date,shift,partialPlan,shifts,holidays)); }
}
