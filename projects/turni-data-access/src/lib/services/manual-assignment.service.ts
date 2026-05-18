import { Injectable } from '@angular/core';

import {
    AssignedShift,
    DaySchedule,
    SchedulePlan,
    ScheduleWarning,
    ShiftDefinition,
    ShiftType,
    Worker,
    WorkerStats,
} from '../models/turni.models';
import { DateRangeService } from './date-range.service';
import { ScheduleWarningService } from './schedule-warning.service';
import { WorkerStatsService } from './worker-stats.service';

@Injectable({
    providedIn: 'root',
})
export class ManualAssignmentService {
    constructor(
        private readonly workerStatsService: WorkerStatsService,
        private readonly warningService: ScheduleWarningService,
        private readonly dateRangeService: DateRangeService
    ) {}

    addManualAssignment(params: {
        plan: SchedulePlan;
        workers: Worker[];
        shifts: ShiftDefinition[];
        date: string;
        shift: ShiftType;
        workerId: string;
        note?: string;
    }): SchedulePlan {
        const plan = this.clonePlan(params.plan);
        const day = plan.days.find((item) => item.date === params.date);

        if (!day) {
            throw new Error('Giorno non trovato nel piano.');
        }

        const shiftDefinition = params.shifts.find((item) => item.type === params.shift);

        if (!shiftDefinition) {
            throw new Error('Turno non trovato nella configurazione.');
        }

        const worker = params.workers.find((item) => item.id === params.workerId);

        if (!worker) {
            throw new Error('Operatore non trovato.');
        }

        const alreadyAssigned = day.assignments.some((assignment) => {
            return assignment.workerId === params.workerId
                && assignment.shift === params.shift
                && assignment.isFigurative !== true;
        });

        if (alreadyAssigned) {
            throw new Error('Operatore già presente nel turno selezionato.');
        }

        day.assignments.push({
            id: `${params.date}_${params.shift}_${params.workerId}_MANUAL_${Date.now()}`,
            date: params.date,
            shift: params.shift,
            workerId: worker.id,
            workerName: worker.fullName || worker.name,
            hours: shiftDefinition.hours,
            source: 'MANUAL',
            manualReason: 'MANUAL_INSERT',
            forcedReason: params.note ?? 'Inserimento manuale da piano turni.',
            violatedRules: [],
            extraHours: 0,
            isFigurative: false,
        });

        day.warnings.push(this.createManualWarning({
            date: params.date,
            shift: params.shift,
            worker,
            note: params.note,
        }));

        return this.recalculatePlan({
            plan,
            workers: params.workers,
        });
    }

    private createManualWarning(params: {
        date: string;
        shift: ShiftType;
        worker: Worker;
        note?: string;
    }): ScheduleWarning {
        return {
            id: `MANUAL_ASSIGNMENT_${params.date}_${params.shift}_${params.worker.id}_${Date.now()}`,
            severity: 'INFO',
            date: params.date,
            shift: params.shift,
            workerId: params.worker.id,
            workerName: params.worker.fullName || params.worker.name,
            message: `${params.worker.fullName || params.worker.name} inserito manualmente sul turno ${params.shift}. ${params.note ?? ''}`.trim(),
        };
    }

    private recalculatePlan(params: {
        plan: SchedulePlan;
        workers: Worker[];
    }): SchedulePlan {
        const days: DaySchedule[] = params.plan.days.map((day) => {
            const warnings = this.deduplicateWarnings(day.warnings);

            return {
                ...day,
                warnings,
                indicators: {
                    ...day.indicators,
                    totalWarnings: warnings.length,
                    forcedAssignments: day.assignments.filter((assignment) => assignment.source === 'FORCED').length,
                },
            };
        });

        const stats = this.workerStatsService.calculateStats(
            params.workers,
            days
        );

        const qualityWarnings = this.warningService.createQualityWarnings({
            range: params.plan.range,
            workers: params.workers,
            days,
            stats,
        });

        return {
            ...params.plan,
            days,
            stats,
            warnings: this.deduplicateWarnings([
                ...days.flatMap((day) => day.warnings),
                ...qualityWarnings,
            ]),
            source: 'REGENERATED',
            generatedAt: this.dateRangeService.nowIso(),
        };
    }

    private deduplicateWarnings(warnings: ScheduleWarning[]): ScheduleWarning[] {
        const map = new Map<string, ScheduleWarning>();
        warnings.forEach((warning) => {
            map.set(warning.id, warning);
        });

        return Array.from(map.values());
    }

    private clonePlan(plan: SchedulePlan): SchedulePlan {
        return {
            ...plan,
            range: {
                ...plan.range,
            },
            days: plan.days.map((day) => {
                return {
                    ...day,
                    assignments: day.assignments.map((assignment) => {
                        return {
                            ...assignment,
                            violatedRules: [
                                ...assignment.violatedRules,
                            ],
                        };
                    }),
                    warnings: day.warnings.map((warning) => {
                        return {
                            ...warning,
                        };
                    }),
                    indicators: {
                        ...day.indicators,
                    },
                };
            }),
            warnings: plan.warnings.map((warning) => {
                return {
                    ...warning,
                };
            }),
            stats: plan.stats.map((stat: WorkerStats) => {
                return {
                    ...stat,
                };
            }),
        };
    }
}
