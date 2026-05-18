import { Component, Input, OnChanges } from '@angular/core';
import {
    AssignedShift,
    DaySchedule,
    ShiftDefinition,
    Worker,
} from '@turni/data-access';

export interface ScheduleGridColumn {
    key: string;
    date: string;
    dayLabel: string;
    shiftType: ShiftDefinition['type'];
    shiftLabel: string;
}

export interface ScheduleGridRow {
    worker: Worker;
    compactName: string;
    initials: string;
    cells: ScheduleGridCell[];
}

export interface ScheduleGridCell {
    key: string;
    value: string;
    cssClass: string;
    tooltip: string;
}

@Component({
    standalone: false,
    selector: 'turni-schedule-grid-view',
    templateUrl: './schedule-grid-view.component.html',
    styleUrls: ['./schedule-grid-view.component.scss'],
})
export class ScheduleGridViewComponent implements OnChanges {
    @Input() days: DaySchedule[] = [];
    @Input() shifts: ShiftDefinition[] = [];
    @Input() workers: Worker[] = [];

    columns: ScheduleGridColumn[] = [];
    rows: ScheduleGridRow[] = [];

    ngOnChanges(): void {
        this.columns = this.buildColumns();
        this.rows = this.buildRows();
    }

    get hasData(): boolean {
        return this.days.length > 0
            && this.shifts.length > 0
            && this.rows.length > 0;
    }

    getShiftShortLabel(shift: ShiftDefinition): string {
        if (shift.type === 'MATTINA') {
            return 'M';
        }

        if (shift.type === 'POMERIGGIO') {
            return 'P';
        }

        if (shift.type === 'NOTTE') {
            return 'N';
        }

        return shift.label.slice(0, 1).toUpperCase();
    }

    trackColumn(_index: number, column: ScheduleGridColumn): string {
        return column.key;
    }

    trackDay(_index: number, day: DaySchedule): string {
        return day.date;
    }

    trackShift(_index: number, shift: ShiftDefinition): string {
        return shift.type;
    }

    trackRow(_index: number, row: ScheduleGridRow): string {
        return row.worker.id;
    }

    trackCell(_index: number, cell: ScheduleGridCell): string {
        return cell.key;
    }

    private buildColumns(): ScheduleGridColumn[] {
        return this.days.flatMap((day) => {
            return this.shifts.map((shift) => {
                return {
                    key: this.createKey(day.date, shift.type),
                    date: day.date,
                    dayLabel: day.label,
                    shiftType: shift.type,
                    shiftLabel: shift.label,
                };
            });
        });
    }

    private buildRows(): ScheduleGridRow[] {
        return this.workers
            .filter((worker) => worker.enabled !== false)
            .map((worker) => {
                return {
                    worker,
                    compactName: this.getCompactName(worker),
                    initials: this.getInitials(worker),
                    cells: this.columns.map((column) => {
                        return {
                            key: `${worker.id}_${column.key}`,
                            ...this.resolveCell(worker, column),
                        };
                    }),
                };
            })
            .sort((a, b) => {
                return a.compactName.localeCompare(b.compactName);
            });
    }

    private createKey(
        date: string,
        shiftType: ShiftDefinition['type']
    ): string {
        return `${date}_${shiftType}`;
    }

    private getInitials(worker: Worker): string {
        const fullName = worker.fullName || worker.name || '-';
        const parts = fullName.trim().split(/\s+/);

        if (parts.length === 1) {
            return parts[0].slice(0, 2).toUpperCase();
        }

        return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
    }

    private getCompactName(worker: Worker): string {
        const fullName = worker.fullName || worker.name || '-';
        const parts = fullName.trim().split(/\s+/);

        if (parts.length <= 1) {
            return fullName;
        }

        const firstName = parts[0];
        const lastName = parts.slice(1).join(' ');

        return `${lastName} ${firstName.charAt(0)}.`;
    }

    private resolveCell(
        worker: Worker,
        column: ScheduleGridColumn
    ): Omit<ScheduleGridCell, 'key'> {
        const day = this.days.find((item) => item.date === column.date);

        if (!day) {
            return this.emptyCell();
        }

        const realAssignment = day.assignments.find((assignment) => {
            return assignment.workerId === worker.id
                && assignment.shift === column.shiftType
                && assignment.isFigurative !== true;
        });

        if (realAssignment) {
            return this.realAssignmentCell(realAssignment);
        }

        const sameShiftFigurative = day.assignments.find((assignment) => {
            return assignment.workerId === worker.id
                && assignment.shift === column.shiftType
                && assignment.isFigurative === true;
        });

        if (sameShiftFigurative) {
            return this.figurativeCell(sameShiftFigurative);
        }

        const fullDayFigurative = day.assignments.find((assignment) => {
            return assignment.workerId === worker.id
                && assignment.isFigurative === true
                && (
                    assignment.absenceType === 'FERIE'
                    || assignment.absenceType === 'MALATTIA'
                    || assignment.absenceType === 'RIPOSO'
                );
        });

        if (fullDayFigurative) {
            return this.figurativeCell(fullDayFigurative);
        }

        return this.emptyCell();
    }

    private realAssignmentCell(assignment: AssignedShift): Omit<ScheduleGridCell, 'key'> {
        if (assignment.manualReason === 'SHIFT_SWAP') {
            return {
                value: 'S',
                cssClass: 'manual',
                tooltip: `Scambio turno manuale${assignment.changedFromShift ? ` da ${assignment.changedFromShift}` : ''}`,
            };
        }

        if (assignment.manualReason === 'SHIFT_CHANGE') {
            return {
                value: 'C',
                cssClass: 'manual',
                tooltip: `Cambio turno manuale${assignment.changedFromDate ? ` dal ${assignment.changedFromDate}` : ''}`,
            };
        }

        if (assignment.manualReason === 'MANUAL_INSERT') {
            return {
                value: '+',
                cssClass: 'manual',
                tooltip: assignment.forcedReason || 'Inserimento manuale',
            };
        }

        if (assignment.source === 'FORCED') {
            return {
                value: 'X',
                cssClass: 'forced',
                tooltip: assignment.forcedReason || 'Turno forzato',
            };
        }

        return {
            value: 'X',
            cssClass: 'worked',
            tooltip: 'In turno',
        };
    }

    private figurativeCell(assignment: AssignedShift): Omit<ScheduleGridCell, 'key'> {
        if (assignment.absenceType === 'FERIE') {
            return {
                value: 'F',
                cssClass: 'holiday',
                tooltip: assignment.absenceNote || 'Ferie',
            };
        }

        if (assignment.absenceType === 'MALATTIA') {
            return {
                value: 'M',
                cssClass: 'sick',
                tooltip: assignment.absenceNote || 'Malattia',
            };
        }

        if (assignment.absenceType === 'PERMESSO') {
            return {
                value: 'P',
                cssClass: 'permit',
                tooltip: assignment.absenceNote || 'Permesso',
            };
        }

        if (assignment.absenceType === 'RIPOSO') {
            return {
                value: 'R',
                cssClass: 'rest',
                tooltip: assignment.absenceNote || 'Riposo',
            };
        }

        return this.emptyCell();
    }

    private emptyCell(): Omit<ScheduleGridCell, 'key'> {
        return {
            value: '',
            cssClass: 'empty',
            tooltip: '',
        };
    }
}
