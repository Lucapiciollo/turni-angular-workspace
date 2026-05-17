import { Injectable } from '@angular/core';

import { ABSENCES } from '../data/absences.mock';
import {
    AssignedShift,
    DateRange,
    DaySchedule,
    DayScheduleIndicators,
    RuleCheckResult,
    SchedulePlan,
    ScheduleWarning,
    ShiftDefinition,
    Worker,
    WorkerAbsence,
} from '../models/turni.models';
import { DateRangeService } from './date-range.service';
import { ScheduleWarningService } from './schedule-warning.service';
import { ShiftRulesService } from './shift-rules.service';
import { WorkerAbsenceService } from './worker-absence.service';
import { WorkerStatsService } from './worker-stats.service';

@Injectable({
    providedIn: 'root',
})
export class TurniGeneratorService {
    constructor(
        private dateRangeService: DateRangeService,
        private shiftRulesService: ShiftRulesService,
        private workerStatsService: WorkerStatsService,
        private warningService: ScheduleWarningService,
        private workerAbsenceService: WorkerAbsenceService
    ) {}

    generatePlan(
        range: DateRange,
        workers: Worker[],
        shifts: ShiftDefinition[],
        generationSeed = 0,
        source: SchedulePlan['source'] = 'GENERATED'
    ): SchedulePlan {
        const dates = this.dateRangeService.getDatesBetween(
            range.startDate,
            range.endDate
        );

        const days: DaySchedule[] = [];
        const warnings: ScheduleWarning[] = [];

        dates.forEach((date, dayIndex) => {
            const day = this.generateDaySchedule({
                date,
                dayIndex,
                workers,
                shifts,
                previousDays: days,
                generationSeed,
            });

            warnings.push(...day.warnings);
            days.push(day);
        });

        const stats = this.workerStatsService.calculateStats(
            workers,
            days
        );

        const qualityWarnings = this.warningService.createQualityWarnings({
            range,
            workers,
            days,
            stats,
        });

        warnings.push(...qualityWarnings);

        return {
            range,
            days,
            warnings,
            stats,
            source,
            generatedAt: this.dateRangeService.nowIso(),
        };
    }

    private generateDaySchedule(params: {
        date: string;
        dayIndex: number;
        workers: Worker[];
        shifts: ShiftDefinition[];
        previousDays: DaySchedule[];
        generationSeed: number;
    }): DaySchedule {
        const assignments: AssignedShift[] = [];
        const warnings: ScheduleWarning[] = [];

        const figurativeAbsenceAssignments = this.createFigurativeAbsenceAssignments({
            date: params.date,
            workers: params.workers,
            absences: ABSENCES,
        });

        for (const shift of params.shifts) {
            const shiftAssignments = this.generateShiftAssignments({
                ...params,
                shift,
                currentDayAssignments: assignments,
            });

            assignments.push(...shiftAssignments);

            const forcedWarnings = shiftAssignments
                .filter((assignment) => {
                    return assignment.source === 'FORCED';
                })
                .map((assignment) => {
                    return this.warningService.createForcedAssignmentWarning(assignment);
                });

            warnings.push(...forcedWarnings);

            if (shiftAssignments.length < shift.requiredWorkers) {
                warnings.push(
                    this.warningService.createUncoveredShiftWarning({
                        date: params.date,
                        shift,
                        assignedCount: shiftAssignments.length,
                    })
                );
            }
        }

        assignments.push(...figurativeAbsenceAssignments);

        return {
            date: params.date,
            label: this.dateRangeService.getDayLabel(params.date),
            isWeekend: this.dateRangeService.isWeekend(params.date),
            assignments,
            warnings,
            indicators: this.createDayIndicators({
                warnings,
                assignments,
            }),
        };
    }

    private generateShiftAssignments(params: {
        date: string;
        dayIndex: number;
        workers: Worker[];
        shifts: ShiftDefinition[];
        previousDays: DaySchedule[];
        currentDayAssignments: AssignedShift[];
        generationSeed: number;
        shift: ShiftDefinition;
    }): AssignedShift[] {
        const assignments: AssignedShift[] = [];

        for (let index = 0; index < params.shift.requiredWorkers; index++) {
            const currentDayAssignments = [
                ...params.currentDayAssignments,
                ...assignments,
            ];

            const worker = this.findBestAllowedWorker({
                ...params,
                currentDayAssignments,
                slotIndex: index,
            });

            if (worker) {
                assignments.push(
                    this.createAssignment({
                        date: params.date,
                        shift: params.shift,
                        worker,
                        generationSeed: params.generationSeed,
                        source: 'AUTO',
                        ruleCheck: {
                            allowed: true,
                            hardBlocked: false,
                            score: 0,
                            violatedRules: [],
                            messages: [],
                        },
                    })
                );

                continue;
            }

            const forcedCandidate = this.findBestForcedWorker({
                ...params,
                currentDayAssignments,
                slotIndex: index,
            });

            if (!forcedCandidate) {
                break;
            }

            assignments.push(
                this.createAssignment({
                    date: params.date,
                    shift: params.shift,
                    worker: forcedCandidate.worker,
                    generationSeed: params.generationSeed,
                    source: 'FORCED',
                    ruleCheck: forcedCandidate.ruleCheck,
                })
            );
        }

        return assignments;
    }

    private findBestAllowedWorker(params: {
        date: string;
        dayIndex: number;
        workers: Worker[];
        previousDays: DaySchedule[];
        currentDayAssignments: AssignedShift[];
        generationSeed: number;
        shift: ShiftDefinition;
        slotIndex: number;
    }): Worker | null {
        const candidates = params.workers.filter((worker) => {
            return this.shiftRulesService.checkWorkerAssignment({
                worker,
                date: params.date,
                shift: params.shift,
                previousDays: params.previousDays,
                currentDayAssignments: params.currentDayAssignments,
                absences: ABSENCES,
            }).allowed;
        });

        if (candidates.length === 0) {
            return null;
        }

        const dateSeed = this.createDateSeed(params.date)
            + params.dayIndex
            + params.generationSeed
            + params.slotIndex;

        return candidates
            .map((worker, index) => {
                return {
                    worker,
                    score: this.calculateWorkerScore(
                        worker,
                        params.previousDays,
                        dateSeed + index
                    ),
                };
            })
            .sort((a, b) => {
                return a.score - b.score;
            })[0].worker;
    }

    private findBestForcedWorker(params: {
        date: string;
        dayIndex: number;
        workers: Worker[];
        previousDays: DaySchedule[];
        currentDayAssignments: AssignedShift[];
        generationSeed: number;
        shift: ShiftDefinition;
        slotIndex: number;
    }): {
        worker: Worker;
        ruleCheck: RuleCheckResult;
    } | null {
        const candidates = params.workers
            .map((worker, index) => {
                const ruleCheck = this.shiftRulesService.checkWorkerAssignment({
                    worker,
                    date: params.date,
                    shift: params.shift,
                    previousDays: params.previousDays,
                    currentDayAssignments: params.currentDayAssignments,
                    absences: ABSENCES,
                });

                return {
                    worker,
                    ruleCheck,
                    score:
                        ruleCheck.score +
                        this.calculateWorkerScore(
                            worker,
                            params.previousDays,
                            index + params.generationSeed
                        ),
                };
            })
            .filter((candidate) => {
                return !candidate.ruleCheck.hardBlocked;
            })
            .sort((a, b) => {
                return a.score - b.score;
            });

        return candidates[0] ?? null;
    }

    private createAssignment(params: {
        date: string;
        shift: ShiftDefinition;
        worker: Worker;
        generationSeed: number;
        source: AssignedShift['source'];
        ruleCheck: RuleCheckResult;
    }): AssignedShift {
        const maxHours = params.worker.contract?.maxMonthlyHours
            ?? params.worker.contract?.monthlyHours
            ?? 0;

        const forcedBecauseExtraHours =
            params.ruleCheck.violatedRules.includes('MAX_MONTHLY_HOURS');

        return {
            id:
                `${params.date}_${params.shift.type}_${params.worker.id}_` +
                `${params.source}_${params.generationSeed}`,
            date: params.date,
            shift: params.shift.type,
            workerId: params.worker.id,
            workerName: params.worker.name,
            hours: params.shift.hours,
            source: params.source,
            forcedReason: params.ruleCheck.messages.join(' '),
            violatedRules: params.ruleCheck.violatedRules,
            extraHours: params.source === 'FORCED' && forcedBecauseExtraHours
                ? params.shift.hours
                : params.source === 'FORCED' && maxHours === 0
                    ? params.shift.hours
                    : 0,
            isFigurative: false,
        };
    }

    private createFigurativeAbsenceAssignments(params: {
        date: string;
        workers: Worker[];
        absences: WorkerAbsence[];
    }): AssignedShift[] {
        const absencesForDate = this.workerAbsenceService.getAbsencesForDate({
            date: params.date,
            absences: params.absences,
        });

        const assignments: AssignedShift[] = [];

        for (const absence of absencesForDate) {
            const worker = params.workers.find((item) => {
                return item.id === absence.workerId;
            });

            if (!worker) {
                continue;
            }

            const assignment: AssignedShift = {
                id: `${params.date}_ABSENCE_${worker.id}_${absence.id}`,
                date: params.date,
                shift: 'MATTINA',
                workerId: worker.id,
                workerName: worker.name,
                hours: 0,
                source: 'ABSENCE',
                forcedReason: `${worker.name} assente per ${this.workerAbsenceService.getAbsenceLabel(absence.type)}.`,
                violatedRules: absence.type === 'MALATTIA'
                    ? ['WORKER_IN_SICK_LEAVE']
                    : ['WORKER_ABSENT'],
                extraHours: 0,
                isFigurative: true,
                absenceType: absence.type,
                absenceNote: absence.note,
            };

            assignments.push(assignment);
        }

        return assignments;
    }

    private createDayIndicators(params: {
        warnings: ScheduleWarning[];
        assignments: AssignedShift[];
    }): DayScheduleIndicators {
        const errorWarnings = params.warnings.filter((warning) => {
            return warning.severity === 'ERROR';
        }).length;

        const forcedAssignments = params.assignments.filter((assignment) => {
            return assignment.source === 'FORCED';
        }).length;

        const figurativeAssignments = params.assignments.filter((assignment) => {
            return assignment.isFigurative === true;
        }).length;

        const sickWorkers = params.assignments.filter((assignment) => {
            return assignment.isFigurative === true
                && assignment.absenceType === 'MALATTIA';
        }).length;

        const absentWorkers = params.assignments.filter((assignment) => {
            return assignment.isFigurative === true;
        }).length;

        const uncoveredShifts = params.warnings.filter((warning) => {
            return warning.id.startsWith('UNCOVERED_');
        }).length;

        const status = errorWarnings > 0 || uncoveredShifts > 0
            ? 'ERROR'
            : forcedAssignments > 0 || absentWorkers > 0 || params.warnings.length > 0
                ? 'WARNING'
                : 'OK';

        return {
            status,
            totalWarnings: params.warnings.length,
            errorWarnings,
            uncoveredShifts,
            forcedAssignments,
            absentWorkers,
            sickWorkers,
            figurativeAssignments,
        };
    }

    private calculateWorkerScore(
        worker: Worker,
        previousDays: DaySchedule[],
        seed: number
    ): number {
        const hours = this.workerStatsService.countWorkerHours(
            previousDays,
            worker.id
        );

        const nights = this.workerStatsService.countWorkerShift(
            previousDays,
            worker.id,
            'NOTTE'
        );

        const workerNumericSeed = this.createWorkerSeed(worker.id);
        const rotationNoise = (workerNumericSeed + seed * 13) % 37;

        return hours * 10
            + nights * 15
            + rotationNoise;
    }

    private createWorkerSeed(workerId: string): number {
        return workerId
            .split('')
            .reduce((total, char) => {
                return total + char.charCodeAt(0);
            }, 0);
    }

    private createDateSeed(date: string): number {
        return date
            .replace(/-/g, '')
            .split('')
            .reduce((total, value) => {
                return total + Number(value);
            }, 0);
    }
}
