import { Component, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
    AssignedShift,
    DaySchedule,
    ShiftChangeMode,
    ShiftDefinition,
    ShiftType,
} from '@turni/data-access';

export interface ShiftChangeDialogData {
    date: string;
    assignment: AssignedShift;
    shifts: ShiftDefinition[];
    dayAssignments: AssignedShift[];
    days: DaySchedule[];
}

export interface ShiftSwapCandidate {
    assignment: AssignedShift;
    label: string;
}

export interface ShiftChangeDialogResult {
    mode: ShiftChangeMode;
    targetDate?: string;
    targetShift: ShiftType;
    targetWorkerId?: string;
    note?: string;
}

type UiShiftChangeMode =
    | 'SWAP_SAME_DAY'
    | 'MOVE_OTHER_DAY';

@Component({
    standalone: false,
    selector: 'turni-shift-change-dialog',
    templateUrl: './shift-change-dialog.component.html',
    styleUrls: ['./shift-change-dialog.component.scss'],
})
export class ShiftChangeDialogComponent {
    readonly modeControl = new FormControl<UiShiftChangeMode>('SWAP_SAME_DAY', {
        nonNullable: true,
        validators: [
            Validators.required,
        ],
    });

    readonly targetDateControl = new FormControl<string>('', {
        nonNullable: true,
    });

    readonly targetShiftControl = new FormControl<ShiftType | null>(null, {
        validators: [
            Validators.required,
        ],
    });

    readonly targetWorkerControl = new FormControl<string>('', {
        nonNullable: true,
        validators: [
            Validators.required,
        ],
    });

    readonly noteControl = new FormControl<string>('', {
        nonNullable: true,
    });

    readonly targetShifts: ShiftDefinition[];
    readonly allShifts: ShiftDefinition[];
    readonly targetDays: DaySchedule[];

    visibleShifts: ShiftDefinition[] = [];
    filteredSwapCandidates: ShiftSwapCandidate[] = [];

    constructor(
        private readonly dialogRef: MatDialogRef<ShiftChangeDialogComponent, ShiftChangeDialogResult>,
        @Inject(MAT_DIALOG_DATA) public data: ShiftChangeDialogData
    ) {
        this.targetShifts = this.data.shifts.filter((shift) => {
            return shift.type !== this.data.assignment.shift;
        });

        this.allShifts = [
            ...this.data.shifts,
        ];

        this.targetDays = this.data.days.filter((day) => {
            return day.date !== this.data.date;
        });

        this.visibleShifts = this.targetShifts;

        this.targetShiftControl.valueChanges.subscribe((targetShift) => {
            this.targetWorkerControl.reset('', {
                emitEvent: false,
            });

            this.updateFilteredSwapCandidates(targetShift);
        });

        this.modeControl.valueChanges.subscribe((mode) => {
            this.targetShiftControl.reset(null, {
                emitEvent: false,
            });

            this.targetWorkerControl.reset('', {
                emitEvent: false,
            });

            this.targetDateControl.reset('', {
                emitEvent: false,
            });

            this.filteredSwapCandidates = [];

            if (mode === 'SWAP_SAME_DAY') {
                this.visibleShifts = this.targetShifts;
                this.targetWorkerControl.addValidators(Validators.required);
                this.targetDateControl.clearValidators();
            } else {
                this.visibleShifts = this.allShifts;
                this.targetWorkerControl.clearValidators();
                this.targetDateControl.addValidators(Validators.required);
            }

            this.targetWorkerControl.updateValueAndValidity({
                emitEvent: false,
            });

            this.targetDateControl.updateValueAndValidity({
                emitEvent: false,
            });
        });
    }

    get isSwapMode(): boolean {
        return this.modeControl.value === 'SWAP_SAME_DAY';
    }

    get isOtherDayMode(): boolean {
        return this.modeControl.value === 'MOVE_OTHER_DAY';
    }

    confirm(): void {
        if (this.isOtherDayMode && this.targetDateControl.invalid) {
            this.targetDateControl.markAsTouched();
            return;
        }

        if (this.targetShiftControl.invalid || !this.targetShiftControl.value) {
            this.targetShiftControl.markAsTouched();
            return;
        }

        if (this.isSwapMode && this.targetWorkerControl.invalid) {
            this.targetWorkerControl.markAsTouched();
            return;
        }

        const targetDate = this.isOtherDayMode
            ? this.targetDateControl.value
            : this.data.date;

        if (this.isInvalidSameDateSameShift(targetDate, this.targetShiftControl.value)) {
            this.targetShiftControl.setErrors({
                sameShiftSameDay: true,
            });
            this.targetShiftControl.markAsTouched();
            return;
        }

        this.dialogRef.close({
            mode: this.isSwapMode
                ? 'SWAP_SAME_DAY'
                : 'MOVE_OTHER_DAY',
            targetDate: this.isOtherDayMode
                ? this.targetDateControl.value
                : undefined,
            targetShift: this.targetShiftControl.value,
            targetWorkerId: this.isSwapMode
                ? this.targetWorkerControl.value
                : undefined,
            note: this.noteControl.value?.trim() || undefined,
        });
    }

    cancel(): void {
        this.dialogRef.close();
    }

    trackShift(
        _index: number,
        shift: ShiftDefinition
    ): ShiftType {
        return shift.type;
    }

    trackCandidate(
        _index: number,
        candidate: ShiftSwapCandidate
    ): string {
        return candidate.assignment.id;
    }

    trackDay(
        _index: number,
        day: DaySchedule
    ): string {
        return day.date;
    }

    private updateFilteredSwapCandidates(targetShift: ShiftType | null): void {
        if (!targetShift || !this.isSwapMode) {
            this.filteredSwapCandidates = [];
            return;
        }

        this.filteredSwapCandidates = this.data.dayAssignments
            .filter((assignment) => {
                return assignment.isFigurative !== true
                    && assignment.workerId !== this.data.assignment.workerId
                    && assignment.shift === targetShift;
            })
            .map((assignment) => {
                const shift = this.data.shifts.find((item) => {
                    return item.type === assignment.shift;
                });

                return {
                    assignment,
                    label: `${assignment.workerName} · ${shift?.label ?? assignment.shift}`,
                };
            });
    }

    private isInvalidSameDateSameShift(
        targetDate: string,
        targetShift: ShiftType
    ): boolean {
        return targetDate === this.data.date
            && targetShift === this.data.assignment.shift;
    }
}
