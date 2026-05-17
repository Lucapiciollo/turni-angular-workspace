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
    StatsFilterType,
    WarningFilterType,
    Worker,
} from '../models/turni.models';
import { DateRangeService } from './date-range.service';
import { ScheduleCacheService } from './schedule-cache.service';
import { TurniGeneratorService } from './turni-generator.service';
import { MomentLocaleService } from './moment-locale.service';

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

    readonly selectedWorkerId = signal<string | null>(null);
    readonly selectedStatsFilter = signal<StatsFilterType>('ALL');
    readonly selectedWarningFilter = signal<WarningFilterType>('ALL');

    readonly days = computed(() => {
        return this.plan()?.days ?? [];
    });

    readonly warnings = computed(() => {
        return this.plan()?.warnings ?? [];
    });

    readonly stats = computed(() => {
        return this.plan()?.stats ?? [];
    });


    readonly activePeriodWorkerIds = computed(() => {
        const workerIds = new Set<string>();

        this.days().forEach((day) => {
            day.assignments
                .filter((assignment) => {
                    return assignment.isFigurative !== true;
                })
                .forEach((assignment) => {
                    workerIds.add(assignment.workerId);
                });
        });

        return workerIds;
    });

    readonly periodStats = computed(() => {
        const workerIds = this.activePeriodWorkerIds();

        return this.stats().filter((stat) => {
            return workerIds.has(stat.workerId);
        });
    });

    readonly periodWarnings = computed(() => {
        const range = this.range();

        if (!range) {
            return this.warnings();
        }

        return this.warnings().filter((warning) => {
            if (!warning.date) {
                return true;
            }

            return warning.date >= range.startDate
                && warning.date <= range.endDate;
        });
    });

    readonly periodWarningCount = computed(() => {
        return this.periodWarnings().length;
    });

    readonly filteredStats = computed(() => {
        return this.applyStatsFilter(
            this.getStatsBaseForCurrentWorker(),
            this.selectedStatsFilter()
        );
    });

    readonly filteredWarnings = computed(() => {
        return this.applyWarningFilter(
            this.getWarningsBaseForCurrentWorker(),
            this.selectedWarningFilter()
        );
    });

    readonly generatedAtLabel = computed(() => {
        const generatedAt = this.plan()?.generatedAt;

        if (!generatedAt) {
            return '-';
        }

        return new Date(generatedAt).toLocaleString('it-IT');
    });

    readonly currentRangeCacheKey = computed(() => {
        const currentRange = this.range();

        if (!currentRange) {
            return '-';
        }

        return `${currentRange.mode}_${currentRange.startDate}_${currentRange.endDate}`;
    });

    readonly warningCount = computed(() => {
        return this.warnings().length;
    });


    readonly selectedWorkerStats = computed(() => {
        const workerId = this.selectedWorkerId();

        if (!workerId) {
            return null;
        }

        return this.stats().find((stat) => {
            return stat.workerId === workerId;
        }) ?? null;
    });

    readonly selectedWorker = computed(() => {
        const workerId = this.selectedWorkerId();

        if (!workerId) {
            return null;
        }

        return this.getWorker(workerId) ?? null;
    });

    constructor(
        private dateRangeService: DateRangeService,
        private turniGeneratorService: TurniGeneratorService,
        private scheduleCacheService: ScheduleCacheService,
        private momentLocaleService: MomentLocaleService
    ) {
        this.momentLocaleService.init();
    }

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

    selectWorker(workerId: string | null): void {
        this.selectedWorkerId.set(workerId);
    }

    clearSelectedWorker(): void {
        this.selectedWorkerId.set(null);
    }

    setStatsFilter(filter: StatsFilterType): void {
        this.selectedStatsFilter.set(filter);
    }

    setWarningFilter(filter: WarningFilterType): void {
        this.selectedWarningFilter.set(filter);
    }

    resetStatsFilters(): void {
        this.selectedWorkerId.set(null);
        this.selectedStatsFilter.set('ALL');
    }

    resetWarningFilters(): void {
        this.selectedWorkerId.set(null);
        this.selectedWarningFilter.set('ALL');
    }


    getStatsFilterCount(filter: StatsFilterType): number {
        return this.applyStatsFilter(
            this.getStatsBaseForCurrentWorker(),
            filter
        ).length;
    }

    getWarningFilterCount(filter: WarningFilterType): number {
        return this.applyWarningFilter(
            this.getWarningsBaseForCurrentWorker(),
            filter
        ).length;
    }

    private getStatsBaseForCurrentWorker() {
        const workerId = this.selectedWorkerId();
        let stats = this.stats();

        if (workerId) {
            stats = stats.filter((stat) => {
                return stat.workerId === workerId;
            });
        }

        return stats;
    }

    private getWarningsBaseForCurrentWorker() {
        const workerId = this.selectedWorkerId();
        let warnings = this.warnings();

        if (workerId) {
            warnings = warnings.filter((warning) => {
                return warning.workerId === workerId;
            });
        }

        return warnings;
    }

    private applyStatsFilter(
        stats: ReturnType<typeof this.stats>,
        filter: StatsFilterType
    ) {
        if (filter === 'FORCED') {
            return stats.filter((stat) => {
                return stat.forcedAssignmentsCount > 0;
            });
        }

        if (filter === 'EXTRA') {
            return stats.filter((stat) => {
                return stat.extraHours > 0;
            });
        }

        if (filter === 'UNDER_HOURS') {
            return stats.filter((stat) => {
                return stat.minMonthlyHours !== undefined
                    && stat.totalHours < stat.minMonthlyHours;
            });
        }

        if (filter === 'NO_FREE_WEEKEND') {
            return stats.filter((stat) => {
                return stat.freeWeekendCount < 1;
            });
        }

        return stats;
    }

    private applyWarningFilter(
        warnings: ReturnType<typeof this.warnings>,
        filter: WarningFilterType
    ) {
        if (filter === 'ERROR') {
            return warnings.filter((warning) => {
                return warning.severity === 'ERROR';
            });
        }

        if (filter === 'WARNING') {
            return warnings.filter((warning) => {
                return warning.severity === 'WARNING';
            });
        }

        if (filter === 'INFO') {
            return warnings.filter((warning) => {
                return warning.severity === 'INFO';
            });
        }

        if (filter === 'FORCED') {
            return warnings.filter((warning) => {
                return warning.id.startsWith('FORCED_');
            });
        }

        return warnings;
    }


    refreshStrong(): void {
        const currentRange = this.range();

        if (!currentRange) {
            return;
        }

        this.generationSeed.update((value) => {
            return value + 17;
        });

        this.scheduleCacheService.delete(currentRange);

        const plan = this.generatePlan(
            currentRange,
            'REGENERATED'
        );

        this.scheduleCacheService.set(plan);
        this.applyPlan(plan);
    }

    clearCurrentPeriodCache(): void {
        const currentRange = this.range();

        if (!currentRange) {
            return;
        }

        this.scheduleCacheService.delete(currentRange);

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
            return assignment.shift === shift
                && assignment.isFigurative !== true;
        });
    }

    getFigurativeAbsencesByDay(day: DaySchedule): AssignedShift[] {
        return day.assignments.filter((assignment) => {
            return assignment.isFigurative === true;
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
