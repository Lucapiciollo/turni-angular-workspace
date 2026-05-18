import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';

import {
    AssignedShift,
    DaySchedule,
    GenerationSettings,
    RangeMode,
    ShiftChangeParams,
    ShiftDefinition,
    ShiftType,
    StatsFilterType,
    WarningFilterType,
    Worker,
    WorkerEditorDraft,
} from '../models/turni.models';
import { SchedulePdfExportService } from '../services/schedule-pdf-export.service';
import { TurniActions } from './turni.actions';
import {
    selectAbsences,
    selectCurrentRangeCacheKey,
    selectError,
    selectFilteredStats,
    selectFilteredWarnings,
    selectGeneratedAtLabel,
    selectGenerationCurrentDate,
    selectGenerationLogCount,
    selectGenerationLogs,
    selectGenerationProgress,
    selectGenerationSeed,
    selectGenerationSettings,
    selectGenerating,
    selectIsPastRange,
    selectLastSource,
    selectLoading,
    selectMode,
    selectPendingSickReplacement,
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
    selectShifts,
    selectSortedWorkers,
    selectStats,
    selectStatsFilterCounts,
    selectVisibleDays,
    selectWarningCount,
    selectWarningFilterCounts,
    selectWarnings,
    selectWorkers,
} from './turni.selectors';

@Injectable({
    providedIn: 'root',
})
export class TurniFacade {
    private readonly store: Store = inject(Store);
    private readonly pdfExportService: SchedulePdfExportService = inject(SchedulePdfExportService);

    readonly mode = this.store.selectSignal(selectMode);
    readonly range = this.store.selectSignal(selectRange);
    readonly plan = this.store.selectSignal(selectPlan);
    readonly days = this.store.selectSignal(selectVisibleDays);
    readonly warnings = this.store.selectSignal(selectWarnings);
    readonly stats = this.store.selectSignal(selectStats);
    readonly filteredStats = this.store.selectSignal(selectFilteredStats);
    readonly filteredWarnings = this.store.selectSignal(selectFilteredWarnings);
    readonly periodStats = this.store.selectSignal(selectPeriodStats);
    readonly periodWarnings = this.store.selectSignal(selectPeriodWarnings);
    readonly warningCount = this.store.selectSignal(selectWarningCount);
    readonly periodWarningCount = this.store.selectSignal(selectPeriodWarningCount);

    readonly generationSeed = this.store.selectSignal(selectGenerationSeed);
    readonly generationSettings = this.store.selectSignal(selectGenerationSettings);
    readonly generationLogs = this.store.selectSignal(selectGenerationLogs);
    readonly generationLogCount = this.store.selectSignal(selectGenerationLogCount);
    readonly generating = this.store.selectSignal(selectGenerating);
    readonly generationProgressValue = this.store.selectSignal(selectGenerationProgress);
    readonly generationCurrentDate = this.store.selectSignal(selectGenerationCurrentDate);

    readonly isPastRange = this.store.selectSignal(selectIsPastRange);
    readonly lastSource = this.store.selectSignal(selectLastSource);
    readonly generatedAtLabel = this.store.selectSignal(selectGeneratedAtLabel);
    readonly currentRangeCacheKey = this.store.selectSignal(selectCurrentRangeCacheKey);
    readonly selectedWorkerId = this.store.selectSignal(selectSelectedWorkerId);
    readonly selectedWorker = this.store.selectSignal(selectSelectedWorker);
    readonly selectedWorkerStats = this.store.selectSignal(selectSelectedWorkerStats);
    readonly selectedStatsFilter = this.store.selectSignal(selectSelectedStatsFilter);
    readonly selectedWarningFilter = this.store.selectSignal(selectSelectedWarningFilter);
    readonly statsFilterCounts = this.store.selectSignal(selectStatsFilterCounts);
    readonly warningFilterCounts = this.store.selectSignal(selectWarningFilterCounts);
    readonly loading = this.store.selectSignal(selectLoading);
    readonly error = this.store.selectSignal(selectError);

    readonly workers = this.store.selectSignal(selectWorkers);
    readonly sortedWorkers = this.store.selectSignal(selectSortedWorkers);
    readonly shifts = this.store.selectSignal(selectShifts);
    readonly absences = this.store.selectSignal(selectAbsences);
    readonly pendingSickReplacement = this.store.selectSignal(selectPendingSickReplacement);

    readonly selectedWorkerName = () => {
        return this.selectedWorkerStats()?.workerName ?? null;
    };

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

    ensureInitialized(): void {
        const hasData = this.workers().length > 0
            && this.shifts().length > 0
            && !!this.plan();

        if (hasData) {
            return;
        }

        this.init();
    }

    setMode(mode: RangeMode): void {
        this.store.dispatch(TurniActions.setMode({ mode }));
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

    cancelGeneration(): void {
        this.store.dispatch(TurniActions.cancelPlanGeneration());
    }

    refreshStrong(): void {
        this.store.dispatch(TurniActions.refreshRangeStrong());
    }

    exportCurrentPlanPdf(): void {
        const plan = this.plan();

        if (!plan) {
            return;
        }

        this.pdfExportService.exportPlan({
            plan,
            workers: this.workers(),
        });
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

    confirmSickReplacement(): void {
        this.store.dispatch(TurniActions.confirmSickReplacement());
    }

    refreshSickReplacement(): void {
        this.store.dispatch(TurniActions.refreshSickReplacement());
    }

    clearSickReplacementProposal(): void {
        this.store.dispatch(TurniActions.clearSickReplacementProposal());
    }

    applyLongShift(params: {
        date: string;
        shift: ShiftType;
        leavingWorkerId: string;
        longWorkerId: string;
        leaveTime: string;
        reason: 'PERMESSO' | 'USCITA_ANTICIPATA';
        note?: string;
    }): void {
        this.store.dispatch(TurniActions.applyLongShift(params));
    }

    addManualAssignment(params: {
        date: string;
        shift: ShiftType;
        workerId: string;
        note?: string;
    }): void {
        this.store.dispatch(TurniActions.addManualAssignment(params));
    }

    changeShift(params: ShiftChangeParams): void {
        this.store.dispatch(TurniActions.changeShift(params));
    }

    selectWorker(workerId: string | null): void {
        this.store.dispatch(TurniActions.selectWorker({ workerId }));
    }

    setStatsFilter(filter: StatsFilterType): void {
        this.store.dispatch(TurniActions.setStatsFilter({ filter }));
    }

    setWarningFilter(filter: WarningFilterType): void {
        this.store.dispatch(TurniActions.setWarningFilter({ filter }));
    }

    resetStatsFilters(): void {
        this.store.dispatch(TurniActions.resetStatsFilters());
    }

    resetWarningFilters(): void {
        this.store.dispatch(TurniActions.resetWarningFilters());
    }

    setGenerationSettings(settings: Partial<GenerationSettings>): void {
        this.store.dispatch(TurniActions.setGenerationSettings({ settings }));
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

    getLongShiftCandidates(
        day: DaySchedule,
        assignment: AssignedShift
    ): AssignedShift[] {
        return day.assignments.filter((item) => {
            return item.shift === assignment.shift
                && item.workerId !== assignment.workerId
                && item.isFigurative !== true;
        });
    }

    getWorker(workerId: string): Worker | undefined {
        return this.workers().find((worker) => {
            return worker.id === workerId;
        });
    }

    upsertWorker(worker: WorkerEditorDraft): void {
        this.store.dispatch(TurniActions.upsertWorker({ worker }));
    }

    deleteWorker(workerId: string): void {
        this.store.dispatch(TurniActions.deleteWorker({ workerId }));
    }

    resetWorkersStorage(): void {
        this.store.dispatch(TurniActions.resetWorkersStorage());
    }

    saveShiftRules(shifts: ShiftDefinition[]): void {
        this.store.dispatch(TurniActions.saveShiftRules({
            shifts,
        }));
    }
}
