import { Component, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
    ShiftDefinition,
    Worker,
} from '@turni/data-access';

export interface ManualAssignmentDialogData {
    date: string;
    shift: ShiftDefinition;
    assignedWorkerIds: string[];
    workers: Worker[];
}

export interface ManualAssignmentDialogResult {
    workerId: string;
    note?: string;
}

@Component({
    standalone: false,
    selector: 'turni-manual-assignment-dialog',
    templateUrl: './manual-assignment-dialog.component.html',
    styleUrls: ['./manual-assignment-dialog.component.scss'],
})
export class ManualAssignmentDialogComponent {
    readonly workerControl = new FormControl<string>('', {
        nonNullable: true,
        validators: [
            Validators.required,
        ],
    });

    readonly noteControl = new FormControl<string>('', {
        nonNullable: true,
    });

    readonly availableWorkers: Worker[] = this.data.workers
        .filter((worker) => {
            return worker.enabled !== false
                && !this.data.assignedWorkerIds.includes(worker.id);
        })
        .sort((a, b) => {
            return (a.fullName || a.name).localeCompare(b.fullName || b.name);
        });

    constructor(
        private readonly dialogRef: MatDialogRef<ManualAssignmentDialogComponent, ManualAssignmentDialogResult>,
        @Inject(MAT_DIALOG_DATA) public data: ManualAssignmentDialogData
    ) {}

    confirm(): void {
        if (this.workerControl.invalid) {
            this.workerControl.markAsTouched();
            return;
        }

        this.dialogRef.close({
            workerId: this.workerControl.value,
            note: this.noteControl.value?.trim() || undefined,
        });
    }

    cancel(): void {
        this.dialogRef.close();
    }
}
