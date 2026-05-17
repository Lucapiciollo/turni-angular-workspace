import { Injectable } from '@angular/core';

import {
    AssignedShift,
    DateRange,
    DaySchedule,
    ScheduleWarning,
    ShiftDefinition,
    Worker,
    WorkerStats,
} from '../models/turni.models';

@Injectable({
    providedIn: 'root',
})
export class ScheduleWarningService {
    createUncoveredShiftWarning(params: {
        date: string;
        shift: ShiftDefinition;
        assignedCount: number;
    }): ScheduleWarning {
        return {
            id: `UNCOVERED_${params.date}_${params.shift.type}`,
            severity: 'ERROR',
            date: params.date,
            shift: params.shift.type,
            message:
                `Turno ${params.shift.label} del ${params.date} scoperto: ` +
                `${params.assignedCount}/${params.shift.requiredWorkers} assegnati.`,
        };
    }

    createForcedAssignmentWarning(assignment: AssignedShift): ScheduleWarning {
        return {
            id: `FORCED_${assignment.id}`,
            severity: 'WARNING',
            date: assignment.date,
            shift: assignment.shift,
            workerId: assignment.workerId,
            workerName: assignment.workerName,
            message:
                `${assignment.workerName} assegnato forzatamente su ${assignment.shift} ` +
                `del ${assignment.date}. Motivo: ${assignment.forcedReason ?? 'turno scoperto'}.`,
        };
    }

    createQualityWarnings(params: {
        range: DateRange;
        workers: Worker[];
        days: DaySchedule[];
        stats: WorkerStats[];
    }): ScheduleWarning[] {
        const warnings: ScheduleWarning[] = [];

        warnings.push(...this.createMinimumHoursWarnings(params.stats));
        warnings.push(...this.createFreeWeekendWarnings(params));
        warnings.push(...this.createExtraHoursWarnings(params.stats));

        return warnings;
    }

    private createMinimumHoursWarnings(
        stats: WorkerStats[]
    ): ScheduleWarning[] {
        return stats
            .filter((stat) => {
                return stat.minMonthlyHours !== undefined
                    && stat.totalHours < stat.minMonthlyHours;
            })
            .map((stat) => {
                return {
                    id: `MIN_HOURS_${stat.workerId}`,
                    severity: 'WARNING',
                    workerId: stat.workerId,
                    workerName: stat.workerName,
                    message:
                        `${stat.workerName} è sotto il minimo ore: ` +
                        `${stat.totalHours}/${stat.minMonthlyHours}.`,
                };
            });
    }

    private createExtraHoursWarnings(
        stats: WorkerStats[]
    ): ScheduleWarning[] {
        return stats
            .filter((stat) => {
                return stat.extraHours > 0;
            })
            .map((stat) => {
                return {
                    id: `EXTRA_HOURS_${stat.workerId}`,
                    severity: 'WARNING',
                    workerId: stat.workerId,
                    workerName: stat.workerName,
                    message:
                        `${stat.workerName} ha ${stat.extraHours} ore extra/forzate nel range.`,
                };
            });
    }

    private createFreeWeekendWarnings(params: {
        range: DateRange;
        workers: Worker[];
        days: DaySchedule[];
        stats: WorkerStats[];
    }): ScheduleWarning[] {
        if (params.range.mode !== 'MONTH') {
            return [];
        }

        return params.stats
            .filter((stat) => {
                const worker = params.workers.find((item) => {
                    return item.id === stat.workerId;
                });

                return worker?.rules?.requireAtLeastOneFreeWeekendPerMonth === true
                    && stat.freeWeekendCount < 1;
            })
            .map((stat) => {
                return {
                    id: `FREE_WEEKEND_${stat.workerId}`,
                    severity: 'WARNING',
                    workerId: stat.workerId,
                    workerName: stat.workerName,
                    message:
                        `${stat.workerName} non ha almeno un weekend libero ` +
                        `nel mese corrente.`,
                };
            });
    }
}
