import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
    catchError,
    map,
    of,
    switchMap,
    withLatestFrom,
} from 'rxjs';
import { Store } from '@ngrx/store';

import { SHIFTS, WORKERS } from '../data/mock-turni.data';
import { DateRangeService } from '../services/date-range.service';
import { ScheduleCacheService } from '../services/schedule-cache.service';
import { TurniGeneratorService } from '../services/turni-generator.service';
import { TurniActions } from './turni.actions';
import {
    selectGenerationSeed,
    selectMode,
    selectRange,
} from './turni.selectors';

@Injectable()
export class TurniEffects {
    private actions$: Actions = inject(Actions);
    private store: Store = inject(Store);
    private dateRangeService: DateRangeService = inject(DateRangeService);
    private cacheService: ScheduleCacheService = inject(ScheduleCacheService);
    private generatorService: TurniGeneratorService = inject(TurniGeneratorService);

    init$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(TurniActions.init),
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

    setMode$ = createEffect(() => {
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

    previous$ = createEffect(() => {
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

    next$ = createEffect(() => {
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

    refresh$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(TurniActions.refreshRange),
            withLatestFrom(
                this.store.select(selectRange),
                this.store.select(selectGenerationSeed)
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

    refreshStrong$ = createEffect(() => {
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

    clearCache$ = createEffect(() => {
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

    openRange$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(TurniActions.openRange),
            withLatestFrom(
                this.store.select(selectGenerationSeed)
            ),
            switchMap(([{ range, useCache }, generationSeed]) => {
                try {
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
                        [...WORKERS],
                        [...SHIFTS],
                        useCache ? generationSeed : generationSeed + 1,
                        useCache ? 'GENERATED' : 'REGENERATED'
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
