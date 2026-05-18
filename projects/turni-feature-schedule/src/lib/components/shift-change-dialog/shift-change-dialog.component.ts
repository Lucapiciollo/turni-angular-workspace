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

@Component({
    standalone: false,
    selector: 'turni-shift-change-dialog',
    templateUrl: './shift-change-dialog.component.html',
    styleUrls: ['./shift-change-dialog.component.scss'],
})
export class ShiftChangeDialogComponent {
    readonly modeControl = new FormControl<ShiftChangeMode>('MOVE_SAME_DAY', {
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
    });

    readonly noteControl = new FormControl<string>('', {
        nonNullable: true,
    });

    readonly targetShifts = this.data.shifts.filter((shift) => {
        return shift.type !== this.data.assignment.shift;
    });

    readonly allShifts = this.data.shifts;

    readonly targetDays = this.data.days.filter((day) => {
        return day.date !== this.data.date;
    });

    readonly swapCandidates: ShiftSwapCandidate[] = this.data.dayAssignments
        .filter((assignment) => {
            return assignment.isFigurative !== true
                && assignment.workerId !== this.data.assignment.workerId;
        })
        .map((assignment) => {
            const shift = this.data.shifts.find((item) => item.type === assignment.shift);

            return {
                assignment,
                label: `${assignment.workerName} · ${shift?.label ?? assignment.shift}`,
            };
        });

    constructor(
        private readonly dialogRef: MatDialogRef<ShiftChangeDialogComponent, ShiftChangeDialogResult>,
        @Inject(MAT_DIALOG_DATA) public data: ShiftChangeDialogData
    ) {
        this.targetWorkerControl.valueChanges.subscribe((workerId) => {
            if (this.modeControl.value !== 'SWAP_SAME_DAY') {
                return;
            }

            const candidate = this.swapCandidates.find((item) => {
                return item.assignment.workerId === workerId;
            });

            if (candidate) {
                this.targetShiftControl.setValue(candidate.assignment.shift);
            }
        });

        this.modeControl.valueChanges.subscribe((mode) => {
            this.targetShiftControl.reset();
            this.targetWorkerControl.reset('');
            this.targetDateControl.reset('');

            if (mode === 'SWAP_SAME_DAY') {
                this.targetWorkerControl.addValidators(Validators.required);
                this.targetDateControl.clearValidators();
            } else if (mode === 'MOVE_OTHER_DAY') {
                this.targetDateControl.addValidators(Validators.required);
                this.targetWorkerControl.clearValidators();
            } else {
                this.targetWorkerControl.clearValidators();
                this.targetDateControl.clearValidators();
            }

            this.targetWorkerControl.updateValueAndValidity();
            this.targetDateControl.updateValueAndValidity();
        });
    }

    get isSwapMode(): boolean {
        return this.modeControl.value === 'SWAP_SAME_DAY';
    }

    get isOtherDayMode(): boolean {
        return this.modeControl.value === 'MOVE_OTHER_DAY';
    }

    get visibleShifts(): ShiftDefinition[] {
        return this.isOtherDayMode
            ? this.allShifts
            : this.targetShifts;
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

        this.dialogRef.close({
            mode: this.modeControl.value,
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
}
