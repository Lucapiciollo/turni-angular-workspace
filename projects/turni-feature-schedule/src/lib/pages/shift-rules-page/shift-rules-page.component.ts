import { Component, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import {
    ShiftDefinition,
    ShiftType,
    TurniFacade,
} from '@turni/data-access';

@Component({
    standalone: false,
    selector: 'turni-shift-rules-page',
    templateUrl: './shift-rules-page.component.html',
    styleUrls: ['./shift-rules-page.component.scss'],
})
export class ShiftRulesPageComponent implements OnInit {
    private readonly fb = inject(FormBuilder);

    readonly form = this.fb.nonNullable.group({
        shifts: this.fb.array([
            this.createShiftForm({
                type: 'MATTINA',
                label: 'Mattina',
                start: '06:00',
                end: '14:00',
                requiredWorkers: 6,
                hours: 8,
            }),
            this.createShiftForm({
                type: 'POMERIGGIO',
                label: 'Pomeriggio',
                start: '14:00',
                end: '22:00',
                requiredWorkers: 6,
                hours: 8,
            }),
            this.createShiftForm({
                type: 'NOTTE',
                label: 'Notte',
                start: '22:00',
                end: '06:00',
                requiredWorkers: 3,
                hours: 8,
            }),
        ]),
    });

    constructor(
        public turniFacade: TurniFacade
    ) {}

    ngOnInit(): void {
        this.turniFacade.init();
        this.patchFromStore();
    }

    get shiftsForm(): FormArray {
        return this.form.controls.shifts;
    }

    save(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const shifts = this.shiftsForm.controls.map((control) => {
            const value = control.getRawValue();

            return {
                type: value.type as ShiftType,
                label: value.label,
                start: value.start,
                end: value.end,
                requiredWorkers: Number(value.requiredWorkers),
                hours: Number(value.hours),
            };
        });

        this.turniFacade.saveShiftRules(shifts);
    }

    resetDefault(): void {
        this.form.controls.shifts.clear();

        this.getDefaultShifts().forEach((shift) => {
            this.form.controls.shifts.push(this.createShiftForm(shift));
        });
    }

    patchFromStore(): void {
        const shifts = this.turniFacade.shifts();

        if (!shifts.length) {
            return;
        }

        this.form.controls.shifts.clear();

        shifts.forEach((shift) => {
            this.form.controls.shifts.push(this.createShiftForm(shift));
        });
    }

    getShiftIcon(type: ShiftType): string {
        if (type === 'MATTINA') {
            return 'wb_sunny';
        }

        if (type === 'POMERIGGIO') {
            return 'light_mode';
        }

        return 'bedtime';
    }

    getTotalRequiredWorkers(): number {
        return this.shiftsForm.controls.reduce((total, control) => {
            return total + Number(control.get('requiredWorkers')?.value ?? 0);
        }, 0);
    }

    trackByIndex(index: number): number {
        return index;
    }

    private createShiftForm(shift: ShiftDefinition) {
        return this.fb.nonNullable.group({
            type: [shift.type, Validators.required],
            label: [shift.label, Validators.required],
            start: [shift.start, Validators.required],
            end: [shift.end, Validators.required],
            requiredWorkers: [
                shift.requiredWorkers,
                [
                    Validators.required,
                    Validators.min(0),
                ],
            ],
            hours: [
                shift.hours,
                [
                    Validators.required,
                    Validators.min(1),
                ],
            ],
        });
    }

    private getDefaultShifts(): ShiftDefinition[] {
        return [
            {
                type: 'MATTINA',
                label: 'Mattina',
                start: '06:00',
                end: '14:00',
                requiredWorkers: 6,
                hours: 8,
            },
            {
                type: 'POMERIGGIO',
                label: 'Pomeriggio',
                start: '14:00',
                end: '22:00',
                requiredWorkers: 6,
                hours: 8,
            },
            {
                type: 'NOTTE',
                label: 'Notte',
                start: '22:00',
                end: '06:00',
                requiredWorkers: 3,
                hours: 8,
            },
        ];
    }
}
