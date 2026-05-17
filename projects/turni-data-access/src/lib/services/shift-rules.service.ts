import { Injectable } from '@angular/core';

import {
    AssignedShift,
    AssignmentRuleCode,
    DaySchedule,
    RuleCheckResult,
    ShiftDefinition,
    Worker,
    WorkerAbsence,
} from '../models/turni.models';
import { WorkerAbsenceService } from './worker-absence.service';
import { WorkerStatsService } from './worker-stats.service';

@Injectable({
    providedIn: 'root',
})
export class ShiftRulesService {
    constructor(
        private workerStatsService: WorkerStatsService,
        private workerAbsenceService: WorkerAbsenceService
    ) {}

    canAssignWorker(params: {
        worker: Worker;
        date: string;
        shift: ShiftDefinition;
        previousDays: DaySchedule[];
        currentDayAssignments: AssignedShift[];
        absences: WorkerAbsence[];
    }): boolean {
        return this.checkWorkerAssignment(params).allowed;
    }

    checkWorkerAssignment(params: {
        worker: Worker;
        date: string;
        shift: ShiftDefinition;
        previousDays: DaySchedule[];
        currentDayAssignments: AssignedShift[];
        absences: WorkerAbsence[];
    }): RuleCheckResult {
        const violatedRules: AssignmentRuleCode[] = [];
        const messages: string[] = [];
        let score = 0;
        let hardBlocked = false;

        const {
            worker,
            date,
            shift,
            previousDays,
            currentDayAssignments,
            absences,
        } = params;

        if (worker.enabled === false) {
            violatedRules.push('WORKER_DISABLED');
            messages.push(`${worker.name} non è abilitato al servizio.`);
            score += 9999;
            hardBlocked = true;
        }

        const absence = this.workerAbsenceService.getAbsenceForDate({
            workerId: worker.id,
            date,
            absences,
        });

        if (absence?.type === 'MALATTIA') {
            violatedRules.push('WORKER_IN_SICK_LEAVE');
            messages.push(`${worker.name} è in malattia il ${date}.`);
            score += 9999;
            hardBlocked = true;
        }

        if (absence && absence.type !== 'MALATTIA') {
            violatedRules.push('WORKER_ABSENT');
            messages.push(
                `${worker.name} è assente per ${this.workerAbsenceService.getAbsenceLabel(absence.type)} il ${date}.`
            );
            score += 9999;
            hardBlocked = true;
        }

        if (!this.canWorkShift(worker, shift)) {
            violatedRules.push('CAN_WORK_SHIFT');
            messages.push(`${worker.name} non è abilitato al turno ${shift.label}.`);
            score += 9999;
            hardBlocked = true;
        }

        if (this.hasAlreadyAssignedToShift(worker.id, shift, currentDayAssignments)) {
            violatedRules.push('ALREADY_ASSIGNED_TO_SHIFT');
            messages.push(`${worker.name} è già assegnato a questo turno.`);
            score += 9999;
            hardBlocked = true;
        }

        if (this.hasAlreadyWorkedToday(worker.id, currentDayAssignments)) {
            violatedRules.push('ALREADY_WORKED_TODAY');
            messages.push(`${worker.name} ha già un turno assegnato nello stesso giorno.`);
            score += 9999;
            hardBlocked = true;
        }

        if (this.exceedsMonthlyHours(worker, shift, previousDays)) {
            violatedRules.push('MAX_MONTHLY_HOURS');
            messages.push(`${worker.name} supera le ore contrattuali mensili.`);
            score += 80;
        }

        if (this.exceedsMaxNightShifts(worker, shift, previousDays)) {
            violatedRules.push('MAX_NIGHT_SHIFTS_MONTH');
            messages.push(`${worker.name} supera il limite mensile di notti.`);
            score += 55;
        }

        if (this.exceedsMaxNightShiftsPerWeek(worker, shift, date, previousDays)) {
            violatedRules.push('MAX_NIGHT_SHIFTS_WEEK');
            messages.push(`${worker.name} supera il limite settimanale di notti.`);
            score += 60;
        }

        if (this.violatesConsecutiveDays(worker, date, previousDays)) {
            violatedRules.push('MAX_CONSECUTIVE_DAYS');
            messages.push(`${worker.name} supera i giorni consecutivi consentiti.`);
            score += 45;
        }

        if (this.violatesConsecutiveShift(worker, date, shift, previousDays)) {
            violatedRules.push('MAX_CONSECUTIVE_SHIFT');
            messages.push(`${worker.name} supera il limite consecutivo per ${shift.label}.`);
            score += 45;
        }

        if (this.violatesRestAfterNight(worker, date, previousDays)) {
            violatedRules.push('REST_AFTER_NIGHT');
            messages.push(`${worker.name} dovrebbe riposare dopo un turno di notte.`);
            score += 70;
        }

        return {
            allowed: violatedRules.length === 0,
            hardBlocked,
            score,
            violatedRules,
            messages,
        };
    }

    private canWorkShift(
        worker: Worker,
        shift: ShiftDefinition
    ): boolean {
        if (shift.type === 'MATTINA') {
            return worker.rules?.canWorkMorning ?? true;
        }

        if (shift.type === 'POMERIGGIO') {
            return worker.rules?.canWorkAfternoon ?? true;
        }

        if (shift.type === 'NOTTE') {
            return worker.rules?.canWorkNight ?? true;
        }

        return true;
    }

    private hasAlreadyAssignedToShift(
        workerId: string,
        shift: ShiftDefinition,
        currentDayAssignments: AssignedShift[]
    ): boolean {
        return currentDayAssignments.some((assignment) => {
            return assignment.workerId === workerId
                && assignment.shift === shift.type;
        });
    }

    private hasAlreadyWorkedToday(
        workerId: string,
        currentDayAssignments: AssignedShift[]
    ): boolean {
        return currentDayAssignments.some((assignment) => {
            return assignment.workerId === workerId;
        });
    }

    private exceedsMonthlyHours(
        worker: Worker,
        shift: ShiftDefinition,
        previousDays: DaySchedule[]
    ): boolean {
        const maxMonthlyHours = worker.contract?.maxMonthlyHours
            ?? worker.contract?.monthlyHours;

        if (!maxMonthlyHours) {
            return false;
        }

        const currentHours = this.workerStatsService.countWorkerHours(
            previousDays,
            worker.id
        );

        return currentHours + shift.hours > maxMonthlyHours;
    }

    private exceedsMaxNightShifts(
        worker: Worker,
        shift: ShiftDefinition,
        previousDays: DaySchedule[]
    ): boolean {
        if (shift.type !== 'NOTTE') {
            return false;
        }

        const maxNightShifts = worker.rules?.maxNightShiftsPerMonth;

        if (maxNightShifts === undefined) {
            return false;
        }

        const currentNightCount = this.workerStatsService.countWorkerShift(
            previousDays,
            worker.id,
            'NOTTE'
        );

        return currentNightCount + 1 > maxNightShifts;
    }

    private exceedsMaxNightShiftsPerWeek(
        worker: Worker,
        shift: ShiftDefinition,
        date: string,
        previousDays: DaySchedule[]
    ): boolean {
        if (shift.type !== 'NOTTE') {
            return false;
        }

        const maxNightShiftsPerWeek = worker.rules?.maxNightShiftsPerWeek;

        if (maxNightShiftsPerWeek === undefined) {
            return false;
        }

        const currentWeekNightCount =
            this.workerStatsService.countWorkerShiftInSameIsoWeek(
                previousDays,
                worker.id,
                'NOTTE',
                date
            );

        return currentWeekNightCount + 1 > maxNightShiftsPerWeek;
    }

    private violatesConsecutiveDays(
        worker: Worker,
        date: string,
        previousDays: DaySchedule[]
    ): boolean {
        const maxConsecutiveDays = worker.rules?.maxConsecutiveDays;

        if (!maxConsecutiveDays) {
            return false;
        }

        const currentConsecutiveDays =
            this.workerStatsService.countConsecutiveWorkedDaysBeforeDate(
                previousDays,
                worker.id,
                date
            );

        return currentConsecutiveDays + 1 > maxConsecutiveDays;
    }

    private violatesConsecutiveShift(
        worker: Worker,
        date: string,
        shift: ShiftDefinition,
        previousDays: DaySchedule[]
    ): boolean {
        const max = this.getMaxConsecutiveShift(worker, shift.type);

        if (!max) {
            return false;
        }

        const currentConsecutiveShift =
            this.workerStatsService.countConsecutiveShiftBeforeDate(
                previousDays,
                worker.id,
                date,
                shift.type
            );

        return currentConsecutiveShift + 1 > max;
    }

    private violatesRestAfterNight(
        worker: Worker,
        date: string,
        previousDays: DaySchedule[]
    ): boolean {
        const restAfterNight = worker.rules?.restAfterNight ?? true;

        if (!restAfterNight) {
            return false;
        }

        const previousDay = [...previousDays]
            .sort((a, b) => {
                return b.date.localeCompare(a.date);
            })
            .find((day) => {
                return day.date < date;
            });

        if (!previousDay) {
            return false;
        }

        return previousDay.assignments.some((assignment) => {
            return assignment.workerId === worker.id
                && assignment.shift === 'NOTTE';
        });
    }

    private getMaxConsecutiveShift(
        worker: Worker,
        shiftType: ShiftDefinition['type']
    ): number | undefined {
        if (shiftType === 'MATTINA') {
            return worker.rules?.maxConsecutiveMorningShifts;
        }

        if (shiftType === 'POMERIGGIO') {
            return worker.rules?.maxConsecutiveAfternoonShifts;
        }

        if (shiftType === 'NOTTE') {
            return worker.rules?.maxConsecutiveNightShifts;
        }

        return undefined;
    }
}
