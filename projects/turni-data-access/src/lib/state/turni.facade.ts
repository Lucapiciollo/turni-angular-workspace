import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { RangeMode, ScheduleRange, ShiftType } from '../models/turni.models';
import { TurniActions } from './turni.actions';
import * as TurniSelectors from './turni.selectors';

@Injectable({ providedIn: 'root' })
export class TurniFacade {
  private store: Store = inject(Store);
  loading$ = this.store.select(TurniSelectors.selectLoading);
  error$ = this.store.select(TurniSelectors.selectError);
  workers$ = this.store.select(TurniSelectors.selectWorkers);
  plan$ = this.store.select(TurniSelectors.selectPlan);
  planCache$ = this.store.select(TurniSelectors.selectPlanCache);
  currentRange$ = this.store.select(TurniSelectors.selectCurrentRange);
  rangeKeys$ = this.store.select(TurniSelectors.selectRangeKeys);
  days$ = this.store.select(TurniSelectors.selectDays);
  issues$ = this.store.select(TurniSelectors.selectIssues);
  errors$ = this.store.select(TurniSelectors.selectErrors);
  warnings$ = this.store.select(TurniSelectors.selectWarnings);
  infos$ = this.store.select(TurniSelectors.selectInfos);
  audits$ = this.store.select(TurniSelectors.selectAudits);
  optimizer$ = this.store.select(TurniSelectors.selectOptimizer);
  stats$ = this.store.select(TurniSelectors.selectWorkerStats);
  canPublish$ = this.store.select(TurniSelectors.selectCanPublish);
  isWeekMode$ = this.store.select(TurniSelectors.selectIsWeekMode);
  isMonthMode$ = this.store.select(TurniSelectors.selectIsMonthMode);
  workerMap$ = this.store.select(TurniSelectors.selectWorkerMap);

  load(): void { this.store.dispatch(TurniActions.loadPlanningData()); }
  setRangeMode(mode: RangeMode): void { this.store.dispatch(TurniActions.setRangeMode({ mode })); }
  previousRange(): void { this.store.dispatch(TurniActions.navigatePreviousRange()); }
  nextRange(): void { this.store.dispatch(TurniActions.navigateNextRange()); }
  openRange(range: ScheduleRange): void { this.store.dispatch(TurniActions.openRange({ range })); }
  generateRange(range: ScheduleRange): void { this.store.dispatch(TurniActions.generateRange({ range })); }
  regenerateCurrentRange(): void { this.store.dispatch(TurniActions.regenerateCurrentRange()); }
  createPlan(name: string, startDate: string, endDate: string): void { this.store.dispatch(TurniActions.createPlan({ name, startDate, endDate })); }
  save(): void { this.store.dispatch(TurniActions.savePlan()); }
  publish(): void { this.store.dispatch(TurniActions.publishPlan()); }
  archive(): void { this.store.dispatch(TurniActions.archivePlan()); }
  optimize(): void { this.store.dispatch(TurniActions.optimizePlan()); }
  recalculateIssues(): void { this.store.dispatch(TurniActions.recalculateIssues()); }
  assignWorker(date: string, shift: ShiftType, workerId: string, forced = false): void { this.store.dispatch(TurniActions.assignWorker({ date, shift, workerId, forced })); }
  removeWorker(date: string, shift: ShiftType, workerId: string): void { this.store.dispatch(TurniActions.removeWorker({ date, shift, workerId })); }
  lock(assignmentId: string): void { this.store.dispatch(TurniActions.lockAssignment({ assignmentId })); }
  unlock(assignmentId: string): void { this.store.dispatch(TurniActions.unlockAssignment({ assignmentId })); }
  move(assignmentId: string, targetDate: string, targetShift: ShiftType, forced = false): void { this.store.dispatch(TurniActions.moveAssignment({ assignmentId, targetDate, targetShift, forced })); }
  clearShift(date: string, shift: ShiftType): void { this.store.dispatch(TurniActions.clearShift({ date, shift })); }
}
