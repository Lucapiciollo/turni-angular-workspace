import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, delay, map, of, tap, withLatestFrom } from 'rxjs';
import { TurniActions } from './turni.actions';
import { MockTurniApiService } from '../services/mock-turni-api.service';
import { selectAudits, selectPlan } from './turni.selectors';
import { TurniState } from './turni.reducer';

@Injectable()
export class TurniEffects {

  public store: Store<{ reducer: TurniState }> = inject(Store<{ reducer: TurniState }>);
  private actions: Actions = inject(Actions);

  load$ = createEffect(() => this.actions.pipe(
    ofType(TurniActions.loadPlanningData),
    delay(250),
    map(() => this.api.load()),
    map(data => TurniActions.loadPlanningDataSuccess(data)),
    catchError(err => of(TurniActions.loadPlanningDataFailure({ error: String(err) })))
  ));

  persist$ = createEffect(() => this.actions.pipe(
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
      TurniActions.optimizePlan
    ),
    withLatestFrom(this.store.select(selectPlan), this.store.select(selectAudits)),
    tap(([, plan, audits]) => this.api.persist(plan, audits))
  ), { dispatch: false });

  constructor(private api: MockTurniApiService) { }
}
