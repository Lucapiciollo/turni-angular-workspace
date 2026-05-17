import { Injectable, computed, signal } from '@angular/core';

import { SHIFTS, WORKERS } from '../data/mock-turni.data';
import {
    AssignedShift,
    DateRange,
    DaySchedule,
    RangeMode,
    SchedulePlan,
    SchedulePlanSource,
    ShiftDefinition,
    ShiftType,
    Worker,
} from '../models/turni.models';
import { DateRangeService } from './date-range.service';
import { ScheduleCacheService } from './schedule-cache.service';
import { TurniGeneratorService } from './turni-generator.service';

@Injectable({
    providedIn: 'root',
})
export class ScheduleStateService {
    readonly workers = signal<Worker[]>([...WORKERS]);
    readonly shifts = signal<ShiftDefinition[]>([...SHIFTS]);

    readonly mode = signal<RangeMode>('MONTH');
    readonly range = signal<DateRange | null>(null);
    readonly plan = signal<SchedulePlan | null>(null);
    readonly generationSeed = signal(0);
    readonly lastSource = signal<SchedulePlanSource>('GENERATED');

    readonly days = computed(() => {
        return this.plan()?.days ?? [];
    });

    readonly warnings = computed(() => {
        return this.plan()?.warnings ?? [];
    });

    readonly stats = computed(() => {
        return this.plan()?.stats ?? [];
    });

    readonly warningCount = computed(() => {
        return this.warnings().length;
    });

    constructor(
        private dateRangeService: DateRangeService,
        private turniGeneratorService: TurniGeneratorService,
        private scheduleCacheService: ScheduleCacheService
    ) {}

    init(): void {
        if (this.plan()) {
            return;
        }

        const initialRange = this.dateRangeService.createCurrentRange(this.mode());

        this.openRange(initialRange);
    }

    setMode(mode: RangeMode): void {
        const currentRange = this.range();

        const nextRange = this.dateRangeService.createRangeFromMode(
            mode,
            currentRange ?? undefined
        );

        this.mode.set(mode);
        this.openRange(nextRange);
    }

    previous(): void {
        const currentRange = this.range();

        if (!currentRange) {
            return;
        }

        const previousRange = this.dateRangeService.createPreviousRange(currentRange);

        this.openRange(previousRange);
    }

    next(): void {
        const currentRange = this.range();

        if (!currentRange) {
            return;
        }

        const nextRange = this.dateRangeService.createNextRange(currentRange);

        this.openRange(nextRange);
    }

    refresh(): void {
        const currentRange = this.range();

        if (!currentRange) {
            return;
        }

        this.generationSeed.update((value) => {
            return value + 1;
        });

        const plan = this.generatePlan(
            currentRange,
            'REGENERATED'
        );

        this.scheduleCacheService.set(plan);
        this.applyPlan(plan);
    }

    getAssignmentsByShift(
        day: DaySchedule,
        shift: ShiftType
    ): AssignedShift[] {
        return day.assignments.filter((assignment) => {
            return assignment.shift === shift;
        });
    }

    getWorker(workerId: string): Worker | undefined {
        return this.workers().find((worker) => {
            return worker.id === workerId;
        });
    }

    private openRange(range: DateRange): void {
        const cachedPlan = this.scheduleCacheService.get(range);

        if (cachedPlan) {
            this.applyPlan(cachedPlan);
            return;
        }

        const plan = this.generatePlan(
            range,
            'GENERATED'
        );

        this.scheduleCacheService.set(plan);
        this.applyPlan(plan);
    }

    private generatePlan(
        range: DateRange,
        source: SchedulePlanSource
    ): SchedulePlan {
        return this.turniGeneratorService.generatePlan(
            range,
            [...this.workers()],
            [...this.shifts()],
            this.generationSeed(),
            source
        );
    }

    private applyPlan(plan: SchedulePlan): void {
        this.range.set({ ...plan.range });
        this.lastSource.set(plan.source);

        this.plan.set({
            ...plan,
            range: {
                ...plan.range,
            },
            days: plan.days.map((day) => {
                return {
                    ...day,
                    assignments: day.assignments.map((assignment) => {
                        return {
                            ...assignment,
                        };
                    }),
                    warnings: day.warnings.map((warning) => {
                        return {
                            ...warning,
                        };
                    }),
                };
            }),
            warnings: plan.warnings.map((warning) => {
                return {
                    ...warning,
                };
            }),
            stats: plan.stats.map((stat) => {
                return {
                    ...stat,
                };
            }),
        });
    }
}
