import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import {
    TurniFacade,
    Worker,
    WorkerEditorDraft,
} from '@turni/data-access';

@Component({
    standalone: false,
    selector: 'turni-operators-page',
    templateUrl: './operators-page.component.html',
    styleUrls: ['./operators-page.component.scss'],
})
export class OperatorsPageComponent implements OnInit {
    private readonly fb = inject(FormBuilder);

    readonly selectedWorkerId = signal<string | null>(null);
    readonly searchText = signal('');

    readonly filteredWorkers = computed(() => {
        const search = this.searchText().trim().toLowerCase();

        return this.turniFacade.sortedWorkers().filter((worker) => {
            if (!search) {
                return true;
            }

            return [
                worker.fullName,
                worker.name,
                worker.role,
            ].filter(Boolean).join(' ').toLowerCase().includes(search);
        });
    });

    readonly form = this.fb.nonNullable.group({
        id: [''],
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        fullName: ['', Validators.required],
        color: ['#4f7cff', Validators.required],
        role: ['OSS'],
        enabled: [true],
        contractWeeklyHours: [38, [Validators.required, Validators.min(1)]],
        contractMonthlyHours: [168, [Validators.required, Validators.min(1)]],
        minMonthlyHours: [152, [Validators.min(0)]],
        maxMonthlyHours: [180, [Validators.min(1)]],
        partTime: [false],
        canWorkMorning: [true],
        canWorkAfternoon: [true],
        canWorkNight: [true],
        maxConsecutiveDays: [6, [Validators.required, Validators.min(1)]],
        maxConsecutiveMorningShifts: [5, [Validators.required, Validators.min(1)]],
        maxConsecutiveAfternoonShifts: [5, [Validators.required, Validators.min(1)]],
        maxConsecutiveNightShifts: [2, [Validators.required, Validators.min(1)]],
        maxNightShiftsPerWeek: [2, [Validators.required, Validators.min(0)]],
        maxNightShiftsPerMonth: [8, [Validators.required, Validators.min(0)]],
        restAfterNight: [true],
        requireAtLeastOneFreeWeekendPerMonth: [true],
    });

    constructor(
        public turniFacade: TurniFacade
    ) {}

    ngOnInit(): void {
        this.turniFacade.ensureInitialized();
        this.createNew();
    }

    createNew(): void {
        this.selectedWorkerId.set(null);

        this.form.reset({
            id: '',
            firstName: '',
            lastName: '',
            fullName: '',
            color: this.createRandomColor(),
            role: 'OSS',
            enabled: true,
            contractWeeklyHours: 38,
            contractMonthlyHours: 168,
            minMonthlyHours: 152,
            maxMonthlyHours: 180,
            partTime: false,
            canWorkMorning: true,
            canWorkAfternoon: true,
            canWorkNight: true,
            maxConsecutiveDays: 6,
            maxConsecutiveMorningShifts: 5,
            maxConsecutiveAfternoonShifts: 5,
            maxConsecutiveNightShifts: 2,
            maxNightShiftsPerWeek: 2,
            maxNightShiftsPerMonth: 8,
            restAfterNight: true,
            requireAtLeastOneFreeWeekendPerMonth: true,
        });
    }

    editWorker(worker: Worker): void {
        this.selectedWorkerId.set(worker.id);

        const nameParts = this.splitName(worker);

        this.form.patchValue({
            id: worker.id,
            firstName: worker.firstName || nameParts.firstName,
            lastName: worker.lastName || nameParts.lastName,
            fullName: worker.fullName || worker.name,
            color: worker.color || '#64748b',
            role: worker.role || 'OSS',
            enabled: worker.enabled !== false,
            contractWeeklyHours: worker.contract?.weeklyHours ?? 38,
            contractMonthlyHours: worker.contract?.monthlyHours ?? 168,
            minMonthlyHours: worker.contract?.minMonthlyHours ?? 152,
            maxMonthlyHours: worker.contract?.maxMonthlyHours ?? 180,
            partTime: worker.contract?.partTime ?? false,
            canWorkMorning: worker.rules?.canWorkMorning ?? true,
            canWorkAfternoon: worker.rules?.canWorkAfternoon ?? true,
            canWorkNight: worker.rules?.canWorkNight ?? true,
            maxConsecutiveDays: worker.rules?.maxConsecutiveDays ?? 6,
            maxConsecutiveMorningShifts: worker.rules?.maxConsecutiveMorningShifts ?? 5,
            maxConsecutiveAfternoonShifts: worker.rules?.maxConsecutiveAfternoonShifts ?? 5,
            maxConsecutiveNightShifts: worker.rules?.maxConsecutiveNightShifts ?? 2,
            maxNightShiftsPerWeek: worker.rules?.maxNightShiftsPerWeek ?? 2,
            maxNightShiftsPerMonth: worker.rules?.maxNightShiftsPerMonth ?? 8,
            restAfterNight: worker.rules?.restAfterNight ?? true,
            requireAtLeastOneFreeWeekendPerMonth: worker.rules?.requireAtLeastOneFreeWeekendPerMonth ?? true,
        });
    }

    saveWorker(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const value = this.form.getRawValue();
        const fullName = (value.fullName || `${value.firstName} ${value.lastName}`).trim();

        const draft: WorkerEditorDraft = {
            id: value.id || undefined,
            firstName: value.firstName.trim(),
            lastName: value.lastName.trim(),
            fullName,
            name: fullName,
            color: value.color,
            role: value.role || 'OSS',
            enabled: value.enabled,
            contract: {
                weeklyHours: value.contractWeeklyHours,
                monthlyHours: value.contractMonthlyHours,
                minMonthlyHours: value.minMonthlyHours ?? undefined,
                maxMonthlyHours: value.maxMonthlyHours ?? undefined,
                partTime: value.partTime,
            },
            rules: {
                canWorkMorning: value.canWorkMorning,
                canWorkAfternoon: value.canWorkAfternoon,
                canWorkNight: value.canWorkNight,
                maxConsecutiveDays: value.maxConsecutiveDays,
                maxConsecutiveMorningShifts: value.maxConsecutiveMorningShifts,
                maxConsecutiveAfternoonShifts: value.maxConsecutiveAfternoonShifts,
                maxConsecutiveNightShifts: value.maxConsecutiveNightShifts,
                maxNightShiftsPerWeek: value.maxNightShiftsPerWeek,
                maxNightShiftsPerMonth: value.maxNightShiftsPerMonth,
                restAfterNight: value.restAfterNight,
                requireAtLeastOneFreeWeekendPerMonth: value.requireAtLeastOneFreeWeekendPerMonth,
            },
        };

        this.turniFacade.upsertWorker(draft);

        if (!value.id) {
            this.createNew();
        }
    }

    deleteWorker(worker: Worker): void {
        const confirmed = confirm(`Eliminare ${worker.fullName || worker.name}?`);

        if (!confirmed) {
            return;
        }

        this.turniFacade.deleteWorker(worker.id);

        if (this.selectedWorkerId() === worker.id) {
            this.createNew();
        }
    }

    resetStorage(): void {
        const confirmed = confirm('Ripristinare il mock iniziale degli operatori? Le modifiche locali verranno perse.');

        if (!confirmed) {
            return;
        }

        this.turniFacade.resetWorkersStorage();
        this.createNew();
    }

    syncFullName(): void {
        const value = this.form.getRawValue();
        const fullName = `${value.firstName} ${value.lastName}`.trim();

        if (fullName) {
            this.form.patchValue({
                fullName,
            });
        }
    }

    trackByWorker(
        index: number,
        worker: Worker
    ): string {
        return worker.id;
    }

    private splitName(worker: Worker): {
        firstName: string;
        lastName: string;
    } {
        const fullName = worker.fullName || worker.name || '';
        const parts = fullName.trim().split(/\s+/);

        if (parts.length <= 1) {
            return {
                firstName: fullName,
                lastName: '',
            };
        }

        return {
            firstName: parts[0],
            lastName: parts.slice(1).join(' '),
        };
    }

    private createRandomColor(): string {
        const colors = [
            '#4f7cff',
            '#2f9e6d',
            '#d9892b',
            '#d95f5f',
            '#7c3aed',
            '#0ea5e9',
            '#14b8a6',
            '#f97316',
        ];

        return colors[Math.floor(Math.random() * colors.length)];
    }
}
