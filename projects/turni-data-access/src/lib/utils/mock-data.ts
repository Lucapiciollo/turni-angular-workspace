import { AuditLog, Holiday, OptimizerResult, RangeMode, SchedulePlan, ScheduleRange, ValidationIssue, Worker, WorkerAbsence } from '../models/turni.models';
import { DateRangeUtils } from './date-range.utils';
import { MomentDateUtils } from './moment-date.utils';
import { defaultShiftDefinitions, generatePlan, validatePlan } from './schedule-engine.utils';

export const mockWorkers: Worker[] = [
  { id: 'w1', name: 'Luca Bianchi', initials: 'LC', color: 'indigo', role: 'Responsabile', weeklyHours: 40, allowedShifts: ['MATTINA','POMERIGGIO','NOTTE'], maxConsecutiveDays: 5, maxNightShiftsPerMonth: 6, minRestHoursBetweenShifts: 11, restAfterNight: true, preferredShifts: ['MATTINA'], skills: ['RESPONSABILE','PRIMO_SOCCORSO'], roles: ['RESPONSABILE'] },
  { id: 'w2', name: 'Marco Conti', initials: 'MC', color: 'green', role: 'Operatore', weeklyHours: 40, allowedShifts: ['MATTINA','POMERIGGIO','NOTTE'], maxConsecutiveDays: 5, maxNightShiftsPerMonth: 5, minRestHoursBetweenShifts: 11, restAfterNight: true, preferredShifts: ['POMERIGGIO'] },
  { id: 'w3', name: 'Anna Neri', initials: 'AN', color: 'pink', role: 'Operatore', weeklyHours: 36, allowedShifts: ['MATTINA','POMERIGGIO','NOTTE'], maxConsecutiveDays: 4, maxNightShiftsPerMonth: 6, minRestHoursBetweenShifts: 11, restAfterNight: true, preferredShifts: ['NOTTE'] },
  { id: 'w4', name: 'Giulia Servi', initials: 'GS', color: 'orange', role: 'Operatore', weeklyHours: 32, allowedShifts: ['MATTINA','POMERIGGIO','NOTTE'], maxConsecutiveDays: 5, maxNightShiftsPerMonth: 4, minRestHoursBetweenShifts: 11, restAfterNight: true },
  { id: 'w5', name: 'Davide Ferri', initials: 'DF', color: 'cyan', role: 'Operatore', weeklyHours: 30, allowedShifts: ['MATTINA','POMERIGGIO'], maxConsecutiveDays: 4, minRestHoursBetweenShifts: 11, restAfterNight: true, unavailableDates: ['2026-05-20','2026-05-21'] },
  { id: 'w6', name: 'Sara Moretti', initials: 'SM', color: 'slate', role: 'Operatore', weeklyHours: 24, allowedShifts: ['MATTINA','POMERIGGIO','NOTTE'], maxConsecutiveDays: 3, maxNightShiftsPerMonth: 3, minRestHoursBetweenShifts: 11, restAfterNight: true },
];
export const defaultShifts = defaultShiftDefinitions;
export const mockAbsences: WorkerAbsence[] = [ { workerId: 'w5', startDate: '2026-05-20', endDate: '2026-05-21', type: 'FERIE', note: 'Ferie programmate' } ];
export const mockHolidays: Holiday[] = [ { date: '2026-05-01', name: 'Festa lavoratori' }, { date: '2026-06-02', name: 'Festa Repubblica' } ];
export function createPlanForRange(range: ScheduleRange): SchedulePlan { return generatePlan({ range, workers: mockWorkers, shifts: defaultShifts, absences: mockAbsences, holidays: mockHolidays }); }
export function createInitialMockPlan(name: string, startDate: string, endDate: string, mode: RangeMode = 'MONTH', rangeKey?: string): SchedulePlan { const range: ScheduleRange = { key: rangeKey ?? `${mode}:${startDate}:${endDate}`, mode, label: name.replace(/^Turni\s+|^Settimana\s+/, ''), startDate, endDate, visibleDays: DateRangeUtils.daysBetween(startDate, endDate).length, anchorDate: startDate }; return generatePlan({ range, workers: mockWorkers, shifts: defaultShifts, absences: mockAbsences, holidays: mockHolidays }); }
export function createIssues(plan: SchedulePlan): ValidationIssue[] { return validatePlan(plan, mockWorkers, defaultShifts); }
export const mockAudits: AuditLog[] = [ { id: 'audit_seed_1', action: 'CREATE_PLAN', message: 'Creato piano iniziale', createdAt: MomentDateUtils.nowIso(), createdBy: 'Admin' } ];
export const mockOptimizer: OptimizerResult = { score: 0, attempts: 0, errors: 0, warnings: 0 };
