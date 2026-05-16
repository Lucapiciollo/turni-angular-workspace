import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { ShiftType } from '../models/turni.models';
import { TurniActions } from './turni.actions';
import * as TurniSelectors from './turni.selectors';
import { TurniState } from './turni.reducer';

@Injectable({ providedIn: 'root' })
export class TurniFacade {
   public store: Store<{ reducer: TurniState  }> = inject(Store<{ reducer: TurniState  }>);
  
  constructor() { }

  loading$ = this.store.select(TurniSelectors.selectLoading);
  workers$ = this.store.select(TurniSelectors.selectWorkers);
  plan$ = this.store.select(TurniSelectors.selectPlan);
  days$ = this.store.select(TurniSelectors.selectDays);
  issues$ = this.store.select(TurniSelectors.selectIssues);
  errors$ = this.store.select(TurniSelectors.selectErrors);
  warnings$ = this.store.select(TurniSelectors.selectWarnings);
  infos$ = this.store.select(TurniSelectors.selectInfos);
  audits$ = this.store.select(TurniSelectors.selectAudits);
  optimizer$ = this.store.select(TurniSelectors.selectOptimizer);
  stats$ = this.store.select(TurniSelectors.selectWorkerStats);
  canPublish$ = this.store.select(TurniSelectors.selectCanPublish);


  load(): void { this.store.dispatch(TurniActions.loadPlanningData()); }
  createPlan(name: string, startDate: string, endDate: string): void { this.store.dispatch(TurniActions.createPlan({ name, startDate, endDate })); }
  save(): void { this.store.dispatch(TurniActions.savePlan()); }
  publish(): void { this.store.dispatch(TurniActions.publishPlan()); }
  optimize(): void { this.store.dispatch(TurniActions.optimizePlan()); }
  assignWorker(date: string, shift: ShiftType, workerId: string, forced = false): void { this.store.dispatch(TurniActions.assignWorker({ date, shift, workerId, forced })); }
  removeWorker(date: string, shift: ShiftType, workerId: string): void { this.store.dispatch(TurniActions.removeWorker({ date, shift, workerId })); }
  lock(assignmentId: string): void { this.store.dispatch(TurniActions.lockAssignment({ assignmentId })); }
  unlock(assignmentId: string): void { this.store.dispatch(TurniActions.unlockAssignment({ assignmentId })); }
  move(assignmentId: string, targetDate: string, targetShift: ShiftType, forced = false): void { this.store.dispatch(TurniActions.moveAssignment({ assignmentId, targetDate, targetShift, forced })); }
  clearShift(date: string, shift: ShiftType): void { this.store.dispatch(TurniActions.clearShift({ date, shift })); }
}
