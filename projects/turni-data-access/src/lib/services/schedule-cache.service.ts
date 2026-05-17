import { Injectable } from '@angular/core';

import { DateRange, SchedulePlan } from '../models/turni.models';
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

    getCachedKeys(): string[] {
        return Array.from(this.cache.keys());
    }

    private getKey(range: DateRange): string {
        return this.dateRangeService.createRangeKey(range);
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
        };
    }
}
