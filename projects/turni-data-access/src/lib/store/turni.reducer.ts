import { createReducer, on } from '@ngrx/store';

import { TurniActions } from './turni.actions';
import { initialTurniState } from './turni-store.models';

export const turniReducer = createReducer(
    initialTurniState,

    on(TurniActions.init, (state) => {
        return {
            ...state,
            loading: true,
            error: null,
        };
    }),

    on(TurniActions.openRange, (state) => {
        return {
            ...state,
            loading: true,
            error: null,
        };
    }),

    on(TurniActions.setMode, (state) => {
        return {
            ...state,
            loading: true,
            error: null,
        };
    }),

    on(TurniActions.previousRange, (state) => {
        return {
            ...state,
            loading: true,
            error: null,
        };
    }),

    on(TurniActions.nextRange, (state) => {
        return {
            ...state,
            loading: true,
            error: null,
        };
    }),

    on(TurniActions.refreshRange, (state) => {
        return {
            ...state,
            generationSeed: state.generationSeed + 1,
            loading: true,
            error: null,
        };
    }),

    on(TurniActions.refreshRangeStrong, (state) => {
        return {
            ...state,
            generationSeed: state.generationSeed + 17,
            loading: true,
            error: null,
        };
    }),

    on(TurniActions.generatePlanProgressive, (state) => {
        return {
            ...state,
            loading: true,
            generating: true,
            generationProgress: 0,
            generationCurrentDate: null,
            partialDays: [],
            error: null,
        };
    }),

    on(TurniActions.generatePlanProgress, (state, { progress, currentDate, days }) => {
        return {
            ...state,
            loading: true,
            generating: true,
            generationProgress: progress,
            generationCurrentDate: currentDate ?? null,
            partialDays: days,
        };
    }),

    on(TurniActions.cancelPlanGenerationSuccess, (state) => {
        return {
            ...state,
            loading: false,
            generating: false,
            generationProgress: 0,
            generationCurrentDate: null,
        };
    }),

    on(TurniActions.clearCurrentPeriodCache, (state) => {
        return {
            ...state,
            generationSeed: state.generationSeed + 1,
            loading: true,
            error: null,
        };
    }),


    on(TurniActions.loadInitialData, (state) => {
        return {
            ...state,
            loading: true,
            error: null,
        };
    }),

    on(TurniActions.loadInitialDataSuccess, (state, { workers, shifts, absences }) => {
        return {
            ...state,
            workers,
            shifts,
            absences,
            loading: false,
            error: null,
        };
    }),

    on(TurniActions.loadInitialDataFailure, (state, { error }) => {
        return {
            ...state,
            loading: false,
            error,
        };
    }),

    on(TurniActions.setWorkers, (state, { workers }) => {
        return {
            ...state,
            workers,
        };
    }),

    on(TurniActions.upsertWorker, (state) => {
        return {
            ...state,
            loading: true,
            error: null,
        };
    }),

    on(TurniActions.upsertWorkerSuccess, (state, { workers }) => {
        return {
            ...state,
            workers,
            generationSeed: state.generationSeed + 1,
            loading: false,
            error: null,
        };
    }),

    on(TurniActions.upsertWorkerFailure, (state, { error }) => {
        return {
            ...state,
            loading: false,
            error,
        };
    }),

    on(TurniActions.deleteWorker, (state) => {
        return {
            ...state,
            loading: true,
            error: null,
        };
    }),

    on(TurniActions.deleteWorkerSuccess, (state, { workers }) => {
        return {
            ...state,
            workers,
            selectedWorkerId: state.selectedWorkerId && workers.some((worker) => worker.id === state.selectedWorkerId)
                ? state.selectedWorkerId
                : null,
            generationSeed: state.generationSeed + 1,
            loading: false,
            error: null,
        };
    }),

    on(TurniActions.deleteWorkerFailure, (state, { error }) => {
        return {
            ...state,
            loading: false,
            error,
        };
    }),

    on(TurniActions.resetWorkersStorageSuccess, (state, { workers, shifts, absences }) => {
        return {
            ...state,
            workers,
            shifts,
            absences,
            selectedWorkerId: null,
            generationSeed: state.generationSeed + 1,
            loading: false,
            error: null,
        };
    }),

    on(TurniActions.setShifts, (state, { shifts }) => {
        return {
            ...state,
            shifts,
        };
    }),

    on(TurniActions.saveShiftRules, (state) => {
        return {
            ...state,
            loading: true,
            error: null,
        };
    }),

    on(TurniActions.saveShiftRulesSuccess, (state, { shifts }) => {
        return {
            ...state,
            shifts,
            generationSeed: state.generationSeed + 1,
            loading: false,
            error: null,
        };
    }),

    on(TurniActions.saveShiftRulesFailure, (state, { error }) => {
        return {
            ...state,
            loading: false,
            error,
        };
    }),

    on(TurniActions.setAbsences, (state, { absences }) => {
        return {
            ...state,
            absences,
        };
    }),


    on(TurniActions.markWorkerSickOnShift, (state) => {
        return {
            ...state,
            loading: true,
            error: null,
        };
    }),

    on(TurniActions.markWorkerSickOnShiftSuccess, (state, { pending }) => {
        return {
            ...state,
            pendingSickReplacement: pending,
            loading: false,
            error: null,
        };
    }),

    on(TurniActions.markWorkerSickOnShiftFailure, (state, { error }) => {
        return {
            ...state,
            loading: false,
            error,
        };
    }),

    on(TurniActions.confirmSickReplacement, (state) => {
        if (!state.pendingSickReplacement) {
            return state;
        }

        return {
            ...state,
            plan: state.pendingSickReplacement.proposedPlan,
            absences: state.pendingSickReplacement.proposedAbsences,
            pendingSickReplacement: null,
            lastSource: 'REGENERATED' as const,
            loading: false,
            error: null,
        };
    }),

    on(TurniActions.clearSickReplacementProposal, (state) => {
        return {
            ...state,
            pendingSickReplacement: null,
            loading: false,
            error: null,
        };
    }),


    on(TurniActions.applyLongShift, (state) => {
        return { ...state, loading: true, error: null };
    }),

    on(TurniActions.applyLongShiftSuccess, (state, { plan }) => {
        return { ...state, plan, lastSource: plan.source, loading: false, error: null };
    }),

    on(TurniActions.applyLongShiftFailure, (state, { error }) => {
        return { ...state, loading: false, error };
    }),

    on(TurniActions.addManualAssignment, (state) => {
        return {
            ...state,
            loading: true,
            error: null,
        };
    }),

    on(TurniActions.addManualAssignmentSuccess, (state, { plan }) => {
        return {
            ...state,
            plan,
            lastSource: plan.source,
            loading: false,
            error: null,
        };
    }),

    on(TurniActions.addManualAssignmentFailure, (state, { error }) => {
        return {
            ...state,
            loading: false,
            error,
        };
    }),

    on(TurniActions.changeShift, (state) => {
        return {
            ...state,
            loading: true,
            error: null,
        };
    }),

    on(TurniActions.changeShiftSuccess, (state, { plan }) => {
        return {
            ...state,
            plan,
            lastSource: plan.source,
            loading: false,
            error: null,
        };
    }),

    on(TurniActions.changeShiftFailure, (state, { error }) => {
        return {
            ...state,
            loading: false,
            error,
        };
    }),

    on(TurniActions.generatePlanSuccess, (state, { plan }) => {
        return {
            ...state,
            mode: plan.range.mode,
            range: plan.range,
            plan,
            partialDays: [],
            generationProgress: 100,
            generationCurrentDate: null,
            generating: false,
            lastSource: plan.source,
            generationLogs: plan.generationLogs ?? [],
            generationSettings: plan.generationSettings ?? state.generationSettings,
            loading: false,
            error: null,
        };
    }),

    on(TurniActions.generatePlanFailure, (state, { error }) => {
        return {
            ...state,
            loading: false,
            generating: false,
            error,
        };
    }),

    on(TurniActions.selectWorker, (state, { workerId }) => {
        return {
            ...state,
            selectedWorkerId: workerId,
        };
    }),

    on(TurniActions.setStatsFilter, (state, { filter }) => {
        return {
            ...state,
            selectedStatsFilter: filter,
        };
    }),

    on(TurniActions.setWarningFilter, (state, { filter }) => {
        return {
            ...state,
            selectedWarningFilter: filter,
        };
    }),

    on(TurniActions.resetStatsFilters, (state) => {
        return {
            ...state,
            selectedWorkerId: null,
            selectedStatsFilter: 'ALL' as const,
        };
    }),

    on(TurniActions.resetWarningFilters, (state) => {
        return {
            ...state,
            selectedWorkerId: null,
            selectedWarningFilter: 'ALL' as const,
        };
    }),

    on(TurniActions.setGenerationSettings, (state, { settings }) => {
        return {
            ...state,
            generationSettings: {
                ...state.generationSettings,
                ...settings,
            },
        };
    }),

);
