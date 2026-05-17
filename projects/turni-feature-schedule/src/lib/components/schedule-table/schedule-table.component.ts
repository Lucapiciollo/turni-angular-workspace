import { Component, Input } from '@angular/core';
import {
    AssignedShift,
    DaySchedule,
    ShiftDefinition,
    ShiftType,
    Worker,
} from '@turni/data-access';

@Component({
    selector: 'turni-schedule-table',
    templateUrl: './schedule-table.component.html',
    styleUrls: ['./schedule-table.component.scss'],
})
export class ScheduleTableComponent {
    @Input() days: DaySchedule[] = [];
    @Input() shifts: ShiftDefinition[] = [];
    @Input() workers: Worker[] = [];

    @Input() getAssignmentsByShiftFn!: (
        day: DaySchedule,
        shift: ShiftType
    ) => AssignedShift[];

    @Input() getWorkerFn!: (
        workerId: string
    ) => Worker | undefined;

    getAssignmentsByShift(
        day: DaySchedule,
        shift: ShiftType
    ): AssignedShift[] {
        return this.getAssignmentsByShiftFn(day, shift);
    }

    getWorker(workerId: string): Worker | undefined {
        return this.getWorkerFn(workerId);
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
    ): string {
        return shift.type;
    }

    trackByAssignment(
        index: number,
        assignment: AssignedShift
    ): string {
        return assignment.id;
    }
}
