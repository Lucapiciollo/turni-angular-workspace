import { Injectable } from '@angular/core';

import {
    DateRange,
    DaySchedule,
    SchedulePlan,
} from '../models/turni.models';
import { DateRangeService } from './date-range.service';

@Injectable({
    providedIn: 'root',
})
export class ScheduleCacheService {
    private readonly cache = new Map<string, SchedulePlan>();

    constructor(
        private dateRangeService: DateRangeService
    ) {}

    get(range: DateRange): SchedulePlan | null {
        const key = this.getKey(range);
        const plan = this.cache.get(key);

        if (!plan) {
            return null;
        }

        return this.clonePlan({
            ...plan,
            source: 'CACHE',
        });
    }

    set(plan: SchedulePlan): void {
        const key = this.getKey(plan.range);

        this.cache.set(
            key,
            this.clonePlan(plan)
        );
    }

    delete(range: DateRange): void {
        const key = this.getKey(range);

        this.cache.delete(key);
    }

    has(range: DateRange): boolean {
        const key = this.getKey(range);

        return this.cache.has(key);
    }

    clear(): void {
        this.cache.clear();
    }

    getPreviousContextDays(
        range: DateRange,
        lookBackDays: number
    ): DaySchedule[] {
        if (lookBackDays <= 0) {
            return [];
        }

        const startDate = new Date(`${range.startDate}T00:00:00`);
        const fromDate = new Date(startDate);
        fromDate.setDate(fromDate.getDate() - lookBackDays);

        const toDate = new Date(startDate);
        toDate.setDate(toDate.getDate() - 1);

        const from = this.formatDate(fromDate);
        const to = this.formatDate(toDate);

        return Array.from(this.cache.values())
            .flatMap((plan) => plan.days)
            .filter((day) => {
                return day.date >= from
                    && day.date <= to;
            })
            .sort((a, b) => a.date.localeCompare(b.date))
            .map((day) => {
                return {
                    ...day,
                    assignments: day.assignments.map((assignment) => {
                        return {
                            ...assignment,
                            violatedRules: [
                                ...assignment.violatedRules,
                            ],
                        };
                    }),
                    warnings: day.warnings.map((warning) => {
                        return {
                            ...warning,
                        };
                    }),
                    indicators: {
                        ...day.indicators,
                    },
                };
            });
    }

    getCachedKeys(): string[] {
        return Array.from(this.cache.keys());
    }

    private getKey(range: DateRange): string {
        return this.dateRangeService.createRangeKey(range);
    }

    private formatDate(date: Date): string {
        return date.toISOString().slice(0, 10);
    }

    private clonePlan(plan: SchedulePlan): SchedulePlan {
        return {
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
                            violatedRules: [
                                ...assignment.violatedRules,
                            ],
                        };
                    }),
                    warnings: day.warnings.map((warning) => {
                        return {
                            ...warning,
                        };
                    }),
                    indicators: {
                        ...day.indicators,
                    },
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
            generationLogs: plan.generationLogs?.map((log) => {
                return {
                    ...log,
                    rules: log.rules
                        ? [
                            ...log.rules,
                        ]
                        : undefined,
                    messages: [
                        ...log.messages,
                    ],
                };
            }),
            generationSettings: plan.generationSettings
                ? {
                    ...plan.generationSettings,
                }
                : undefined,
        };
    }
}
