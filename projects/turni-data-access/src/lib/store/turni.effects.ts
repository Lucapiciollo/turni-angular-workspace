import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import {
    catchError,
    map,
    of,
    switchMap,
    withLatestFrom,
} from 'rxjs';

import { ABSENCES } from '../data/absences.mock';
import { SHIFTS, WORKERS } from '../data/mock-turni.data';
import { DateRangeService } from '../services/date-range.service';
import { ScheduleCacheService } from '../services/schedule-cache.service';
import { ShiftReplacementService } from '../services/shift-replacement.service';
import { TurniGeneratorService } from '../services/turni-generator.service';
import { TurniActions } from './turni.actions';
import {
    selectAbsences,
    selectGenerationSeed,
    selectMode,
    selectPlan,
    selectRange,
    selectShifts,
    selectWorkers,
} from './turni.selectors';

@Injectable()
export class TurniEffects {
    private readonly actions$: Actions = inject(Actions);
    private readonly store: Store = inject(Store);
    private readonly dateRangeService: DateRangeService = inject(DateRangeService);
    private readonly cacheService: ScheduleCacheService = inject(ScheduleCacheService);
    private readonly generatorService: TurniGeneratorService = inject(TurniGeneratorService);
    private readonly replacementService: ShiftReplacementService = inject(ShiftReplacementService);

    readonly loadInitialData$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(TurniActions.loadInitialData),
            withLatestFrom(
                this.store.select(selectWorkers),
                this.store.select(selectShifts),
                this.store.select(selectAbsences)
            ),
            switchMap(([, currentWorkers, currentShifts, currentAbsences]) => {
                try {
                    const hasStoreData =
                        currentWorkers.length > 0 &&
                        currentShifts.length > 0;

                    return of(
                        TurniActions.loadInitialDataSuccess({
                            workers: hasStoreData ? currentWorkers : [...WORKERS],
                            shifts: hasStoreData ? currentShifts : [...SHIFTS],
                            absences: hasStoreData ? currentAbsences : [...ABSENCES],
                        })
                    );
                } catch (error) {
                    return of(
                        TurniActions.loadInitialDataFailure({
                            error: error instanceof Error
                                ? error.message
                                : 'Errore caricamento dati iniziali',
                        })
                    );
                }
            })
        );
    });

    readonly init$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(TurniActions.init),
            map(() => {
                return TurniActions.loadInitialData();
            })
        );
    });

    readonly openCurrentRangeAfterLoad$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(TurniActions.loadInitialDataSuccess),
            withLatestFrom(
                this.store.select(selectMode)
            ),
            map(([, mode]) => {
                return TurniActions.openRange({
                    range: this.dateRangeService.createCurrentRange(mode),
                    useCache: true,
                });
            })
        );
    });

    readonly setMode$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(TurniActions.setMode),
            withLatestFrom(
                this.store.select(selectRange)
            ),
            map(([{ mode }, range]) => {
                return TurniActions.openRange({
                    range: this.dateRangeService.createRangeFromMode(
                        mode,
                        range ?? undefined
                    ),
                    useCache: true,
                });
            })
        );
    });

    readonly previous$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(TurniActions.previousRange),
            withLatestFrom(
                this.store.select(selectRange)
            ),
            map(([, range]) => {
                if (!range) {
                    return TurniActions.init();
                }

                return TurniActions.openRange({
                    range: this.dateRangeService.createPreviousRange(range),
                    useCache: true,
                });
            })
        );
    });

    readonly next$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(TurniActions.nextRange),
            withLatestFrom(
                this.store.select(selectRange)
            ),
            map(([, range]) => {
                if (!range) {
                    return TurniActions.init();
                }

                return TurniActions.openRange({
                    range: this.dateRangeService.createNextRange(range),
                    useCache: true,
                });
            })
        );
    });

    readonly refresh$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(TurniActions.refreshRange),
            withLatestFrom(
                this.store.select(selectRange)
            ),
            map(([, range]) => {
                if (!range) {
                    return TurniActions.init();
                }

                return TurniActions.openRange({
                    range,
                    useCache: false,
                });
            })
        );
    });

    readonly refreshStrong$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(TurniActions.refreshRangeStrong),
            withLatestFrom(
                this.store.select(selectRange)
            ),
            map(([, range]) => {
                if (!range) {
                    return TurniActions.init();
                }

                this.cacheService.delete(range);

                return TurniActions.openRange({
                    range,
                    useCache: false,
                });
            })
        );
    });

    readonly clearCache$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(TurniActions.clearCurrentPeriodCache),
            withLatestFrom(
                this.store.select(selectRange)
            ),
            map(([, range]) => {
                if (!range) {
                    return TurniActions.init();
                }

                this.cacheService.delete(range);

                return TurniActions.openRange({
                    range,
                    useCache: false,
                });
            })
        );
    });

    readonly markWorkerSickOnShift$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(TurniActions.markWorkerSickOnShift),
            withLatestFrom(
                this.store.select(selectPlan),
                this.store.select(selectWorkers),
                this.store.select(selectShifts),
                this.store.select(selectAbsences)
            ),
            switchMap(([action, currentPlan, workers, shifts, absences]) => {
                try {
                    if (!currentPlan) {
                        return of(
                            TurniActions.markWorkerSickOnShiftFailure({
                                error: 'Piano turni non presente.',
                            })
                        );
                    }

                    const result = this.replacementService.markWorkerSickAndReplace({
                        plan: currentPlan,
                        workers,
                        shifts,
                        absences,
                        date: action.date,
                        shift: action.shift,
                        workerId: action.workerId,
                        note: action.note,
                    });

                    this.cacheService.set(result.plan);

                    return of(
                        TurniActions.markWorkerSickOnShiftSuccess({
                            plan: result.plan,
                            absences: result.absences,
                        })
                    );
                } catch (error) {
                    return of(
                        TurniActions.markWorkerSickOnShiftFailure({
                            error: error instanceof Error
                                ? error.message
                                : 'Errore sostituzione operatore in malattia',
                        })
                    );
                }
            })
        );
    });

    readonly openRange$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(TurniActions.openRange),
            withLatestFrom(
                this.store.select(selectGenerationSeed),
                this.store.select(selectWorkers),
                this.store.select(selectShifts),
                this.store.select(selectAbsences)
            ),
            switchMap(([{ range, useCache }, generationSeed, workers, shifts, absences]) => {
                try {
                    if (workers.length === 0 || shifts.length === 0) {
                        return of(TurniActions.loadInitialData());
                    }

                    if (useCache) {
                        const cachedPlan = this.cacheService.get(range);

                        if (cachedPlan) {
                            return of(
                                TurniActions.generatePlanSuccess({
                                    plan: cachedPlan,
                                })
                            );
                        }
                    }

                    const plan = this.generatorService.generatePlan(
                        range,
                        [...workers],
                        [...shifts],
                        useCache ? generationSeed : generationSeed + 1,
                        useCache ? 'GENERATED' : 'REGENERATED',
                        [...absences]
                    );

                    this.cacheService.set(plan);

                    return of(
                        TurniActions.generatePlanSuccess({
                            plan,
                        })
                    );
                } catch (error) {
                    return of(
                        TurniActions.generatePlanFailure({
                            error: error instanceof Error
                                ? error.message
                                : 'Errore generazione piano turni',
                        })
                    );
                }
            }),
            catchError((error) => {
                return of(
                    TurniActions.generatePlanFailure({
                        error: error instanceof Error
                            ? error.message
                            : 'Errore inatteso NgRx Turni',
                    })
                );
            })
        );
    });
}
