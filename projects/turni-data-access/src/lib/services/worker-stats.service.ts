import { Injectable } from '@angular/core';

import {
    AssignedShift,
    DaySchedule,
    Worker,
    WorkerStats,
} from '../models/turni.models';
import { DateRangeService } from './date-range.service';

@Injectable({
    providedIn: 'root',
})
export class WorkerStatsService {
    constructor(
        private dateRangeService: DateRangeService
    ) {}

    calculateStats(
        workers: Worker[],
        days: DaySchedule[]
    ): WorkerStats[] {
        return workers.map((worker) => {
            const assignments = this.getAssignmentsByWorker(days, worker.id);

            const weekendKeysWorked = new Set<string>();

            for (const assignment of assignments) {
                if (this.dateRangeService.isWeekend(assignment.date)) {
                    weekendKeysWorked.add(
                        this.dateRangeService.getWeekendKey(assignment.date)
                    );
                }
            }

            const allWeekendKeys = this.getAllWeekendKeys(days);
            const totalHours = this.countHours(assignments);
            const maxHours = worker.contract?.maxMonthlyHours
                ?? worker.contract?.monthlyHours
                ?? totalHours;

            return {
                workerId: worker.id,
                workerName: worker.name,

                totalAssignments: assignments.length,
                totalHours,

                morningCount: this.countShift(assignments, 'MATTINA'),
                afternoonCount: this.countShift(assignments, 'POMERIGGIO'),
                nightCount: this.countShift(assignments, 'NOTTE'),

                maxConsecutiveMorningShiftsReached: this.countMaxConsecutiveShift(
                    days,
                    worker.id,
                    'MATTINA'
                ),
                maxConsecutiveAfternoonShiftsReached: this.countMaxConsecutiveShift(
                    days,
                    worker.id,
                    'POMERIGGIO'
                ),
                maxConsecutiveNightShiftsReached: this.countMaxConsecutiveShift(
                    days,
                    worker.id,
                    'NOTTE'
                ),

                maxNightShiftsInWeek: this.countMaxNightShiftsInWeek(assignments),

                weekendWorkedCount: weekendKeysWorked.size,
                freeWeekendCount: Math.max(
                    allWeekendKeys.size - weekendKeysWorked.size,
                    0
                ),

                forcedAssignmentsCount: assignments.filter((assignment) => {
                    return assignment.source === 'FORCED';
                }).length,
                extraHours: Math.max(
                    totalHours - maxHours,
                    this.countForcedExtraHours(assignments)
                ),

                contractMonthlyHours: worker.contract?.monthlyHours ?? 0,
                minMonthlyHours: worker.contract?.minMonthlyHours,
                maxMonthlyHours: worker.contract?.maxMonthlyHours,
            };
        });
    }

    countWorkerHours(
        days: DaySchedule[],
        workerId: string
    ): number {
        return this.getAssignmentsByWorker(days, workerId)
            .reduce((total, assignment) => {
                return total + assignment.hours;
            }, 0);
    }

    countWorkerShift(
        days: DaySchedule[],
        workerId: string,
        shift: AssignedShift['shift']
    ): number {
        return this.getAssignmentsByWorker(days, workerId)
            .filter((assignment) => {
                return assignment.shift === shift;
            }).length;
    }

    countWorkerShiftInSameIsoWeek(
        days: DaySchedule[],
        workerId: string,
        shift: AssignedShift['shift'],
        date: string
    ): number {
        return this.getAssignmentsByWorker(days, workerId)
            .filter((assignment) => {
                return assignment.shift === shift
                    && this.dateRangeService.isSameIsoWeek(
                        assignment.date,
                        date
                    );
            }).length;
    }

    countConsecutiveShiftBeforeDate(
        days: DaySchedule[],
        workerId: string,
        date: string,
        shift: AssignedShift['shift']
    ): number {
        const sortedDays = [...days]
            .filter((day) => {
                return day.date < date;
            })
            .sort((a, b) => {
                return b.date.localeCompare(a.date);
            });

        let count = 0;

        for (const day of sortedDays) {
            const workedShift = day.assignments.some((assignment) => {
                return assignment.workerId === workerId
                    && assignment.shift === shift;
            });

            if (!workedShift) {
                break;
            }

            count++;
        }

        return count;
    }

    countConsecutiveWorkedDaysBeforeDate(
        days: DaySchedule[],
        workerId: string,
        date: string
    ): number {
        const sortedDays = [...days]
            .filter((day) => {
                return day.date < date;
            })
            .sort((a, b) => {
                return b.date.localeCompare(a.date);
            });

        let count = 0;

        for (const day of sortedDays) {
            const worked = day.assignments.some((assignment) => {
                return assignment.workerId === workerId;
            });

            if (!worked) {
                break;
            }

            count++;
        }

        return count;
    }

    private getAssignmentsByWorker(
        days: DaySchedule[],
        workerId: string
    ): AssignedShift[] {
        return days.flatMap((day) => {
            return day.assignments.filter((assignment) => {
                return assignment.workerId === workerId;
            });
        });
    }

    private countHours(assignments: AssignedShift[]): number {
        return assignments.reduce((total, assignment) => {
            return total + assignment.hours;
        }, 0);
    }

    private countForcedExtraHours(assignments: AssignedShift[]): number {
        return assignments.reduce((total, assignment) => {
            return total + (assignment.extraHours ?? 0);
        }, 0);
    }

    private countShift(
        assignments: AssignedShift[],
        shift: AssignedShift['shift']
    ): number {
        return assignments.filter((assignment) => {
            return assignment.shift === shift;
        }).length;
    }

    private countMaxConsecutiveShift(
        days: DaySchedule[],
        workerId: string,
        shift: AssignedShift['shift']
    ): number {
        const sortedDays = [...days].sort((first, second) => {
            return first.date.localeCompare(second.date);
        });

        let currentCount = 0;
        let maxCount = 0;

        for (const day of sortedDays) {
            const workedShift = day.assignments.some((assignment) => {
                return assignment.workerId === workerId
                    && assignment.shift === shift;
            });

            if (workedShift) {
                currentCount++;
                maxCount = Math.max(maxCount, currentCount);
            } else {
                currentCount = 0;
            }
        }

        return maxCount;
    }

    private countMaxNightShiftsInWeek(assignments: AssignedShift[]): number {
        const nightAssignments = assignments.filter((assignment) => {
            return assignment.shift === 'NOTTE';
        });

        const weekMap = new Map<string, number>();

        for (const assignment of nightAssignments) {
            const weekKey = this.dateRangeService.getWeekendKey(assignment.date);
            const currentValue = weekMap.get(weekKey) ?? 0;

            weekMap.set(weekKey, currentValue + 1);
        }

        return Math.max(0, ...Array.from(weekMap.values()));
    }

    private getAllWeekendKeys(days: DaySchedule[]): Set<string> {
        const weekendKeys = new Set<string>();

        for (const day of days) {
            if (this.dateRangeService.isWeekend(day.date)) {
                weekendKeys.add(
                    this.dateRangeService.getWeekendKey(day.date)
                );
            }
        }

        return weekendKeys;
    }
}
