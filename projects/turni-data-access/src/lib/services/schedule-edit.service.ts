import { Injectable } from '@angular/core';
import { MoveAssignmentPayload, SchedulePlan, ShiftDefinition, ShiftType, Worker } from '../models/turni.models';
import { assignWorkerToPlan, clearShiftInPlan, defaultShiftDefinitions, lockAssignmentInPlan, moveAssignmentInPlan, removeWorkerFromPlan, withRevalidatedPlan } from '../utils/schedule-engine.utils';
@Injectable({ providedIn: 'root' })
export class ScheduleEditService {
  assign(plan: SchedulePlan, workers: Worker[], date: string, shift: ShiftType, workerId: string, forced = false, shifts: ShiftDefinition[] = defaultShiftDefinitions): SchedulePlan { return withRevalidatedPlan(assignWorkerToPlan(plan, workers, shifts, date, shift, workerId, forced), workers, shifts).plan; }
  remove(plan: SchedulePlan, workers: Worker[], date: string, shift: ShiftType, workerId: string, shifts: ShiftDefinition[] = defaultShiftDefinitions): SchedulePlan { return withRevalidatedPlan(removeWorkerFromPlan(plan, date, shift, workerId), workers, shifts).plan; }
  lock(plan: SchedulePlan, workers: Worker[], assignmentId: string, shifts: ShiftDefinition[] = defaultShiftDefinitions): SchedulePlan { return withRevalidatedPlan(lockAssignmentInPlan(plan, assignmentId, true), workers, shifts).plan; }
  unlock(plan: SchedulePlan, workers: Worker[], assignmentId: string, shifts: ShiftDefinition[] = defaultShiftDefinitions): SchedulePlan { return withRevalidatedPlan(lockAssignmentInPlan(plan, assignmentId, false), workers, shifts).plan; }
  move(plan: SchedulePlan, workers: Worker[], payload: MoveAssignmentPayload, shifts: ShiftDefinition[] = defaultShiftDefinitions): SchedulePlan { return withRevalidatedPlan(moveAssignmentInPlan(plan, payload), workers, shifts).plan; }
  clearShift(plan: SchedulePlan, workers: Worker[], date: string, shift: ShiftType, shifts: ShiftDefinition[] = defaultShiftDefinitions): SchedulePlan { return withRevalidatedPlan(clearShiftInPlan(plan, date, shift), workers, shifts).plan; }
}
