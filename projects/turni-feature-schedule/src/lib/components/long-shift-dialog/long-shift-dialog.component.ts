import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AssignedShift, ShiftType } from '@turni/data-access';

export interface LongShiftDialogData {
    date: string;
    shift: ShiftType;
    leavingAssignment: AssignedShift;
    candidates: AssignedShift[];
}

export interface LongShiftDialogResult {
    longWorkerId: string;
    leaveTime: string;
    reason: 'PERMESSO' | 'USCITA_ANTICIPATA';
    note?: string;
}

@Component({
    standalone: false,
    selector: 'turni-long-shift-dialog',
    templateUrl: './long-shift-dialog.component.html',
    styleUrls: ['./long-shift-dialog.component.scss'],
})
export class LongShiftDialogComponent {
    result: LongShiftDialogResult = {
        longWorkerId: this.data.candidates[0]?.workerId ?? '',
        leaveTime: '',
        reason: 'PERMESSO',
        note: '',
    };

    constructor(
        private dialogRef: MatDialogRef<LongShiftDialogComponent, LongShiftDialogResult>,
        @Inject(MAT_DIALOG_DATA) public data: LongShiftDialogData
    ) {}

    confirm(): void {
        if (!this.result.longWorkerId || !this.result.leaveTime) return;
        this.dialogRef.close({ ...this.result });
    }

    cancel(): void {
        this.dialogRef.close();
    }
}
