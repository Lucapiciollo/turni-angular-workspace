import { Injectable } from '@angular/core';
import { TurniLoggerService } from '@turni/logging';

import { ABSENCES } from '../data/absences.mock';
import {
    AssignedShift,
    AssignmentRuleCode,
    DateRange,
    DaySchedule,
    DayScheduleIndicators,
    GenerationDecisionLog,
    GenerationSettings,
    PlanGenerationStep,
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
        private workerAbsenceService: WorkerAbsenceService,
        private logger: TurniLoggerService
    ) {}

    generatePlan(
        range: DateRange,
        workers: Worker[],
        shifts: ShiftDefinition[],
        generationSeed = 0,
        source: SchedulePlan['source'] = 'GENERATED',
        absences: WorkerAbsence[] = ABSENCES,
        previousContextDays: DaySchedule[] = [],
        generationSettings: GenerationSettings = {
            previousContextDays: 14,
            enableDecisionLogs: true,
        }
    ): SchedulePlan {
        const dates = this.dateRangeService.getDatesBetween(
            range.startDate,
            range.endDate
        );

        const days: DaySchedule[] = [];
        const warnings: ScheduleWarning[] = [];
        const generationLogs: GenerationDecisionLog[] = [];

        this.pushGenerationLog(
            generationLogs,
            generationSettings,
            {
                date: range.startDate,
                decision: 'CONTEXT_LOADED',
                messages: [
                    `Caricati ${previousContextDays.length} giorni precedenti come contesto di generazione.`,
                ],
                contextPreviousDaysCount: previousContextDays.length,
            }
        );

        dates.forEach((date, dayIndex) => {
            const day = this.generateDaySchedule({
                date,
                dayIndex,
                workers,
                shifts,
                previousDays: [
                    ...previousContextDays,
                    ...days,
                ],
                generationSeed,
                absences,
                generationLogs,
                generationSettings,
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
            generationLogs,
            generationSettings,
        };
    }

    async *generatePlanSteps(params: {
        range: DateRange;
        workers: Worker[];
        shifts: ShiftDefinition[];
        generationSeed?: number;
        source?: SchedulePlan['source'];
        absences?: WorkerAbsence[];
        previousContextDays?: DaySchedule[];
        generationSettings?: GenerationSettings;
        signal?: AbortSignal;
    }): AsyncGenerator<PlanGenerationStep> {
        const generationSeed = params.generationSeed ?? 0;
        const source = params.source ?? 'GENERATED';
        const absences = params.absences ?? ABSENCES;
        const previousContextDays = params.previousContextDays ?? [];
        const generationSettings = params.generationSettings ?? {
            previousContextDays: 14,
            enableDecisionLogs: true,
        };

        const dates = this.dateRangeService.getDatesBetween(
            params.range.startDate,
            params.range.endDate
        );

        const days: DaySchedule[] = [];
        const warnings: ScheduleWarning[] = [];
        const generationLogs: GenerationDecisionLog[] = [];

        this.pushGenerationLog(
            generationLogs,
            generationSettings,
            {
                date: params.range.startDate,
                decision: 'CONTEXT_LOADED',
                messages: [
                    `Caricati ${previousContextDays.length} giorni precedenti come contesto di generazione.`,
                ],
                contextPreviousDaysCount: previousContextDays.length,
            }
        );

        yield {
            type: 'STARTED',
            progress: 0,
            currentDate: dates[0],
            days: [],
        };

        await this.waitFrame();

        for (let dayIndex = 0; dayIndex < dates.length; dayIndex++) {
            if (params.signal?.aborted) {
                yield {
                    type: 'CANCELLED',
                    progress: this.calculateProgress(dayIndex, dates.length),
                    currentDate: dates[dayIndex],
                    days: [
                        ...days,
                    ],
                };

                return;
            }

            const date = dates[dayIndex];

            const day = this.generateDaySchedule({
                date,
                dayIndex,
                workers: params.workers,
                shifts: params.shifts,
                previousDays: [
                    ...previousContextDays,
                    ...days,
                ],
                generationSeed,
                absences,
                generationLogs,
                generationSettings,
            });

            warnings.push(...day.warnings);
            days.push(day);

            yield {
                type: 'DAY_GENERATED',
                progress: this.calculateProgress(dayIndex + 1, dates.length),
                currentDate: date,
                days: [
                    ...days,
                ],
            };

            await this.waitFrame();
        }

        const stats = this.workerStatsService.calculateStats(
            params.workers,
            days
        );

        const qualityWarnings = this.warningService.createQualityWarnings({
            range: params.range,
            workers: params.workers,
            days,
            stats,
        });

        warnings.push(...qualityWarnings);

        const plan: SchedulePlan = {
            range: params.range,
            days,
            warnings,
            stats,
            source,
            generatedAt: this.dateRangeService.nowIso(),
            generationLogs,
            generationSettings,
        };

        yield {
            type: 'COMPLETED',
            progress: 100,
            currentDate: dates[dates.length - 1],
            days: [
                ...days,
            ],
            plan,
        };
    }

    private generateDaySchedule(params: {
        date: string;
        dayIndex: number;
        workers: Worker[];
        shifts: ShiftDefinition[];
        previousDays: DaySchedule[];
        generationSeed: number;
        absences: WorkerAbsence[];
        generationLogs: GenerationDecisionLog[];
        generationSettings: GenerationSettings;
    }): DaySchedule {
        const assignments: AssignedShift[] = [];
        const warnings: ScheduleWarning[] = [];

        const figurativeAbsenceAssignments = this.createFigurativeAbsenceAssignments({
            date: params.date,
            workers: params.workers,
            absences: params.absences,
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
        absences: WorkerAbsence[];
        shift: ShiftDefinition;
        generationLogs: GenerationDecisionLog[];
        generationSettings: GenerationSettings;
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
                this.pushGenerationLog(
                    params.generationLogs,
                    params.generationSettings,
                    {
                        date: params.date,
                        shift: params.shift.type,
                        decision: 'SLOT_UNCOVERED',
                        slotIndex: index,
                        messages: [
                            `Nessun operatore disponibile per coprire lo slot ${index + 1} del turno ${params.shift.label}.`,
                        ],
                        contextPreviousDaysCount: params.previousDays.length,
                    }
                );
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
        absences: WorkerAbsence[];
        shift: ShiftDefinition;
        slotIndex: number;
        generationLogs: GenerationDecisionLog[];
        generationSettings: GenerationSettings;
    }): Worker | null {
        const checkedCandidates = params.workers.map((worker) => {
            const ruleCheck = this.shiftRulesService.checkWorkerAssignment({
                worker,
                date: params.date,
                shift: params.shift,
                previousDays: params.previousDays,
                currentDayAssignments: params.currentDayAssignments,
                absences: params.absences,
            });

            this.pushGenerationLog(
                params.generationLogs,
                params.generationSettings,
                {
                    date: params.date,
                    shift: params.shift.type,
                    workerId: worker.id,
                    workerName: worker.fullName || worker.name,
                    decision: ruleCheck.allowed
                        ? 'CANDIDATE_ALLOWED'
                        : 'CANDIDATE_REJECTED',
                    allowed: ruleCheck.allowed,
                    hardBlocked: ruleCheck.hardBlocked,
                    score: ruleCheck.score,
                    slotIndex: params.slotIndex,
                    rules: ruleCheck.violatedRules,
                    messages: ruleCheck.messages.length > 0
                        ? ruleCheck.messages
                        : [
                            ruleCheck.allowed
                                ? 'rispetta le regole principali per questo turno'
                                : 'non rispetta una o più regole del turno',
                        ],
                    contextPreviousDaysCount: params.previousDays.length,
                }
            );

            return {
                worker,
                ruleCheck,
            };
        });

        const candidates = checkedCandidates.filter((candidate) => {
            return candidate.ruleCheck.allowed;
        });

        if (candidates.length === 0) {
            return null;
        }

        const dateSeed = this.createDateSeed(params.date)
            + params.dayIndex
            + params.generationSeed
            + params.slotIndex;

        const winner = candidates
            .map((candidate, index) => {
                return {
                    worker: candidate.worker,
                    score: this.calculateWorkerScore(
                        candidate.worker,
                        params.previousDays,
                        dateSeed + index
                    ),
                };
            })
            .sort((a, b) => {
                return a.score - b.score;
            })[0];

        this.pushGenerationLog(
            params.generationLogs,
            params.generationSettings,
            {
                date: params.date,
                shift: params.shift.type,
                workerId: winner.worker.id,
                workerName: winner.worker.fullName || winner.worker.name,
                decision: 'ASSIGNED_AUTO',
                allowed: true,
                hardBlocked: false,
                finalScore: winner.score,
                slotIndex: params.slotIndex,
                source: 'AUTO',
                messages: [
                    `Assegnato automaticamente al turno ${params.shift.label} con punteggio ${winner.score}.`,
                ],
                contextPreviousDaysCount: params.previousDays.length,
            }
        );

        return winner.worker;
    }

    private findBestForcedWorker(params: {
        date: string;
        dayIndex: number;
        workers: Worker[];
        previousDays: DaySchedule[];
        currentDayAssignments: AssignedShift[];
        generationSeed: number;
        absences: WorkerAbsence[];
        shift: ShiftDefinition;
        slotIndex: number;
        generationLogs: GenerationDecisionLog[];
        generationSettings: GenerationSettings;
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
                    absences: params.absences,
                });

                const score =
                    ruleCheck.score +
                    this.calculateWorkerScore(
                        worker,
                        params.previousDays,
                        index + params.generationSeed
                    );

                this.pushGenerationLog(
                    params.generationLogs,
                    params.generationSettings,
                    {
                        date: params.date,
                        shift: params.shift.type,
                        workerId: worker.id,
                        workerName: worker.fullName || worker.name,
                        decision: ruleCheck.hardBlocked
                            ? 'CANDIDATE_FORCED_REJECTED'
                            : 'CANDIDATE_FORCED_ALLOWED',
                        allowed: !ruleCheck.hardBlocked,
                        hardBlocked: ruleCheck.hardBlocked,
                        score: ruleCheck.score,
                        finalScore: score,
                        slotIndex: params.slotIndex,
                        rules: ruleCheck.violatedRules,
                        messages: ruleCheck.messages.length > 0
                            ? ruleCheck.messages
                            : [
                                ruleCheck.hardBlocked
                                    ? 'ha vincoli bloccanti e non può essere usato nemmeno come forzatura'
                                    : 'non è il candidato ideale ma non ha vincoli bloccanti',
                            ],
                        contextPreviousDaysCount: params.previousDays.length,
                    }
                );

                return {
                    worker,
                    ruleCheck,
                    score,
                };
            })
            .filter((candidate) => {
                return !candidate.ruleCheck.hardBlocked;
            })
            .sort((a, b) => {
                return a.score - b.score;
            });

        const winner = candidates[0] ?? null;

        if (!winner) {
            return null;
        }

        this.pushGenerationLog(
            params.generationLogs,
            params.generationSettings,
            {
                date: params.date,
                shift: params.shift.type,
                workerId: winner.worker.id,
                workerName: winner.worker.fullName || winner.worker.name,
                decision: 'ASSIGNED_FORCED',
                allowed: true,
                hardBlocked: false,
                score: winner.ruleCheck.score,
                finalScore: winner.score,
                slotIndex: params.slotIndex,
                source: 'FORCED',
                rules: winner.ruleCheck.violatedRules,
                messages: winner.ruleCheck.messages.length > 0
                    ? winner.ruleCheck.messages
                    : [
                        `Assegnato forzatamente al turno ${params.shift.label}.`,
                    ],
                contextPreviousDaysCount: params.previousDays.length,
            }
        );

        return {
            worker: winner.worker,
            ruleCheck: winner.ruleCheck,
        };
    }

    private createAssignment(params: {
        date: string;
        shift: ShiftDefinition;
        worker: Worker;
        generationSeed: number;
        source: AssignedShift['source'];
        ruleCheck: RuleCheckResult;
    }): AssignedShift {
        const extraHours = params.source === 'FORCED'
            ? params.shift.hours
            : 0;

        return {
            id: `${params.date}_${params.shift.type}_${params.worker.id}_${params.generationSeed}`,
            date: params.date,
            shift: params.shift.type,
            workerId: params.worker.id,
            workerName: params.worker.name,
            hours: params.shift.hours,
            source: params.source,
            forcedReason: params.ruleCheck.messages.join(' | ') || undefined,
            violatedRules: [
                ...params.ruleCheck.violatedRules,
            ],
            extraHours,
        };
    }

    private createFigurativeAbsenceAssignments(params: {
        date: string;
        workers: Worker[];
        absences: WorkerAbsence[];
    }): AssignedShift[] {
        const assignments: AssignedShift[] = [];

        for (const worker of params.workers) {
            const absence = this.workerAbsenceService.getAbsenceForDate({
                workerId: worker.id,
                date: params.date,
                absences: params.absences,
            });

            if (!absence) {
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

        const status: DayScheduleIndicators['status'] = errorWarnings > 0 || uncoveredShifts > 0
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

    private pushGenerationLog(
        logs: GenerationDecisionLog[],
        settings: GenerationSettings,
        log: Omit<GenerationDecisionLog, 'id' | 'createdAt' | 'messages'> & {
            messages?: string[];
            rules?: AssignmentRuleCode[];
        }
    ): void {
        if (!settings.enableDecisionLogs) {
            return;
        }

        const entry: GenerationDecisionLog = {
            id: `${log.date}_${log.shift ?? 'NO_SHIFT'}_${log.workerId ?? 'NO_WORKER'}_${log.decision}_${logs.length}`,
            createdAt: this.dateRangeService.nowIso(),
            messages: log.messages ?? [],
            ...log,
        };

        logs.push(entry);
        this.writeDecisionLog(entry);
    }

    private writeDecisionLog(log: GenerationDecisionLog): void {
        const readableMessage = this.createReadableDecisionMessage(log);
        const isWarning =
            log.decision === 'CANDIDATE_REJECTED'
            || log.decision === 'CANDIDATE_FORCED_REJECTED'
            || log.decision === 'SLOT_UNCOVERED';

        this.logger.log({
            level: isWarning
                ? 'WARN'
                : 'INFO',
            category: this.mapDecisionToLogCategory(log),
            message: readableMessage,
            date: log.date,
            shift: log.shift,
            workerId: log.workerId,
            workerName: log.workerName,
            rules: log.rules,
            payload: {
                decision: log.decision,
                slotIndex: log.slotIndex,
                allowed: log.allowed,
                hardBlocked: log.hardBlocked,
                score: log.score,
                finalScore: log.finalScore,
                messages: log.messages,
                contextPreviousDaysCount: log.contextPreviousDaysCount,
            },
        });
    }

    private mapDecisionToLogCategory(log: GenerationDecisionLog) {
        if (log.decision === 'CONTEXT_LOADED') {
            return 'PERIOD_CONTEXT' as const;
        }

        if (
            log.decision === 'CANDIDATE_ALLOWED'
            || log.decision === 'CANDIDATE_REJECTED'
            || log.decision === 'CANDIDATE_FORCED_ALLOWED'
            || log.decision === 'CANDIDATE_FORCED_REJECTED'
        ) {
            return log.decision === 'CANDIDATE_REJECTED'
                || log.decision === 'CANDIDATE_FORCED_REJECTED'
                ? 'REJECTION' as const
                : 'RULE_CHECK' as const;
        }

        if (log.decision === 'ASSIGNED_AUTO') {
            return 'ASSIGNMENT' as const;
        }

        if (log.decision === 'ASSIGNED_FORCED') {
            return 'FORCED_ASSIGNMENT' as const;
        }

        return 'GENERATION' as const;
    }

    private createReadableDecisionMessage(log: GenerationDecisionLog): string {
        const dayPart = `Per il giorno ${log.date}`;
        const shiftPart = log.shift
            ? `, turno ${log.shift}`
            : '';
        const workerPart = log.workerName || log.workerId
            ? `, l'operatore ${log.workerName ?? log.workerId}`
            : '';

        const reasons = this.formatDecisionReasons(log);

        switch (log.decision) {
            case 'CONTEXT_LOADED':
                return `${dayPart}: caricati ${log.contextPreviousDaysCount ?? 0} giorni precedenti come contesto per evitare errori su consecutivi, notti e riposi.`;

            case 'CANDIDATE_ALLOWED':
                return `${dayPart}${shiftPart}${workerPart} è candidabile. ${reasons}`;

            case 'CANDIDATE_REJECTED':
                return `${dayPart}${shiftPart}${workerPart} è stato scartato perché ${reasons}`;

            case 'CANDIDATE_FORCED_ALLOWED':
                return `${dayPart}${shiftPart}${workerPart} non è ideale, ma può essere usato come forzatura. ${reasons}`;

            case 'CANDIDATE_FORCED_REJECTED':
                return `${dayPart}${shiftPart}${workerPart} è stato scartato anche come forzatura perché ${reasons}`;

            case 'ASSIGNED_AUTO':
                return `${dayPart}${shiftPart}${workerPart} è stato assegnato automaticamente perché risulta il candidato migliore${this.formatScore(log)}.`;

            case 'ASSIGNED_FORCED':
                return `${dayPart}${shiftPart}${workerPart} è stato assegnato forzatamente perché non c'erano candidati pienamente validi. ${reasons}`;

            case 'SLOT_UNCOVERED':
                return `${dayPart}${shiftPart}: lo slot ${this.formatSlot(log)} è rimasto scoperto perché nessun operatore disponibile rispettava le regole. ${reasons}`;

            default:
                return `${dayPart}${shiftPart}${workerPart}: decisione ${log.decision}. ${reasons}`;
        }
    }

    private formatDecisionReasons(log: GenerationDecisionLog): string {
        const messages = log.messages.filter((message) => {
            return !!message?.trim();
        });

        if (messages.length === 0) {
            return 'non sono presenti dettagli aggiuntivi.';
        }

        if (messages.length === 1) {
            return messages[0].endsWith('.')
                ? messages[0]
                : `${messages[0]}.`;
        }

        return messages
            .map((message, index) => {
                const normalized = message.endsWith('.')
                    ? message
                    : `${message}.`;

                return `${index + 1}) ${normalized}`;
            })
            .join(' ');
    }

    private formatScore(log: GenerationDecisionLog): string {
        if (log.finalScore === undefined && log.score === undefined) {
            return '';
        }

        return ` con punteggio ${log.finalScore ?? log.score}`;
    }

    private formatSlot(log: GenerationDecisionLog): string {
        if (log.slotIndex === undefined) {
            return 'richiesto';
        }

        return `${log.slotIndex + 1}`;
    }

    private calculateProgress(
        current: number,
        total: number
    ): number {
        if (total <= 0) {
            return 100;
        }

        return Math.min(
            100,
            Math.round((current / total) * 100)
        );
    }

    private waitFrame(): Promise<void> {
        return new Promise((resolve) => {
            if (typeof requestAnimationFrame === 'function') {
                requestAnimationFrame(() => resolve());
                return;
            }

            setTimeout(() => resolve(), 0);
        });
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
