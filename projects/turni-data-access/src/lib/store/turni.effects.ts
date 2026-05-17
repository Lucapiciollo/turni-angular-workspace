import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, from, map, of, switchMap, takeUntil, withLatestFrom } from 'rxjs';

import { TURNI_FULL_MOCK } from '../data/turni-full-mock';
import { DateRangeService } from '../services/date-range.service';
import { LongShiftService } from '../services/long-shift.service';
import { ScheduleCacheService } from '../services/schedule-cache.service';
import { ShiftReplacementService } from '../services/shift-replacement.service';
import { TurniGeneratorService } from '../services/turni-generator.service';
import { TurniStorageService } from '../services/turni-storage.service';
import { TurniActions } from './turni.actions';
import { Worker, WorkerEditorDraft } from '../models/turni.models';
import { selectAbsences, selectGenerationSeed, selectIsPastRange, selectMode, selectPlan, selectRange, selectShifts, selectWorkers } from './turni.selectors';

@Injectable()
export class TurniEffects {
    private readonly actions$: Actions = inject(Actions);
    private readonly store: Store = inject(Store);
    private readonly dateRangeService: DateRangeService = inject(DateRangeService);
    private readonly cacheService: ScheduleCacheService = inject(ScheduleCacheService);
    private readonly generatorService: TurniGeneratorService = inject(TurniGeneratorService);
    private readonly replacementService: ShiftReplacementService = inject(ShiftReplacementService);
    private readonly longShiftService: LongShiftService = inject(LongShiftService);
    private readonly storageService: TurniStorageService = inject(TurniStorageService);

    readonly loadInitialData$ = createEffect(() => this.actions$.pipe(
        ofType(TurniActions.loadInitialData),
        withLatestFrom(this.store.select(selectWorkers), this.store.select(selectShifts), this.store.select(selectAbsences)),
        switchMap(([, currentWorkers, currentShifts, currentAbsences]) => {
            const hasStoreData = currentWorkers.length > 0 && currentShifts.length > 0;

            if (hasStoreData) {
                return of(TurniActions.loadInitialDataSuccess({
                    workers: currentWorkers,
                    shifts: currentShifts,
                    absences: currentAbsences,
                }));
            }

            const storedData = this.storageService.load();

            if (storedData?.workers?.length && storedData?.shifts?.length) {
                return of(TurniActions.loadInitialDataSuccess({
                    workers: storedData.workers,
                    shifts: storedData.shifts,
                    absences: storedData.absences ?? [],
                }));
            }

            const initialData = {
                workers: [...TURNI_FULL_MOCK.workers],
                shifts: [...TURNI_FULL_MOCK.shifts],
                absences: [...TURNI_FULL_MOCK.absences],
            };

            this.storageService.save(initialData);

            return of(TurniActions.loadInitialDataSuccess(initialData));
        })
    ));

    readonly init$ = createEffect(() => this.actions$.pipe(ofType(TurniActions.init), map(() => TurniActions.loadInitialData())));

    readonly openCurrentRangeAfterLoad$ = createEffect(() => this.actions$.pipe(
        ofType(TurniActions.loadInitialDataSuccess),
        withLatestFrom(this.store.select(selectMode)),
        map(([, mode]) => TurniActions.openRange({ range: this.dateRangeService.createCurrentRange(mode), useCache: true }))
    ));

    readonly setMode$ = createEffect(() => this.actions$.pipe(
        ofType(TurniActions.setMode),
        withLatestFrom(this.store.select(selectRange)),
        map(([{ mode }, range]) => TurniActions.openRange({ range: this.dateRangeService.createRangeFromMode(mode, range ?? undefined), useCache: true }))
    ));

    readonly previous$ = createEffect(() => this.actions$.pipe(
        ofType(TurniActions.previousRange),
        withLatestFrom(this.store.select(selectRange)),
        map(([, range]) => !range ? TurniActions.init() : TurniActions.openRange({ range: this.dateRangeService.createPreviousRange(range), useCache: true }))
    ));

    readonly next$ = createEffect(() => this.actions$.pipe(
        ofType(TurniActions.nextRange),
        withLatestFrom(this.store.select(selectRange)),
        map(([, range]) => !range ? TurniActions.init() : TurniActions.openRange({ range: this.dateRangeService.createNextRange(range), useCache: true }))
    ));

    readonly refresh$ = createEffect(() => this.actions$.pipe(
        ofType(TurniActions.refreshRange),
        withLatestFrom(this.store.select(selectRange), this.store.select(selectIsPastRange)),
        map(([, range, isPastRange]) => {
            if (!range) return TurniActions.init();
            if (isPastRange) return TurniActions.generatePlanSuccess({ plan: this.createEmptyPlan(range) });
            return TurniActions.generatePlanProgressive({ range, source: 'REGENERATED' });
        })
    ));

    readonly refreshStrong$ = createEffect(() => this.actions$.pipe(
        ofType(TurniActions.refreshRangeStrong),
        withLatestFrom(this.store.select(selectRange), this.store.select(selectIsPastRange)),
        map(([, range, isPastRange]) => {
            if (!range) return TurniActions.init();
            if (isPastRange) return TurniActions.generatePlanSuccess({ plan: this.createEmptyPlan(range) });
            this.cacheService.delete(range);
            return TurniActions.generatePlanProgressive({ range, source: 'REGENERATED' });
        })
    ));

    readonly clearCache$ = createEffect(() => this.actions$.pipe(
        ofType(TurniActions.clearCurrentPeriodCache),
        withLatestFrom(this.store.select(selectRange)),
        map(([, range]) => {
            if (!range) return TurniActions.init();
            this.cacheService.delete(range);
            return TurniActions.openRange({ range, useCache: false });
        })
    ));

    readonly markWorkerSickOnShift$ = createEffect(() => this.actions$.pipe(
        ofType(TurniActions.markWorkerSickOnShift),
        withLatestFrom(this.store.select(selectPlan), this.store.select(selectWorkers), this.store.select(selectShifts), this.store.select(selectAbsences)),
        switchMap(([action, currentPlan, workers, shifts, absences]) => {
            try {
                if (!currentPlan) return of(TurniActions.markWorkerSickOnShiftFailure({ error: 'Piano turni non presente.' }));
                const result = this.replacementService.markWorkerSickAndReplace({ plan: currentPlan, workers, shifts, absences, date: action.date, shift: action.shift, workerId: action.workerId, note: action.note });
                this.cacheService.set(result.plan);
                return of(TurniActions.markWorkerSickOnShiftSuccess({ plan: result.plan, absences: result.absences }));
            } catch (error) {
                return of(TurniActions.markWorkerSickOnShiftFailure({ error: error instanceof Error ? error.message : 'Errore sostituzione operatore in malattia' }));
            }
        })
    ));

    readonly applyLongShift$ = createEffect(() => this.actions$.pipe(
        ofType(TurniActions.applyLongShift),
        withLatestFrom(this.store.select(selectPlan), this.store.select(selectWorkers)),
        switchMap(([action, currentPlan, workers]) => {
            try {
                if (!currentPlan) return of(TurniActions.applyLongShiftFailure({ error: 'Piano turni non presente.' }));
                const plan = this.longShiftService.applyLongShift({ plan: currentPlan, workers, date: action.date, shift: action.shift, leavingWorkerId: action.leavingWorkerId, longWorkerId: action.longWorkerId, leaveTime: action.leaveTime, reason: action.reason, note: action.note });
                this.cacheService.set(plan);
                return of(TurniActions.applyLongShiftSuccess({ plan }));
            } catch (error) {
                return of(TurniActions.applyLongShiftFailure({ error: error instanceof Error ? error.message : 'Errore assegnazione lunga' }));
            }
        })
    ));


    readonly upsertWorker$ = createEffect(() => this.actions$.pipe(
        ofType(TurniActions.upsertWorker),
        withLatestFrom(
            this.store.select(selectWorkers),
            this.store.select(selectShifts),
            this.store.select(selectAbsences)
        ),
        switchMap(([{ worker }, workers, shifts, absences]) => {
            try {
                const normalizedWorker = this.toWorker(worker);
                const exists = workers.some((item) => item.id === normalizedWorker.id);
                const nextWorkers = exists
                    ? workers.map((item) => item.id === normalizedWorker.id ? normalizedWorker : item)
                    : [...workers, normalizedWorker];

                this.storageService.save({
                    workers: nextWorkers,
                    shifts,
                    absences,
                });

                return of(TurniActions.upsertWorkerSuccess({
                    workers: nextWorkers,
                }));
            } catch (error) {
                return of(TurniActions.upsertWorkerFailure({
                    error: error instanceof Error ? error.message : 'Errore salvataggio operatore',
                }));
            }
        })
    ));

    readonly deleteWorker$ = createEffect(() => this.actions$.pipe(
        ofType(TurniActions.deleteWorker),
        withLatestFrom(
            this.store.select(selectWorkers),
            this.store.select(selectShifts),
            this.store.select(selectAbsences)
        ),
        switchMap(([{ workerId }, workers, shifts, absences]) => {
            try {
                const nextWorkers = workers.filter((worker) => worker.id !== workerId);
                const nextAbsences = absences.filter((absence) => absence.workerId !== workerId);

                this.storageService.save({
                    workers: nextWorkers,
                    shifts,
                    absences: nextAbsences,
                });

                return of(TurniActions.deleteWorkerSuccess({
                    workers: nextWorkers,
                }));
            } catch (error) {
                return of(TurniActions.deleteWorkerFailure({
                    error: error instanceof Error ? error.message : 'Errore eliminazione operatore',
                }));
            }
        })
    ));

    readonly resetWorkersStorage$ = createEffect(() => this.actions$.pipe(
        ofType(TurniActions.resetWorkersStorage),
        map(() => {
            const initialData = {
                workers: [...TURNI_FULL_MOCK.workers],
                shifts: [...TURNI_FULL_MOCK.shifts],
                absences: [...TURNI_FULL_MOCK.absences],
            };

            this.storageService.save(initialData);

            return TurniActions.resetWorkersStorageSuccess(initialData);
        })
    ));


    readonly saveShiftRules$ = createEffect(() => this.actions$.pipe(
        ofType(TurniActions.saveShiftRules),
        withLatestFrom(
            this.store.select(selectWorkers),
            this.store.select(selectAbsences)
        ),
        switchMap(([{ shifts }, workers, absences]) => {
            try {
                const normalizedShifts = shifts.map((shift) => {
                    return {
                        ...shift,
                        requiredWorkers: Number(shift.requiredWorkers),
                        hours: Number(shift.hours),
                    };
                });

                this.storageService.save({
                    workers,
                    shifts: normalizedShifts,
                    absences,
                });

                return of(TurniActions.saveShiftRulesSuccess({
                    shifts: normalizedShifts,
                }));
            } catch (error) {
                return of(TurniActions.saveShiftRulesFailure({
                    error: error instanceof Error ? error.message : 'Errore salvataggio regole turni',
                }));
            }
        })
    ));


    readonly generatePlanProgressive$ = createEffect(() => this.actions$.pipe(
        ofType(TurniActions.generatePlanProgressive),
        withLatestFrom(
            this.store.select(selectGenerationSeed),
            this.store.select(selectWorkers),
            this.store.select(selectShifts),
            this.store.select(selectAbsences)
        ),
        switchMap(([{ range, source }, generationSeed, workers, shifts, absences]) => {
            return from(this.generatorService.generatePlanSteps({
                range,
                workers: [...workers],
                shifts: [...shifts],
                generationSeed: generationSeed + 1,
                source,
                absences: [...absences],
            })).pipe(
                map((step) => {
                    if (step.type === 'COMPLETED' && step.plan) {
                        this.cacheService.set(step.plan);

                        return TurniActions.generatePlanSuccess({
                            plan: step.plan,
                        });
                    }

                    if (step.type === 'CANCELLED') {
                        return TurniActions.cancelPlanGenerationSuccess();
                    }

                    return TurniActions.generatePlanProgress({
                        progress: step.progress,
                        currentDate: step.currentDate,
                        days: step.days ?? [],
                    });
                }),
                takeUntil(
                    this.actions$.pipe(
                        ofType(TurniActions.cancelPlanGeneration)
                    )
                ),
                catchError((error) => {
                    return of(TurniActions.generatePlanFailure({
                        error: error instanceof Error
                            ? error.message
                            : 'Errore generazione progressiva piano turni',
                    }));
                })
            );
        })
    ));

    readonly cancelPlanGeneration$ = createEffect(() => this.actions$.pipe(
        ofType(TurniActions.cancelPlanGeneration),
        map(() => TurniActions.cancelPlanGenerationSuccess())
    ));

    readonly openRange$ = createEffect(() => this.actions$.pipe(
        ofType(TurniActions.openRange),
        withLatestFrom(this.store.select(selectGenerationSeed), this.store.select(selectIsPastRange), this.store.select(selectWorkers), this.store.select(selectShifts), this.store.select(selectAbsences)),
        switchMap(([{ range, useCache }, generationSeed, isPastRange, workers, shifts, absences]) => {
            try {
                if (workers.length === 0 || shifts.length === 0) return of(TurniActions.loadInitialData());
                if (useCache) {
                    const cachedPlan = this.cacheService.get(range);
                    if (cachedPlan) return of(TurniActions.generatePlanSuccess({ plan: cachedPlan }));
                }
                if (isPastRange) return of(TurniActions.generatePlanSuccess({ plan: this.createEmptyPlan(range) }));
                const plan = this.generatorService.generatePlan(range, [...workers], [...shifts], useCache ? generationSeed : generationSeed + 1, useCache ? 'GENERATED' : 'REGENERATED', [...absences]);
                this.cacheService.set(plan);
                return of(TurniActions.generatePlanSuccess({ plan }));
            } catch (error) {
                return of(TurniActions.generatePlanFailure({ error: error instanceof Error ? error.message : 'Errore generazione piano turni' }));
            }
        }),
        catchError((error) => of(TurniActions.generatePlanFailure({ error: error instanceof Error ? error.message : 'Errore inatteso NgRx Turni' })))
    ));


    private toWorker(draft: WorkerEditorDraft): Worker {
        const fullName = (draft.fullName || `${draft.firstName} ${draft.lastName}`).trim();
        const id = draft.id?.trim() || `worker-${Date.now()}`;

        return {
            id,
            firstName: draft.firstName.trim(),
            lastName: draft.lastName.trim(),
            fullName,
            name: fullName,
            color: draft.color || '#64748b',
            role: draft.role || 'OSS',
            enabled: draft.enabled,
            contract: {
                ...draft.contract,
            },
            rules: {
                ...draft.rules,
            },
        };
    }

    private createEmptyPlan(range: ReturnType<DateRangeService['createCurrentRange']>) {
        return {
            range,
            days: this.dateRangeService.getDatesBetween(range.startDate, range.endDate).map((date) => ({
                date,
                label: this.dateRangeService.getDayLabel(date),
                isWeekend: this.dateRangeService.isWeekend(date),
                assignments: [],
                warnings: [],
                indicators: {
                    status: 'OK' as const,
                    totalWarnings: 0,
                    errorWarnings: 0,
                    uncoveredShifts: 0,
                    forcedAssignments: 0,
                    absentWorkers: 0,
                    sickWorkers: 0,
                    figurativeAssignments: 0,
                },
            })),
            warnings: [],
            stats: [],
            source: 'CACHE' as const,
            generatedAt: this.dateRangeService.nowIso(),
        };
    }
}
