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

    on(TurniActions.setShifts, (state, { shifts }) => {
        return {
            ...state,
            shifts,
        };
    }),

    on(TurniActions.setAbsences, (state, { absences }) => {
        return {
            ...state,
            absences,
        };
    }),

    on(TurniActions.generatePlanSuccess, (state, { plan }) => {
        return {
            ...state,
            mode: plan.range.mode,
            range: plan.range,
            plan,
            lastSource: plan.source,
            loading: false,
            error: null,
        };
    }),

    on(TurniActions.generatePlanFailure, (state, { error }) => {
        return {
            ...state,
            loading: false,
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
    })
);
