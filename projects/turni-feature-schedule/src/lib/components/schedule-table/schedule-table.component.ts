import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
    AssignedShift,
    DaySchedule,
    ShiftDefinition,
    ShiftType,
    Worker,
} from '@turni/data-access';

@Component({
    standalone: false,
    selector: 'turni-schedule-table',
    templateUrl: './schedule-table.component.html',
    styleUrls: ['./schedule-table.component.scss'],
})
export class ScheduleTableComponent {
    @Input() days: DaySchedule[] = [];
    @Input() shifts: ShiftDefinition[] = [];
    @Input() workers: Worker[] = [];
    @Input() isPastRange = false;

    @Input() getAssignmentsByShiftFn!: (
        day: DaySchedule,
        shift: ShiftType
    ) => AssignedShift[];

    @Input() getWorkerFn!: (
        workerId: string
    ) => Worker | undefined;

    @Input() getFigurativeAbsencesByDayFn?: (
        day: DaySchedule
    ) => AssignedShift[];

    @Output() markWorkerSick = new EventEmitter<AssignedShift>();
    @Output() requestLongShift = new EventEmitter<{ day: DaySchedule; assignment: AssignedShift }>();
    @Output() requestShiftChange = new EventEmitter<{ day: DaySchedule; assignment: AssignedShift }>();
    @Output() openStatsDetail = new EventEmitter<AssignedShift>();
    @Output() openWarningsDetail = new EventEmitter<AssignedShift>();
    @Output() addManualAssignment = new EventEmitter<{ day: DaySchedule; shift: ShiftDefinition }>();

    getAssignmentsByShift(
        day: DaySchedule,
        shift: ShiftType
    ): AssignedShift[] {
        if (!this.getAssignmentsByShiftFn) {
            return [];
        }

        return this.getAssignmentsByShiftFn(day, shift);
    }

    getFigurativeAbsencesByDay(day: DaySchedule): AssignedShift[] {
        if (!this.getFigurativeAbsencesByDayFn) {
            return day.assignments.filter((assignment) => {
                return assignment.isFigurative === true;
            });
        }

        return this.getFigurativeAbsencesByDayFn(day);
    }

    getWorker(workerId: string): Worker | undefined {
        if (!this.getWorkerFn) {
            return undefined;
        }

        return this.getWorkerFn(workerId);
    }

    getShiftIcon(shift: ShiftType): string {
        if (shift === 'MATTINA') {
            return 'wb_sunny';
        }

        if (shift === 'POMERIGGIO') {
            return 'light_mode';
        }

        return 'bedtime';
    }

    getCoverageTooltip(
        assignments: AssignedShift[],
        shift: ShiftDefinition
    ): string {
        const forcedCount = assignments.filter((assignment) => {
            return assignment.source === 'FORCED';
        }).length;

        const manualCount = assignments.filter((assignment) => {
            return assignment.source === 'MANUAL';
        }).length;

        return [
            `${assignments.length}/${shift.requiredWorkers} operatori assegnati.`,
            `Forzati: ${forcedCount}.`,
            `Manuali: ${manualCount}.`,
        ].join(' ');
    }

    getDayIndicatorTooltip(day: DaySchedule): string {
        const indicators = day.indicators;

        return [
            `Stato giorno: ${indicators.status}.`,
            `Warning: ${indicators.totalWarnings}.`,
            `Turni scoperti: ${indicators.uncoveredShifts}.`,
            `Forzature: ${indicators.forcedAssignments}.`,
            `Assenti: ${indicators.absentWorkers}.`,
            `Malattia: ${indicators.sickWorkers}.`,
        ].join(' ');
    }

    getDayIndicatorIcon(day: DaySchedule): string {
        if (day.indicators.status === 'OK') {
            return 'check_circle';
        }

        if (day.indicators.status === 'ERROR') {
            return 'error';
        }

        return 'warning';
    }

    isShiftCovered(
        assignments: AssignedShift[],
        shift: ShiftDefinition
    ): boolean {
        return assignments.length >= shift.requiredWorkers;
    }

    hasForcedAssignments(assignments: AssignedShift[]): boolean {
        return assignments.some((assignment) => {
            return assignment.source === 'FORCED';
        });
    }

    trackByDay(
        index: number,
        day: DaySchedule
    ): string {
        return day.date;
    }

    trackByShift(
        index: number,
        shift: ShiftDefinition
    ): ShiftType {
        return shift.type;
    }

    trackByAssignment(
        index: number,
        assignment: AssignedShift
    ): string {
        return assignment.id;
    }
}
