import { Injectable } from '@angular/core';

import {
    AssignedShift,
    DaySchedule,
    DayScheduleIndicators,
    RuleCheckResult,
    SchedulePlan,
    ScheduleWarning,
    ShiftDefinition,
    ShiftReplacementResult,
    ShiftType,
    Worker,
    WorkerAbsence,
    WorkerStats,
} from '../models/turni.models';
import { DateRangeService } from './date-range.service';
import { ScheduleWarningService } from './schedule-warning.service';
import { ShiftRulesService } from './shift-rules.service';
import { WorkerStatsService } from './worker-stats.service';

@Injectable({
    providedIn: 'root',
})
export class ShiftReplacementService {
    constructor(
        private shiftRulesService: ShiftRulesService,
        private workerStatsService: WorkerStatsService,
        private warningService: ScheduleWarningService,
        private dateRangeService: DateRangeService
    ) {}

    markWorkerSickAndReplace(params: {
        plan: SchedulePlan;
        workers: Worker[];
        shifts: ShiftDefinition[];
        absences: WorkerAbsence[];
        date: string;
        shift: ShiftType;
        workerId: string;
        note?: string;
        excludedReplacementWorkerIds?: string[];
    }): ShiftReplacementResult {
        const plan = this.clonePlan(params.plan);
        const day = plan.days.find((item) => item.date === params.date);

        if (!day) {
            return this.createNoChangeResult({
                plan,
                workerId: params.workerId,
                message: 'Giorno non trovato nel piano.',
            });
        }

        const shiftDefinition = params.shifts.find((item) => item.type === params.shift);

        if (!shiftDefinition) {
            return this.createNoChangeResult({
                plan,
                workerId: params.workerId,
                message: 'Turno non trovato nella configurazione.',
            });
        }

        const assignmentIndex = day.assignments.findIndex((assignment) => {
            return assignment.workerId === params.workerId
                && assignment.shift === params.shift
                && assignment.isFigurative !== true;
        });

        if (assignmentIndex < 0) {
            return this.createNoChangeResult({
                plan,
                workerId: params.workerId,
                message: 'Operatore non presente nel turno selezionato.',
            });
        }

        const originalAssignment = day.assignments[assignmentIndex];
        day.assignments.splice(assignmentIndex, 1);

        const sickAssignment = this.createSickFigurativeAssignment({
            originalAssignment,
            note: params.note,
        });

        day.assignments.push(sickAssignment);

        const sickAbsence = this.createSickAbsenceFromAssignment(sickAssignment);
        const updatedAbsences = this.upsertAbsence(
            params.absences,
            sickAbsence
        );

        const replacement = this.findReplacement({
            plan,
            day,
            workers: params.workers,
            absences: updatedAbsences,
            shift: shiftDefinition,
            originalWorkerId: params.workerId,
            excludedReplacementWorkerIds: params.excludedReplacementWorkerIds ?? [],
        });

        let replaced = false;
        let forced = false;
        let uncovered = false;
        let replacementWorkerId: string | undefined;

        if (replacement) {
            const source = replacement.ruleCheck.allowed ? 'AUTO' : 'FORCED';

            sickAssignment.replacedByWorkerId = replacement.worker.id;
            sickAssignment.replacedByWorkerName = replacement.worker.name;

            day.assignments.push(
                this.createReplacementAssignment({
                    date: params.date,
                    shift: shiftDefinition,
                    worker: replacement.worker,
                    source,
                    ruleCheck: replacement.ruleCheck,
                    originalWorkerId: originalAssignment.workerId,
                    originalWorkerName: originalAssignment.workerName,
                })
            );

            replaced = true;
            forced = source === 'FORCED';
            replacementWorkerId = replacement.worker.id;

            if (forced) {
                day.warnings.push(
                    this.createReplacementWarning({
                        date: params.date,
                        shift: params.shift,
                        workerName: replacement.worker.name,
                        originalWorkerName: originalAssignment.workerName,
                        forced: true,
                        message: replacement.ruleCheck.messages.join(' '),
                    })
                );
            }
        } else {
            uncovered = true;

            day.warnings.push(
                this.warningService.createUncoveredShiftWarning({
                    date: params.date,
                    shift: shiftDefinition,
                    assignedCount: this.countRealAssignments(day, params.shift),
                })
            );
        }

        day.warnings.push(
            this.createSickWarning({
                date: params.date,
                shift: params.shift,
                workerId: params.workerId,
                workerName: originalAssignment.workerName,
            })
        );

        const recalculatedPlan = this.recalculatePlan({
            plan,
            workers: params.workers,
        });

        return {
            plan: recalculatedPlan,
            absences: updatedAbsences,
            replaced,
            forced,
            uncovered,
            originalWorkerId: params.workerId,
            originalWorkerName: originalAssignment.workerName,
            replacementWorkerId,
            replacementWorkerName: replacement?.worker.name,
            message: replaced
                ? forced
                    ? 'Sostituto trovato in modalità forzata.'
                    : 'Sostituto trovato automaticamente.'
                : 'Nessun sostituto disponibile: turno scoperto.',
        };
    }

    private findReplacement(params: {
        plan: SchedulePlan;
        day: DaySchedule;
        workers: Worker[];
        absences: WorkerAbsence[];
        shift: ShiftDefinition;
        originalWorkerId: string;
        excludedReplacementWorkerIds: string[];
    }): {
        worker: Worker;
        ruleCheck: RuleCheckResult;
        score: number;
    } | null {
        const previousDays = params.plan.days.filter((day) => day.date < params.day.date);

        const currentDayAssignments = params.day.assignments.filter((assignment) => {
            return assignment.isFigurative !== true;
        });

        const candidates = params.workers
            .filter((worker) => {
                return worker.id !== params.originalWorkerId
                    && !params.excludedReplacementWorkerIds.includes(worker.id);
            })
            .map((worker) => {
                const ruleCheck = this.shiftRulesService.checkWorkerAssignment({
                    worker,
                    date: params.day.date,
                    shift: params.shift,
                    previousDays,
                    currentDayAssignments,
                    absences: params.absences,
                });

                return {
                    worker,
                    ruleCheck,
                    score: ruleCheck.score + this.workerStatsService.countWorkerHours(
                        params.plan.days,
                        worker.id
                    ),
                };
            });

        const allowed = candidates
            .filter((candidate) => candidate.ruleCheck.allowed)
            .sort((a, b) => a.score - b.score);

        if (allowed[0]) {
            return allowed[0];
        }

        const forced = candidates
            .filter((candidate) => !candidate.ruleCheck.hardBlocked)
            .sort((a, b) => a.score - b.score);

        return forced[0] ?? null;
    }

    private createSickFigurativeAssignment(params: {
        originalAssignment: AssignedShift;
        note?: string;
    }): AssignedShift {
        return {
            ...params.originalAssignment,
            id: `${params.originalAssignment.id}_SICK_${Date.now()}`,
            hours: 0,
            source: 'ABSENCE',
            forcedReason: `${params.originalAssignment.workerName} in malattia.`,
            violatedRules: ['WORKER_IN_SICK_LEAVE'],
            extraHours: 0,
            isFigurative: true,
            absenceType: 'MALATTIA',
            absenceNote: params.note ?? 'Inserita manualmente dal piano turni.',
        };
    }

    private createReplacementAssignment(params: {
        date: string;
        shift: ShiftDefinition;
        worker: Worker;
        source: AssignedShift['source'];
        ruleCheck: RuleCheckResult;
        originalWorkerId: string;
        originalWorkerName: string;
    }): AssignedShift {
        return {
            id: `${params.date}_${params.shift.type}_${params.worker.id}_REPLACEMENT_${Date.now()}`,
            date: params.date,
            shift: params.shift.type,
            workerId: params.worker.id,
            workerName: params.worker.name,
            hours: params.shift.hours,
            source: params.source,
            forcedReason: params.source === 'FORCED'
                ? `Sostituzione forzata per malattia di ${params.originalWorkerName}. ${params.ruleCheck.messages.join(' ')}`
                : `Sostituzione per malattia di ${params.originalWorkerName}.`,
            violatedRules: params.ruleCheck.violatedRules,
            extraHours: params.source === 'FORCED' ? params.shift.hours : 0,
            isFigurative: false,
            replacesWorkerId: params.originalWorkerId,
            replacesWorkerName: params.originalWorkerName,
        };
    }

    private createSickAbsenceFromAssignment(assignment: AssignedShift): WorkerAbsence {
        return {
            id: `${assignment.date}_${assignment.workerId}_SICK_MANUAL`,
            workerId: assignment.workerId,
            type: 'MALATTIA',
            startDate: assignment.date,
            endDate: assignment.date,
            note: assignment.absenceNote,
        };
    }

    private createSickWarning(params: {
        date: string;
        shift: ShiftType;
        workerId: string;
        workerName: string;
    }): ScheduleWarning {
        return {
            id: `SICK_${params.date}_${params.shift}_${params.workerId}_${Date.now()}`,
            severity: 'WARNING',
            date: params.date,
            shift: params.shift,
            workerId: params.workerId,
            workerName: params.workerName,
            message: `${params.workerName} è stato messo in malattia sul turno ${params.shift}. Presenza figurativa non conteggiata.`,
        };
    }

    private createReplacementWarning(params: {
        date: string;
        shift: ShiftType;
        workerName: string;
        originalWorkerName: string;
        forced: boolean;
        message: string;
    }): ScheduleWarning {
        return {
            id: `REPLACEMENT_FORCED_${params.date}_${params.shift}_${Date.now()}`,
            severity: params.forced ? 'WARNING' : 'INFO',
            date: params.date,
            shift: params.shift,
            workerName: params.workerName,
            message: `${params.workerName} sostituisce ${params.originalWorkerName}. ${params.message}`,
        };
    }

    private recalculatePlan(params: {
        plan: SchedulePlan;
        workers: Worker[];
    }): SchedulePlan {
        const days: DaySchedule[] = params.plan.days.map((day) => {
            return {
                ...day,
                warnings: this.deduplicateWarnings(day.warnings),
                indicators: this.createDayIndicators(day),
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

    private createDayIndicators(day: DaySchedule): DayScheduleIndicators {
        const warnings = day.warnings;
        const assignments = day.assignments;

        const errorWarnings = warnings.filter((warning) => warning.severity === 'ERROR').length;
        const forcedAssignments = assignments.filter((assignment) => assignment.source === 'FORCED').length;
        const figurativeAssignments = assignments.filter((assignment) => assignment.isFigurative === true).length;
        const sickWorkers = assignments.filter((assignment) => {
            return assignment.isFigurative === true
                && assignment.absenceType === 'MALATTIA';
        }).length;
        const absentWorkers = figurativeAssignments;
        const uncoveredShifts = warnings.filter((warning) => warning.id.startsWith('UNCOVERED_')).length;

        const status: DayScheduleIndicators['status'] =
            errorWarnings > 0 || uncoveredShifts > 0
                ? 'ERROR'
                : forcedAssignments > 0 || absentWorkers > 0 || warnings.length > 0
                    ? 'WARNING'
                    : 'OK';

        return {
            status,
            totalWarnings: warnings.length,
            errorWarnings,
            uncoveredShifts,
            forcedAssignments,
            absentWorkers,
            sickWorkers,
            figurativeAssignments,
        };
    }

    private countRealAssignments(day: DaySchedule, shift: ShiftType): number {
        return day.assignments.filter((assignment) => {
            return assignment.shift === shift
                && assignment.isFigurative !== true;
        }).length;
    }

    private deduplicateWarnings(warnings: ScheduleWarning[]): ScheduleWarning[] {
        const map = new Map<string, ScheduleWarning>();
        warnings.forEach((warning) => map.set(warning.id, warning));
        return Array.from(map.values());
    }

    private upsertAbsence(
        absences: WorkerAbsence[],
        absence: WorkerAbsence
    ): WorkerAbsence[] {
        const exists = absences.some((item) => {
            return item.id === absence.id;
        });

        if (exists) {
            return absences.map((item) => {
                return item.id === absence.id
                    ? absence
                    : item;
            });
        }

        return [
            ...absences,
            absence,
        ];
    }

    private createNoChangeResult(params: {
        plan: SchedulePlan;
        workerId: string;
        message: string;
    }): ShiftReplacementResult {
        return {
            plan: params.plan,
            absences: [],
            replaced: false,
            forced: false,
            uncovered: false,
            originalWorkerId: params.workerId,
            message: params.message,
        };
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
                    warnings: day.warnings.map((warning) => ({ ...warning })),
                    indicators: {
                        ...day.indicators,
                    },
                };
            }),
            warnings: plan.warnings.map((warning) => ({ ...warning })),
            stats: plan.stats.map((stat: WorkerStats) => ({ ...stat })),
        };
    }
}
