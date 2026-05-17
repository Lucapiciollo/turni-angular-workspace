import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, delay, map, of, tap, withLatestFrom } from 'rxjs';
import { TurniActions } from './turni.actions';
import { MockTurniApiService } from '../services/mock-turni-api.service';
import { selectAudits, selectCurrentRange, selectIssues, selectOptimizer, selectPlanCache, selectWorkers } from './turni.selectors';

@Injectable()
export class TurniEffects {
  private actions$: Actions = inject(Actions);
  private store: Store = inject(Store);
  private api: MockTurniApiService = inject(MockTurniApiService);
  load$ = createEffect(() => this.actions$.pipe(
    ofType(TurniActions.loadPlanningData),
    delay(150),
    map(() => this.api.load()),
    map(data => TurniActions.loadPlanningDataSuccess(data)),
    catchError(err => of(TurniActions.loadPlanningDataFailure({ error: String(err) })))
  ));

  persist$ = createEffect(() => this.actions$.pipe(
    ofType(
      TurniActions.savePlan,
      TurniActions.publishPlan,
      TurniActions.archivePlan,
      TurniActions.assignWorker,
      TurniActions.removeWorker,
      TurniActions.lockAssignment,
      TurniActions.unlockAssignment,
      TurniActions.moveAssignment,
      TurniActions.clearShift,
      TurniActions.optimizePlan,
      TurniActions.navigatePreviousRange,
      TurniActions.navigateNextRange,
      TurniActions.setRangeMode,
      TurniActions.regenerateCurrentRange,
      TurniActions.createPlan,
      TurniActions.openRange,
      TurniActions.generateRange,
      TurniActions.recalculateIssues
    ),
    withLatestFrom(
      this.store.select(selectWorkers),
      this.store.select(selectPlanCache),
      this.store.select(selectCurrentRange),
      this.store.select(selectIssues),
      this.store.select(selectAudits),
      this.store.select(selectOptimizer)
    ),
    tap(([, workers, planCache, currentRange, issues, audits, optimizer]) => {
      if (!currentRange) return;
      this.api.persist({ workers, planCache, currentRange, issues, audits, optimizer: optimizer ?? { score: 0, attempts: 0, errors: 0, warnings: 0 } });
    })
  ), { dispatch: false });
}
