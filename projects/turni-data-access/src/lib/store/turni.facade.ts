import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';

import {
    AssignedShift,
    DaySchedule,
    RangeMode,
    ShiftType,
    StatsFilterType,
    WarningFilterType,
    Worker,
} from '../models/turni.models';
import { TurniActions } from './turni.actions';
import {
    selectCurrentRangeCacheKey,
    selectDays,
    selectError,
    selectFilteredStats,
    selectFilteredWarnings,
    selectGeneratedAtLabel,
    selectGenerationSeed,
    selectLastSource,
    selectAbsences,
    selectLoading,
    selectMode,
    selectPeriodStats,
    selectPeriodWarningCount,
    selectPeriodWarnings,
    selectPlan,
    selectRange,
    selectSelectedStatsFilter,
    selectSelectedWarningFilter,
    selectSelectedWorker,
    selectSelectedWorkerId,
    selectSelectedWorkerStats,
    selectStats,
    selectStatsFilterCounts,
    selectWarningCount,
    selectWarningFilterCounts,
    selectWarnings,
    selectWorkers,
    selectShifts,
} from './turni.selectors';

@Injectable({
    providedIn: 'root',
})
export class TurniFacade {
    private store: Store = inject(Store);

    readonly mode = this.store.selectSignal(selectMode);
    readonly range = this.store.selectSignal(selectRange);
    readonly plan = this.store.selectSignal(selectPlan);
    readonly days = this.store.selectSignal(selectDays);
    readonly warnings = this.store.selectSignal(selectWarnings);
    readonly stats = this.store.selectSignal(selectStats);
    readonly filteredStats = this.store.selectSignal(selectFilteredStats);
    readonly filteredWarnings = this.store.selectSignal(selectFilteredWarnings);
    readonly periodStats = this.store.selectSignal(selectPeriodStats);
    readonly periodWarnings = this.store.selectSignal(selectPeriodWarnings);
    readonly warningCount = this.store.selectSignal(selectWarningCount);
    readonly periodWarningCount = this.store.selectSignal(selectPeriodWarningCount);
    readonly generationSeed = this.store.selectSignal(selectGenerationSeed);
    readonly lastSource = this.store.selectSignal(selectLastSource);
    readonly generatedAtLabel = this.store.selectSignal(selectGeneratedAtLabel);
    readonly currentRangeCacheKey = this.store.selectSignal(selectCurrentRangeCacheKey);
    readonly selectedWorkerId = this.store.selectSignal(selectSelectedWorkerId);
    readonly selectedWorker = this.store.selectSignal(selectSelectedWorker);
    readonly selectedWorkerStats = this.store.selectSignal(selectSelectedWorkerStats);

    readonly selectedWorkerName = () => {
        return this.selectedWorkerStats()?.workerName ?? null;
    };
    readonly selectedStatsFilter = this.store.selectSignal(selectSelectedStatsFilter);
    readonly selectedWarningFilter = this.store.selectSignal(selectSelectedWarningFilter);
    readonly statsFilterCounts = this.store.selectSignal(selectStatsFilterCounts);
    readonly warningFilterCounts = this.store.selectSignal(selectWarningFilterCounts);
    readonly loading = this.store.selectSignal(selectLoading);
    readonly error = this.store.selectSignal(selectError);

    readonly workers = this.store.selectSignal(selectWorkers);
    readonly shifts = this.store.selectSignal(selectShifts);
    readonly absences = this.store.selectSignal(selectAbsences);

    readonly getAssignmentsByShiftFn = (
        day: DaySchedule,
        shift: ShiftType
    ): AssignedShift[] => {
        return this.getAssignmentsByShift(day, shift);
    };

    readonly getFigurativeAbsencesByDayFn = (
        day: DaySchedule
    ): AssignedShift[] => {
        return this.getFigurativeAbsencesByDay(day);
    };

    readonly getWorkerFn = (
        workerId: string
    ): Worker | undefined => {
        return this.getWorker(workerId);
    };

    init(): void {
        this.store.dispatch(TurniActions.init());
    }

    setMode(mode: RangeMode): void {
        this.store.dispatch(
            TurniActions.setMode({
                mode,
            })
        );
    }

    previous(): void {
        this.store.dispatch(TurniActions.previousRange());
    }

    next(): void {
        this.store.dispatch(TurniActions.nextRange());
    }

    refresh(): void {
        this.store.dispatch(TurniActions.refreshRange());
    }

    refreshStrong(): void {
        this.store.dispatch(TurniActions.refreshRangeStrong());
    }

    clearCurrentPeriodCache(): void {
        this.store.dispatch(TurniActions.clearCurrentPeriodCache());
    }

    markWorkerSickOnShift(assignment: AssignedShift): void {
        this.store.dispatch(
            TurniActions.markWorkerSickOnShift({
                date: assignment.date,
                shift: assignment.shift,
                workerId: assignment.workerId,
            })
        );
    }

    selectWorker(workerId: string | null): void {
        this.store.dispatch(
            TurniActions.selectWorker({
                workerId,
            })
        );
    }

    setStatsFilter(filter: StatsFilterType): void {
        this.store.dispatch(
            TurniActions.setStatsFilter({
                filter,
            })
        );
    }

    setWarningFilter(filter: WarningFilterType): void {
        this.store.dispatch(
            TurniActions.setWarningFilter({
                filter,
            })
        );
    }

    resetStatsFilters(): void {
        this.store.dispatch(TurniActions.resetStatsFilters());
    }

    resetWarningFilters(): void {
        this.store.dispatch(TurniActions.resetWarningFilters());
    }

    getStatsFilterCount(filter: StatsFilterType): number {
        return this.statsFilterCounts()[filter] ?? 0;
    }

    getWarningFilterCount(filter: WarningFilterType): number {
        return this.warningFilterCounts()[filter] ?? 0;
    }

    getAssignmentsByShift(
        day: DaySchedule,
        shift: ShiftType
    ): AssignedShift[] {
        return day.assignments.filter((assignment) => {
            return assignment.shift === shift
                && assignment.isFigurative !== true;
        });
    }

    getFigurativeAbsencesByDay(day: DaySchedule): AssignedShift[] {
        return day.assignments.filter((assignment) => {
            return assignment.isFigurative === true;
        });
    }

    getWorker(workerId: string): Worker | undefined {
        return this.workers().find((worker) => {
            return worker.id === workerId;
        });
    }
}
