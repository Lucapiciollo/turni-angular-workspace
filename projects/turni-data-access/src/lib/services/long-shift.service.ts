import { Injectable } from '@angular/core';
import { AssignedShift, DaySchedule, SchedulePlan, ScheduleWarning, ShiftType, Worker, WorkerStats } from '../models/turni.models';
import { DateRangeService } from './date-range.service';
import { ScheduleWarningService } from './schedule-warning.service';
import { WorkerStatsService } from './worker-stats.service';

@Injectable({ providedIn: 'root' })
export class LongShiftService {
    constructor(
        private workerStatsService: WorkerStatsService,
        private warningService: ScheduleWarningService,
        private dateRangeService: DateRangeService
    ) {}

    applyLongShift(params: {
        plan: SchedulePlan;
        workers: Worker[];
        date: string;
        shift: ShiftType;
        leavingWorkerId: string;
        longWorkerId: string;
        leaveTime: string;
        reason: 'PERMESSO' | 'USCITA_ANTICIPATA';
        note?: string;
    }): SchedulePlan {
        const plan = this.clonePlan(params.plan);
        const day = plan.days.find((item) => item.date === params.date);
        if (!day) throw new Error('Giorno non trovato nel piano.');

        const leavingAssignment = day.assignments.find((a) => a.workerId === params.leavingWorkerId && a.shift === params.shift && a.isFigurative !== true);
        if (!leavingAssignment) throw new Error('Operatore in permesso non trovato nel turno selezionato.');

        const longAssignment = day.assignments.find((a) => a.workerId === params.longWorkerId && a.shift === params.shift && a.isFigurative !== true);
        if (!longAssignment) throw new Error('Operatore scelto per la lunga non presente nello stesso turno.');

        if (params.leavingWorkerId === params.longWorkerId) throw new Error('La lunga deve essere assegnata a un altro operatore dello stesso turno.');

        leavingAssignment.hasEarlyLeave = true;
        leavingAssignment.leaveTime = params.leaveTime;
        leavingAssignment.leaveReason = params.reason;
        leavingAssignment.leaveNote = params.note ?? 'Permesso/uscita anticipata inserita dal piano turni.';

        longAssignment.isLongShift = true;
        longAssignment.longForWorkerId = leavingAssignment.workerId;
        longAssignment.longForWorkerName = leavingAssignment.workerName;
        longAssignment.longFromTime = params.leaveTime;
        longAssignment.longReason = params.reason;
        longAssignment.longNote = params.note ?? `Fa la lunga per ${leavingAssignment.workerName}.`;

        day.warnings.push(this.createLongShiftWarning({ date: params.date, shift: params.shift, leavingAssignment, longAssignment, leaveTime: params.leaveTime, reason: params.reason }));

        return this.recalculatePlan({ plan, workers: params.workers });
    }

    private createLongShiftWarning(params: { date: string; shift: ShiftType; leavingAssignment: AssignedShift; longAssignment: AssignedShift; leaveTime: string; reason: 'PERMESSO' | 'USCITA_ANTICIPATA' }): ScheduleWarning {
        return {
            id: `LONG_SHIFT_${params.date}_${params.shift}_${params.leavingAssignment.workerId}_${params.longAssignment.workerId}_${Date.now()}`,
            severity: 'INFO',
            date: params.date,
            shift: params.shift,
            workerId: params.longAssignment.workerId,
            workerName: params.longAssignment.workerName,
            message: `${params.longAssignment.workerName} fa la lunga per ${params.leavingAssignment.workerName} dalle ${params.leaveTime}. Motivo: ${params.reason}.`,
        };
    }

    private recalculatePlan(params: { plan: SchedulePlan; workers: Worker[] }): SchedulePlan {
        const days: DaySchedule[] = params.plan.days.map((day) => {
            const warnings = this.deduplicateWarnings(day.warnings);
            return { ...day, warnings, indicators: { ...day.indicators, totalWarnings: warnings.length } };
        });

        const stats = this.workerStatsService.calculateStats(params.workers, days);
        const qualityWarnings = this.warningService.createQualityWarnings({ range: params.plan.range, workers: params.workers, days, stats });

        return { ...params.plan, days, stats, warnings: this.deduplicateWarnings([...days.flatMap((d) => d.warnings), ...qualityWarnings]), source: 'REGENERATED', generatedAt: this.dateRangeService.nowIso() };
    }

    private deduplicateWarnings(warnings: ScheduleWarning[]): ScheduleWarning[] {
        const map = new Map<string, ScheduleWarning>();
        warnings.forEach((warning) => map.set(warning.id, warning));
        return Array.from(map.values());
    }

    private clonePlan(plan: SchedulePlan): SchedulePlan {
        return {
            ...plan,
            range: { ...plan.range },
            days: plan.days.map((day) => ({
                ...day,
                assignments: day.assignments.map((assignment) => ({ ...assignment, violatedRules: [...assignment.violatedRules] })),
                warnings: day.warnings.map((warning) => ({ ...warning })),
                indicators: { ...day.indicators },
            })),
            warnings: plan.warnings.map((warning) => ({ ...warning })),
            stats: plan.stats.map((stat: WorkerStats) => ({ ...stat })),
        };
    }
}
