import { Injectable } from '@angular/core';

import {
    AssignedShift,
    DaySchedule,
    SchedulePlan,
    ScheduleWarning,
    ShiftChangeParams,
    ShiftDefinition,
    Worker,
    WorkerStats,
} from '../models/turni.models';
import { DateRangeService } from './date-range.service';
import { ScheduleWarningService } from './schedule-warning.service';
import { WorkerStatsService } from './worker-stats.service';

@Injectable({
    providedIn: 'root',
})
export class ShiftChangeService {
    constructor(
        private readonly workerStatsService: WorkerStatsService,
        private readonly warningService: ScheduleWarningService,
        private readonly dateRangeService: DateRangeService
    ) {}



    changeShift(params: ShiftChangeParams & {
        plan: SchedulePlan;
        workers: Worker[];
        shifts: ShiftDefinition[];
    }): SchedulePlan {
        this.validateShiftChangeTarget(params);

        const plan = this.clonePlan(params.plan);
        const sourceDay = plan.days.find((item) => item.date === params.sourceDate);

        if (!sourceDay) {
            throw new Error('Giorno di partenza non trovato nel piano.');
        }

        const sourceAssignment = sourceDay.assignments.find((assignment) => {
            return assignment.workerId === params.sourceWorkerId
                && assignment.shift === params.sourceShift
                && assignment.isFigurative !== true;
        });

        if (!sourceAssignment) {
            throw new Error('Operatore non trovato nel turno di partenza.');
        }

        if (params.mode === 'MOVE_OTHER_DAY') {
            if (!params.targetDate) {
                throw new Error('Giorno destinazione non selezionato.');
            }

            const targetDay = plan.days.find((item) => item.date === params.targetDate);

            if (!targetDay) {
                throw new Error('Giorno destinazione non trovato nel piano.');
            }

            const targetShiftDefinition = this.getShiftDefinition(params.shifts, params.targetShift);

            const alreadyAssignedOnTarget = targetDay.assignments.some((assignment) => {
                return assignment.workerId === params.sourceWorkerId
                    && assignment.shift === params.targetShift
                    && assignment.isFigurative !== true;
            });

            if (alreadyAssignedOnTarget) {
                throw new Error('Operatore già presente nel giorno/turno destinazione.');
            }

            const sourceShift = sourceAssignment.shift;
            const sourceDate = sourceAssignment.date;

            sourceDay.assignments = sourceDay.assignments.filter((assignment) => {
                return assignment.id !== sourceAssignment.id;
            });

            const movedAssignment: AssignedShift = {
                ...sourceAssignment,
                id: `${sourceAssignment.id}_MOVE_${params.targetDate}_${params.targetShift}_${Date.now()}`,
                date: params.targetDate,
                shift: params.targetShift,
                hours: targetShiftDefinition.hours,
                source: 'MANUAL',
                manualReason: 'SHIFT_CHANGE',
                changedFromDate: sourceDate,
                changedFromShift: sourceShift,
                changedFromWorkerId: sourceAssignment.workerId,
                changeNote: params.note,
                forcedReason: params.note
                    ? `Spostamento manuale da altro giorno. ${params.note}`
                    : 'Spostamento manuale da altro giorno.',
                violatedRules: [],
            };

            targetDay.assignments.push(movedAssignment);

            sourceDay.warnings.push(
                this.createShiftMoveWarning({
                    assignment: movedAssignment,
                    sourceDate,
                    targetDate: params.targetDate,
                    sourceShift,
                    targetShift: params.targetShift,
                    note: params.note,
                })
            );

            targetDay.warnings.push(
                this.createShiftMoveWarning({
                    assignment: movedAssignment,
                    sourceDate,
                    targetDate: params.targetDate,
                    sourceShift,
                    targetShift: params.targetShift,
                    note: params.note,
                })
            );

            return this.recalculatePlan({
                plan,
                workers: params.workers,
                shifts: params.shifts,
            });
        }

        if (params.mode === 'SWAP_SAME_DAY') {
            if (!params.targetWorkerId) {
                throw new Error('Operatore di scambio non selezionato.');
            }

            const targetAssignment = sourceDay.assignments.find((assignment) => {
                return assignment.workerId === params.targetWorkerId
                    && assignment.shift === params.targetShift
                    && assignment.isFigurative !== true;
            });

            if (!targetAssignment) {
                throw new Error('Operatore di scambio non trovato nel turno destinazione.');
            }

            if (targetAssignment.workerId === sourceAssignment.workerId) {
                throw new Error('Non puoi scambiare un operatore con sé stesso.');
            }

            const sourceShiftDefinition = this.getShiftDefinition(params.shifts, params.sourceShift);
            const targetShiftDefinition = this.getShiftDefinition(params.shifts, params.targetShift);

            const sourceOriginalShift = sourceAssignment.shift;
            const targetOriginalShift = targetAssignment.shift;

            sourceAssignment.id = `${sourceAssignment.id}_SWAP_${params.targetShift}_${Date.now()}`;
            sourceAssignment.shift = params.targetShift;
            sourceAssignment.hours = targetShiftDefinition.hours;
            sourceAssignment.source = 'MANUAL';
            sourceAssignment.manualReason = 'SHIFT_SWAP';
            sourceAssignment.changedFromDate = sourceAssignment.date;
            sourceAssignment.changedFromShift = sourceOriginalShift;
            sourceAssignment.changedFromWorkerId = sourceAssignment.workerId;
            sourceAssignment.changedWithWorkerId = targetAssignment.workerId;
            sourceAssignment.changeNote = params.note;
            sourceAssignment.forcedReason = params.note
                ? `Scambio turno manuale. ${params.note}`
                : 'Scambio turno manuale.';
            sourceAssignment.violatedRules = [];

            targetAssignment.id = `${targetAssignment.id}_SWAP_${params.sourceShift}_${Date.now()}`;
            targetAssignment.shift = params.sourceShift;
            targetAssignment.hours = sourceShiftDefinition.hours;
            targetAssignment.source = 'MANUAL';
            targetAssignment.manualReason = 'SHIFT_SWAP';
            targetAssignment.changedFromDate = targetAssignment.date;
            targetAssignment.changedFromShift = targetOriginalShift;
            targetAssignment.changedFromWorkerId = targetAssignment.workerId;
            targetAssignment.changedWithWorkerId = sourceAssignment.workerId;
            targetAssignment.changeNote = params.note;
            targetAssignment.forcedReason = params.note
                ? `Scambio turno manuale. ${params.note}`
                : 'Scambio turno manuale.';
            targetAssignment.violatedRules = [];

            sourceDay.warnings.push(
                this.createShiftSwapWarning({
                    sourceAssignment,
                    targetAssignment,
                    sourceShift: sourceOriginalShift,
                    targetShift: targetOriginalShift,
                    note: params.note,
                })
            );

            return this.recalculatePlan({
                plan,
                workers: params.workers,
                shifts: params.shifts,
            });
        }

        const targetShiftDefinition = this.getShiftDefinition(params.shifts, params.targetShift);

        const alreadyAssignedOnTarget = sourceDay.assignments.some((assignment) => {
            return assignment.workerId === params.sourceWorkerId
                && assignment.shift === params.targetShift
                && assignment.isFigurative !== true;
        });

        if (alreadyAssignedOnTarget) {
            throw new Error('Operatore già presente nel turno destinazione.');
        }

        const sourceShift = sourceAssignment.shift;
        const sourceDate = sourceAssignment.date;

        sourceAssignment.id = `${sourceAssignment.id}_CHANGE_${params.targetShift}_${Date.now()}`;
        sourceAssignment.shift = params.targetShift;
        sourceAssignment.hours = targetShiftDefinition.hours;
        sourceAssignment.source = 'MANUAL';
        sourceAssignment.manualReason = 'SHIFT_CHANGE';
        sourceAssignment.changedFromDate = sourceDate;
        sourceAssignment.changedFromShift = sourceShift;
        sourceAssignment.changedFromWorkerId = sourceAssignment.workerId;
        sourceAssignment.changeNote = params.note;
        sourceAssignment.forcedReason = params.note
            ? `Cambio turno manuale. ${params.note}`
            : 'Cambio turno manuale.';
        sourceAssignment.violatedRules = [];

        sourceDay.warnings.push(
            this.createShiftChangeWarning({
                assignment: sourceAssignment,
                sourceShift,
                targetShift: params.targetShift,
                note: params.note,
            })
        );

        return this.recalculatePlan({
            plan,
            workers: params.workers,
            shifts: params.shifts,
        });
    }

    private validateShiftChangeTarget(params: ShiftChangeParams): void {
        const targetDate = params.targetDate ?? params.sourceDate;
        const isSameDate = targetDate === params.sourceDate;
        const isSameShift = params.targetShift === params.sourceShift;

        if (isSameDate && isSameShift) {
            throw new Error('Cambio turno non valido: devi scegliere un giorno diverso oppure un turno diverso.');
        }

        if (params.mode === 'MOVE_SAME_DAY' && !isSameDate) {
            throw new Error('La modalità sposta nello stesso giorno non può usare un giorno diverso.');
        }

        if (params.mode === 'MOVE_OTHER_DAY' && isSameDate) {
            throw new Error('La modalità altro giorno richiede un giorno destinazione diverso.');
        }

        if (params.mode === 'SWAP_SAME_DAY' && !isSameDate) {
            throw new Error('Lo scambio è consentito solo nello stesso giorno.');
        }
    }

    private getShiftDefinition(
        shifts: ShiftDefinition[],
        shift: ShiftDefinition['type']
    ): ShiftDefinition {
        const definition = shifts.find((item) => item.type === shift);

        if (!definition) {
            throw new Error('Turno non trovato nella configurazione.');
        }

        return definition;
    }

    private createShiftMoveWarning(params: {
        assignment: AssignedShift;
        sourceDate: string;
        targetDate: string;
        sourceShift: AssignedShift['shift'];
        targetShift: AssignedShift['shift'];
        note?: string;
    }): ScheduleWarning {
        return {
            id: `SHIFT_MOVE_${params.sourceDate}_${params.targetDate}_${params.assignment.workerId}_${Date.now()}`,
            severity: 'INFO',
            date: params.targetDate,
            shift: params.targetShift,
            workerId: params.assignment.workerId,
            workerName: params.assignment.workerName,
            message: `${params.assignment.workerName} spostato manualmente dal ${params.sourceDate} ${params.sourceShift} al ${params.targetDate} ${params.targetShift}. ${params.note ?? ''}`.trim(),
        };
    }

    private createShiftChangeWarning(params: {
        assignment: AssignedShift;
        sourceShift: AssignedShift['shift'];
        targetShift: AssignedShift['shift'];
        note?: string;
    }): ScheduleWarning {
        return {
            id: `SHIFT_CHANGE_${params.assignment.date}_${params.assignment.workerId}_${params.sourceShift}_${params.targetShift}_${Date.now()}`,
            severity: 'INFO',
            date: params.assignment.date,
            shift: params.targetShift,
            workerId: params.assignment.workerId,
            workerName: params.assignment.workerName,
            message: `${params.assignment.workerName} spostato manualmente da ${params.sourceShift} a ${params.targetShift}. ${params.note ?? ''}`.trim(),
        };
    }

    private createShiftSwapWarning(params: {
        sourceAssignment: AssignedShift;
        targetAssignment: AssignedShift;
        sourceShift: AssignedShift['shift'];
        targetShift: AssignedShift['shift'];
        note?: string;
    }): ScheduleWarning {
        return {
            id: `SHIFT_SWAP_${params.sourceAssignment.date}_${params.sourceAssignment.workerId}_${params.targetAssignment.workerId}_${Date.now()}`,
            severity: 'INFO',
            date: params.sourceAssignment.date,
            shift: params.targetShift,
            workerId: params.sourceAssignment.workerId,
            workerName: params.sourceAssignment.workerName,
            message: `${params.sourceAssignment.workerName} e ${params.targetAssignment.workerName} hanno scambiato turno: ${params.sourceShift} ↔ ${params.targetShift}. ${params.note ?? ''}`.trim(),
        };
    }

    private recalculatePlan(params: {
        plan: SchedulePlan;
        workers: Worker[];
        shifts: ShiftDefinition[];
    }): SchedulePlan {
        const days: DaySchedule[] = params.plan.days.map((day) => {
            const warnings = this.deduplicateWarnings(day.warnings);

            const uncoveredShifts = this.countUncoveredShifts(day, params.shifts);
            const errorWarnings = warnings.filter((warning) => warning.severity === 'ERROR').length;
            const forcedAssignments = day.assignments.filter((assignment) => assignment.source === 'FORCED').length;
            const figurativeAssignments = day.assignments.filter((assignment) => assignment.isFigurative === true).length;
            const sickWorkers = day.assignments.filter((assignment) => {
                return assignment.isFigurative === true
                    && assignment.absenceType === 'MALATTIA';
            }).length;

            return {
                ...day,
                warnings,
                indicators: {
                    ...day.indicators,
                    totalWarnings: warnings.length,
                    errorWarnings,
                    uncoveredShifts,
                    forcedAssignments,
                    figurativeAssignments,
                    absentWorkers: figurativeAssignments,
                    sickWorkers,
                    status: errorWarnings > 0 || uncoveredShifts > 0
                        ? 'ERROR'
                        : forcedAssignments > 0 || figurativeAssignments > 0 || warnings.length > 0
                            ? 'WARNING'
                            : 'OK',
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

    private countUncoveredShifts(
        day: DaySchedule,
        shifts: ShiftDefinition[]
    ): number {
        return shifts.filter((shift) => {
            const assignedCount = day.assignments.filter((assignment) => {
                return assignment.shift === shift.type
                    && assignment.isFigurative !== true;
            }).length;

            return assignedCount < shift.requiredWorkers;
        }).length;
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
