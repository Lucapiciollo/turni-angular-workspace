import { Component, Input } from '@angular/core';
import { Worker, WorkerStats } from '@turni/data-access';

@Component({
    standalone: false,
    selector: 'turni-operator-stats-card',
    templateUrl: './operator-stats-card.component.html',
    styleUrls: ['./operator-stats-card.component.scss'],
})
export class OperatorStatsCardComponent {
    @Input({ required: true }) stat!: WorkerStats;
    @Input() worker?: Worker;

    isUnderMinHours(): boolean {
        if (this.stat.minMonthlyHours === undefined) {
            return false;
        }

        return this.stat.totalHours < this.stat.minMonthlyHours;
    }

    isOverMaxHours(): boolean {
        if (this.stat.maxMonthlyHours === undefined) {
            return this.stat.totalHours > this.stat.contractMonthlyHours;
        }

        return this.stat.totalHours > this.stat.maxMonthlyHours;
    }

    isHoursOk(): boolean {
        return !this.isUnderMinHours() && !this.isOverMaxHours();
    }

    isMorningConsecutiveOk(): boolean {
        const max = this.worker?.rules?.maxConsecutiveMorningShifts;

        if (max === undefined) {
            return true;
        }

        return this.stat.maxConsecutiveMorningShiftsReached <= max;
    }

    isAfternoonConsecutiveOk(): boolean {
        const max = this.worker?.rules?.maxConsecutiveAfternoonShifts;

        if (max === undefined) {
            return true;
        }

        return this.stat.maxConsecutiveAfternoonShiftsReached <= max;
    }

    isNightOk(): boolean {
        const maxMonth = this.worker?.rules?.maxNightShiftsPerMonth;
        const maxWeek = this.worker?.rules?.maxNightShiftsPerWeek;
        const maxConsecutive = this.worker?.rules?.maxConsecutiveNightShifts;

        const monthOk = maxMonth === undefined || this.stat.nightCount <= maxMonth;
        const weekOk = maxWeek === undefined || this.stat.maxNightShiftsInWeek <= maxWeek;
        const consecutiveOk = maxConsecutive === undefined
            || this.stat.maxConsecutiveNightShiftsReached <= maxConsecutive;

        return monthOk && weekOk && consecutiveOk;
    }

    getHoursTooltip(): string {
        if (this.isOverMaxHours()) {
            const max = this.stat.maxMonthlyHours ?? this.stat.contractMonthlyHours;

            return `Ore oltre il massimo: ${this.stat.totalHours}/${max}.`;
        }

        if (this.isUnderMinHours()) {
            return `Ore sotto il minimo: ${this.stat.totalHours}/${this.stat.minMonthlyHours}.`;
        }

        return `Ore corrette: ${this.stat.totalHours}/${this.stat.contractMonthlyHours}.`;
    }

    getMorningTooltip(): string {
        const max = this.worker?.rules?.maxConsecutiveMorningShifts;

        if (max === undefined) {
            return `Mattine totali: ${this.stat.morningCount}.`;
        }

        return `Mattine totali: ${this.stat.morningCount}. Max consecutivo: ${this.stat.maxConsecutiveMorningShiftsReached}/${max}.`;
    }

    getAfternoonTooltip(): string {
        const max = this.worker?.rules?.maxConsecutiveAfternoonShifts;

        if (max === undefined) {
            return `Pomeriggi totali: ${this.stat.afternoonCount}.`;
        }

        return `Pomeriggi totali: ${this.stat.afternoonCount}. Max consecutivo: ${this.stat.maxConsecutiveAfternoonShiftsReached}/${max}.`;
    }

    getNightTooltip(): string {
        const maxMonth = this.worker?.rules?.maxNightShiftsPerMonth;
        const maxWeek = this.worker?.rules?.maxNightShiftsPerWeek;
        const maxConsecutive = this.worker?.rules?.maxConsecutiveNightShifts;

        return [
            `Notti totali: ${this.stat.nightCount}.`,
            `Max consecutive: ${this.stat.maxConsecutiveNightShiftsReached}/${maxConsecutive ?? 'nessun limite'}.`,
            `Max settimana: ${this.stat.maxNightShiftsInWeek}/${maxWeek ?? 'nessun limite'}.`,
            `Max mese: ${maxMonth ?? 'nessun limite'}.`,
        ].join(' ');
    }

    getFreeWeekendTooltip(): string {
        if (this.stat.freeWeekendCount < 1) {
            return 'Nessun weekend libero nel range corrente.';
        }

        return `Weekend liberi: ${this.stat.freeWeekendCount}.`;
    }

    getForcedTooltip(): string {
        if (this.stat.forcedAssignmentsCount === 0) {
            return 'Nessun turno forzato.';
        }

        return `Turni forzati: ${this.stat.forcedAssignmentsCount}.`;
    }

    getExtraTooltip(): string {
        if (this.stat.extraHours === 0) {
            return 'Nessuna ora extra.';
        }

        return `Ore extra/forzate: ${this.stat.extraHours}.`;
    }
}
