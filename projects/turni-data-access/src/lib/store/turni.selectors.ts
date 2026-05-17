import { createFeatureSelector, createSelector } from '@ngrx/store';

import {
    ScheduleWarning,
    StatsFilterType,
    WarningFilterType,
    Worker,
    WorkerStats,
} from '../models/turni.models';
import {
    TURNI_FEATURE_KEY,
    TurniState,
} from './turni-store.models';

export const selectTurniState =
    createFeatureSelector<TurniState>(TURNI_FEATURE_KEY);


export const selectWorkers = createSelector(
    selectTurniState,
    (state) => state.workers
);

export const selectShifts = createSelector(
    selectTurniState,
    (state) => state.shifts
);

export const selectAbsences = createSelector(
    selectTurniState,
    (state) => state.absences
);

export const selectActiveWorkers = createSelector(
    selectWorkers,
    (workers) => {
        return workers.filter((worker) => {
            return worker.enabled !== false;
        });
    }
);

export const selectWorkerEntities = createSelector(
    selectWorkers,
    (workers) => {
        return workers.reduce<Record<string, Worker>>((entities, worker) => {
            entities[worker.id] = worker;

            return entities;
        }, {});
    }
);

export const selectWorkerById = (workerId: string) => createSelector(
    selectWorkerEntities,
    (entities) => entities[workerId]
);

export const selectMode = createSelector(
    selectTurniState,
    (state) => state.mode
);

export const selectRange = createSelector(
    selectTurniState,
    (state) => state.range
);

export const selectPlan = createSelector(
    selectTurniState,
    (state) => state.plan
);

export const selectDays = createSelector(
    selectPlan,
    (plan) => plan?.days ?? []
);

export const selectWarnings = createSelector(
    selectPlan,
    (plan) => plan?.warnings ?? []
);

export const selectStats = createSelector(
    selectPlan,
    (plan) => plan?.stats ?? []
);

export const selectGenerationSeed = createSelector(
    selectTurniState,
    (state) => state.generationSeed
);

export const selectLastSource = createSelector(
    selectTurniState,
    (state) => state.lastSource
);

export const selectLoading = createSelector(
    selectTurniState,
    (state) => state.loading
);

export const selectError = createSelector(
    selectTurniState,
    (state) => state.error
);

export const selectSelectedWorkerId = createSelector(
    selectTurniState,
    (state) => state.selectedWorkerId
);

export const selectSelectedStatsFilter = createSelector(
    selectTurniState,
    (state) => state.selectedStatsFilter
);

export const selectSelectedWarningFilter = createSelector(
    selectTurniState,
    (state) => state.selectedWarningFilter
);

export const selectWarningCount = createSelector(
    selectWarnings,
    (warnings) => warnings.length
);

export const selectGeneratedAtLabel = createSelector(
    selectPlan,
    (plan) => {
        if (!plan?.generatedAt) {
            return '-';
        }

        return new Date(plan.generatedAt).toLocaleString('it-IT');
    }
);

export const selectCurrentRangeCacheKey = createSelector(
    selectRange,
    (range) => {
        if (!range) {
            return '-';
        }

        return `${range.mode}_${range.startDate}_${range.endDate}`;
    }
);

export const selectActivePeriodWorkerIds = createSelector(
    selectDays,
    (days) => {
        const workerIds = new Set<string>();

        days.forEach((day) => {
            day.assignments
                .filter((assignment) => {
                    return assignment.isFigurative !== true;
                })
                .forEach((assignment) => {
                    workerIds.add(assignment.workerId);
                });
        });

        return workerIds;
    }
);

export const selectPeriodStats = createSelector(
    selectStats,
    selectActivePeriodWorkerIds,
    (stats, workerIds) => {
        return stats.filter((stat) => {
            return workerIds.has(stat.workerId);
        });
    }
);

export const selectPeriodWarnings = createSelector(
    selectWarnings,
    selectRange,
    (warnings, range) => {
        if (!range) {
            return warnings;
        }

        return warnings.filter((warning) => {
            if (!warning.date) {
                return true;
            }

            return warning.date >= range.startDate
                && warning.date <= range.endDate;
        });
    }
);

export const selectPeriodWarningCount = createSelector(
    selectPeriodWarnings,
    (warnings) => warnings.length
);

export const selectSelectedWorker = createSelector(
    selectSelectedWorkerId,
    selectPlan,
    (workerId, plan) => {
        if (!workerId || !plan) {
            return null;
        }

        return plan.stats.find((stat) => {
            return stat.workerId === workerId;
        }) ?? null;
    }
);

export const selectSelectedWorkerStats = selectSelectedWorker;

export const selectFilteredStats = createSelector(
    selectStats,
    selectSelectedWorkerId,
    selectSelectedStatsFilter,
    (stats, workerId, filter) => {
        const base = workerId
            ? stats.filter((stat) => stat.workerId === workerId)
            : stats;

        return applyStatsFilter(base, filter);
    }
);

export const selectFilteredWarnings = createSelector(
    selectWarnings,
    selectSelectedWorkerId,
    selectSelectedWarningFilter,
    (warnings, workerId, filter) => {
        const base = workerId
            ? warnings.filter((warning) => warning.workerId === workerId)
            : warnings;

        return applyWarningFilter(base, filter);
    }
);

export const selectStatsFilterCounts = createSelector(
    selectStats,
    selectSelectedWorkerId,
    (stats, workerId) => {
        const base = workerId
            ? stats.filter((stat) => stat.workerId === workerId)
            : stats;

        return {
            ALL: applyStatsFilter(base, 'ALL').length,
            FORCED: applyStatsFilter(base, 'FORCED').length,
            EXTRA: applyStatsFilter(base, 'EXTRA').length,
            UNDER_HOURS: applyStatsFilter(base, 'UNDER_HOURS').length,
            NO_FREE_WEEKEND: applyStatsFilter(base, 'NO_FREE_WEEKEND').length,
        };
    }
);

export const selectWarningFilterCounts = createSelector(
    selectWarnings,
    selectSelectedWorkerId,
    (warnings, workerId) => {
        const base = workerId
            ? warnings.filter((warning) => warning.workerId === workerId)
            : warnings;

        return {
            ALL: applyWarningFilter(base, 'ALL').length,
            ERROR: applyWarningFilter(base, 'ERROR').length,
            WARNING: applyWarningFilter(base, 'WARNING').length,
            INFO: applyWarningFilter(base, 'INFO').length,
            FORCED: applyWarningFilter(base, 'FORCED').length,
        };
    }
);

function applyStatsFilter(
    stats: WorkerStats[],
    filter: StatsFilterType
) {
    if (filter === 'FORCED') {
        return stats.filter((stat) => stat.forcedAssignmentsCount > 0);
    }

    if (filter === 'EXTRA') {
        return stats.filter((stat) => stat.extraHours > 0);
    }

    if (filter === 'UNDER_HOURS') {
        return stats.filter((stat) => {
            return stat.minMonthlyHours !== undefined
                && stat.totalHours < stat.minMonthlyHours;
        });
    }

    if (filter === 'NO_FREE_WEEKEND') {
        return stats.filter((stat) => stat.freeWeekendCount < 1);
    }

    return stats;
}

function applyWarningFilter(
    warnings: ScheduleWarning[],
    filter: WarningFilterType
) {
    if (filter === 'ERROR') {
        return warnings.filter((warning) => warning.severity === 'ERROR');
    }

    if (filter === 'WARNING') {
        return warnings.filter((warning) => warning.severity === 'WARNING');
    }

    if (filter === 'INFO') {
        return warnings.filter((warning) => warning.severity === 'INFO');
    }

    if (filter === 'FORCED') {
        return warnings.filter((warning) => warning.id.startsWith('FORCED_'));
    }

    return warnings;
}
