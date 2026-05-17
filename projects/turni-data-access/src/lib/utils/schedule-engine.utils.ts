import {
  Assignment,
  AssignmentSource,
  CanAssignContext,
  DaySchedule,
  GeneratePlanOptions,
  MoveAssignmentPayload,
  OptimizerResult,
  SchedulePlan,
  ScheduleRange,
  ShiftDefinition,
  ShiftType,
  ValidationIssue,
  Worker,
  WorkerAbsence,
  Holiday,
} from '../models/turni.models';
import { DateRangeUtils } from './date-range.utils';
import { MomentDateUtils } from './moment-date.utils';

export const defaultShiftDefinitions: ShiftDefinition[] = [
  { type: 'MATTINA', label: 'Mattina', start: '06:00', end: '14:00', requiredWorkers: 2, hours: 8 },
  { type: 'POMERIGGIO', label: 'Pomeriggio', start: '14:00', end: '22:00', requiredWorkers: 2, hours: 8 },
  { type: 'NOTTE', label: 'Notte', start: '22:00', end: '06:00', requiredWorkers: 1, hours: 8, crossesMidnight: true },
];

function now(): string { return MomentDateUtils.nowIso(); }
export function assignmentId(date: string, shift: ShiftType, workerId: string): string { return `${date}_${shift}_${workerId}`; }
export function createAssignment(date: string, shift: ShiftType, workerId: string, source: AssignmentSource = 'AUTO', locked = false, forced = false): Assignment { return { id: assignmentId(date, shift, workerId), date, shift, workerId, source, locked, forced, createdAt: now(), updatedAt: now() }; }
export function getShift(shifts: ShiftDefinition[], type: ShiftType): ShiftDefinition { const s = shifts.find(x => x.type === type); if (!s) throw new Error(`Turno non configurato: ${type}`); return s; }
export function getWorker(workers: Worker[], workerId: string): Worker | null { return workers.find(w => w.id === workerId) ?? null; }
export function allAssignments(plan: SchedulePlan | null | undefined): Assignment[] { return plan?.days.flatMap(d => d.assignments) ?? []; }
export function assignmentsForWorker(plan: SchedulePlan | null | undefined, workerId: string): Assignment[] { return allAssignments(plan).filter(a => a.workerId === workerId); }
export function assignmentsUntil(plan: SchedulePlan | null | undefined, date: string): Assignment[] { return plan?.days.filter(d => MomentDateUtils.parseDate(d.date).isBefore(MomentDateUtils.parseDate(date), 'day')).flatMap(d => d.assignments) ?? []; }
export function isWorkerAbsent(workerId: string, date: string, absences: WorkerAbsence[]): boolean { return absences.some(a => a.workerId === workerId && MomentDateUtils.isBetweenDays(date, a.startDate, a.endDate)); }
export function isHoliday(date: string, holidays: Holiday[]): boolean { return holidays.some(h => h.date === date); }
export function shiftStart(date: string, shift: ShiftDefinition) { return MomentDateUtils.shiftStart(date, shift.start); }
export function shiftEnd(date: string, shift: ShiftDefinition) { return MomentDateUtils.shiftEnd(date, shift.start, shift.end); }
export function countWorkerAssignments(plan: SchedulePlan | null | undefined, workerId: string): number { return assignmentsForWorker(plan, workerId).length; }
export function countWorkerShift(plan: SchedulePlan | null | undefined, workerId: string, shift: ShiftType): number { return assignmentsForWorker(plan, workerId).filter(a => a.shift === shift).length; }
export function countWorkerHours(plan: SchedulePlan | null | undefined, workerId: string, shifts: ShiftDefinition[]): number { return assignmentsForWorker(plan, workerId).reduce((sum, a) => sum + getShift(shifts, a.shift).hours, 0); }
export function weeklyHours(plan: SchedulePlan | null | undefined, workerId: string, date: string, shifts: ShiftDefinition[]): number { return plan?.days.filter(d => MomentDateUtils.sameIsoWeek(d.date, date)).flatMap(d => d.assignments).filter(a => a.workerId === workerId).reduce((sum, a) => sum + getShift(shifts, a.shift).hours, 0) ?? 0; }
export function monthlyHours(plan: SchedulePlan | null | undefined, workerId: string, date: string, shifts: ShiftDefinition[]): number { return plan?.days.filter(d => MomentDateUtils.sameMonth(d.date, date)).flatMap(d => d.assignments).filter(a => a.workerId === workerId).reduce((sum, a) => sum + getShift(shifts, a.shift).hours, 0) ?? 0; }
export function monthlyNights(plan: SchedulePlan | null | undefined, workerId: string, date: string): number { return plan?.days.filter(d => MomentDateUtils.sameMonth(d.date, date)).flatMap(d => d.assignments).filter(a => a.workerId === workerId && a.shift === 'NOTTE').length ?? 0; }
export function countConsecutiveDays(plan: SchedulePlan | null | undefined, workerId: string, currentDate: string): number { let count = 0; let d = MomentDateUtils.parseDate(currentDate).subtract(1, 'day'); while (plan?.days.some(day => day.date === MomentDateUtils.formatDate(d) && day.assignments.some(a => a.workerId === workerId))) { count++; d = d.subtract(1, 'day'); } return count; }
export function workerWorkedNightPreviousDay(plan: SchedulePlan | null | undefined, workerId: string, date: string): boolean { const prev = MomentDateUtils.formatDate(MomentDateUtils.parseDate(date).subtract(1, 'day')); return plan?.days.some(d => d.date === prev && d.assignments.some(a => a.workerId === workerId && a.shift === 'NOTTE')) ?? false; }
export function hasMinimumRest(plan: SchedulePlan | null | undefined, worker: Worker, date: string, shift: ShiftDefinition, shifts: ShiftDefinition[]): boolean { const minRest = worker.rules?.minRestHoursBetweenShifts ?? worker.minRestHoursBetweenShifts ?? 11; const items = assignmentsForWorker(plan, worker.id).map(a => ({ a, s: getShift(shifts, a.shift) })).sort((x, y) => shiftStart(x.a.date, x.s).valueOf() - shiftStart(y.a.date, y.s).valueOf()); const currentStart = shiftStart(date, shift); const prev = items.filter(x => shiftStart(x.a.date, x.s).isBefore(currentStart)).at(-1); if (!prev) return true; return currentStart.diff(shiftEnd(prev.a.date, prev.s), 'hours', true) >= minRest; }

export function canAssignWorker(ctx: CanAssignContext): boolean {
  const { worker, date, shift, partialPlan, currentDayAssignments, workers, shifts, absences, holidays } = ctx;
  void workers;
  if (!worker.allowedShifts.includes(shift.type)) return false;
  if (worker.unavailableDates?.includes(date)) return false;
  if (isWorkerAbsent(worker.id, date, absences)) return false;
  if (currentDayAssignments.some(a => a.workerId === worker.id)) return false;
  if ((worker.rules?.allowWeekend ?? worker.allowWeekend ?? true) === false && MomentDateUtils.isWeekend(date)) return false;
  if ((worker.rules?.allowHolidays ?? worker.allowHolidays ?? true) === false && isHoliday(date, holidays)) return false;
  if ((worker.rules?.restAfterNight ?? worker.restAfterNight ?? true) && shift.type !== 'NOTTE' && workerWorkedNightPreviousDay(partialPlan, worker.id, date)) return false;
  if (countConsecutiveDays(partialPlan, worker.id, date) >= (worker.rules?.maxConsecutiveDays ?? worker.maxConsecutiveDays ?? 5)) return false;
  const maxWeekly = worker.rules?.maxWeeklyHours ?? worker.contract?.weeklyHours ?? worker.weeklyHours;
  if (weeklyHours(partialPlan, worker.id, date, shifts) + shift.hours > maxWeekly) return false;
  const maxMonthly = worker.rules?.maxMonthlyHours ?? worker.contract?.monthlyTargetHours;
  if (maxMonthly && monthlyHours(partialPlan, worker.id, date, shifts) + shift.hours > maxMonthly) return false;
  const maxNights = worker.rules?.maxNightShiftsPerMonth ?? worker.maxNightShiftsPerMonth ?? 8;
  if (shift.type === 'NOTTE' && monthlyNights(partialPlan, worker.id, date) + 1 > maxNights) return false;
  if (!hasMinimumRest(partialPlan, worker, date, shift, shifts)) return false;
  if (shift.requirements?.length) {
    const ok = shift.requirements.some(r => (r.role ? worker.roles?.includes(r.role) || worker.role === r.role : true) && (r.skill ? worker.skills?.includes(r.skill) : true));
    if (!ok) return false;
  }
  return true;
}

export function workerScore(worker: Worker, date: string, shift: ShiftDefinition, partialPlan: SchedulePlan | null, shifts: ShiftDefinition[], holidays: Holiday[] = []): number {
  let score = 0;
  score += countWorkerAssignments(partialPlan, worker.id) * 10;
  score += countWorkerShift(partialPlan, worker.id, shift.type) * 8;
  score += countWorkerHours(partialPlan, worker.id, shifts) * 1.5;
  score += countConsecutiveDays(partialPlan, worker.id, date) * 12;
  if (shift.type === 'NOTTE') score += countWorkerShift(partialPlan, worker.id, 'NOTTE') * 16;
  if (MomentDateUtils.isWeekend(date)) score += assignmentsForWorker(partialPlan, worker.id).filter(a => MomentDateUtils.isWeekend(a.date)).length * 10;
  if (isHoliday(date, holidays)) score += assignmentsForWorker(partialPlan, worker.id).filter(a => isHoliday(a.date, holidays)).length * 12;
  if (worker.rules?.preferredShifts?.includes(shift.type) || worker.preferredShifts?.includes(shift.type)) score -= 8;
  return score;
}

export function createEmptyDay(date: string, holidays: Holiday[] = []): DaySchedule { return { date, ...DateRangeUtils.dayLabels(date, holidays), assignments: [], warnings: [] }; }
export function createPartialPlan(range: ScheduleRange, days: DaySchedule[], absences: WorkerAbsence[] = [], holidays: Holiday[] = []): SchedulePlan { const prefix = range.mode === 'MONTH' ? 'Turni' : 'Settimana'; return { id: `plan_${range.key}`, rangeKey: range.key, mode: range.mode, name: `${prefix} ${range.label}`, startDate: range.startDate, endDate: range.endDate, status: 'DRAFT', days, absences, holidays, createdAt: now(), updatedAt: now() }; }
export function prepareShifts(shifts: ShiftDefinition[], prioritizeNights = true): ShiftDefinition[] { return prioritizeNights ? [...shifts].sort((a, b) => a.type === 'NOTTE' ? -1 : b.type === 'NOTTE' ? 1 : 0) : [...shifts]; }

export function generatePlan(options: GeneratePlanOptions): SchedulePlan {
  const { range, workers, shifts, previousPlan, absences = previousPlan?.absences ?? [], holidays = previousPlan?.holidays ?? [], prioritizeNights = true } = options;
  const days: DaySchedule[] = [];
  for (const date of DateRangeUtils.daysBetween(range.startDate, range.endDate)) {
    const previousDay = previousPlan?.days.find(d => d.date === date);
    const day = createEmptyDay(date, holidays);
    day.assignments.push(...(previousDay?.assignments.filter(a => a.locked).map(a => ({ ...a })) ?? []));
    for (const shift of prepareShifts(shifts, prioritizeNights)) {
      const missing = Math.max(shift.requiredWorkers - day.assignments.filter(a => a.shift === shift.type).length, 0);
      for (let i = 0; i < missing; i++) {
        const partialPlan = createPartialPlan(range, [...days, day], absences, holidays);
        const selected = workers.filter(w => canAssignWorker({ worker: w, date, shift, partialPlan, currentDayAssignments: day.assignments, workers, shifts, absences, holidays })).sort((a, b) => workerScore(a, date, shift, partialPlan, shifts, holidays) - workerScore(b, date, shift, partialPlan, shifts, holidays))[0];
        if (selected) day.assignments.push(createAssignment(date, shift.type, selected.id));
      }
    }
    days.push(day);
  }
  return withRevalidatedPlan(createPartialPlan(range, days, absences, holidays), workers, shifts).plan;
}

export function applyWarnings(plan: SchedulePlan, issues: ValidationIssue[]): DaySchedule[] { return plan.days.map(day => ({ ...day, warnings: issues.filter(i => i.date === day.date) })); }
export function validatePlan(plan: SchedulePlan, workers: Worker[], shifts: ShiftDefinition[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const day of plan.days) {
    for (const shift of shifts) {
      const count = day.assignments.filter(a => a.shift === shift.type).length;
      if (count < shift.requiredWorkers) issues.push({ id: `coverage_${day.date}_${shift.type}`, severity: 'ERROR', title: `${shift.label} scoperto`, message: `Assegnati ${count}, richiesti ${shift.requiredWorkers}`, date: day.date, shift: shift.type });
      if (count > shift.requiredWorkers) issues.push({ id: `over_${day.date}_${shift.type}`, severity: 'WARNING', title: `${shift.label} sovracoperto`, message: `Assegnati ${count}, richiesti ${shift.requiredWorkers}`, date: day.date, shift: shift.type });
    }
    const byWorker = new Map<string, number>();
    for (const a of day.assignments) byWorker.set(a.workerId, (byWorker.get(a.workerId) ?? 0) + 1);
    for (const [workerId, count] of byWorker.entries()) if (count > 1) issues.push({ id: `double_${day.date}_${workerId}`, severity: 'ERROR', title: 'Doppio turno nello stesso giorno', message: `${getWorker(workers, workerId)?.name ?? workerId} ha ${count} turni nello stesso giorno`, date: day.date, workerId });
    for (const a of day.assignments) if (isWorkerAbsent(a.workerId, day.date, plan.absences)) issues.push({ id: `absence_${day.date}_${a.workerId}_${a.shift}`, severity: a.forced ? 'WARNING' : 'ERROR', title: 'Operatore assente', message: `${getWorker(workers, a.workerId)?.name ?? a.workerId} è assegnato ma risulta assente`, date: day.date, shift: a.shift, workerId: a.workerId, assignmentId: a.id });
  }
  for (const worker of workers) {
    const items = assignmentsForWorker(plan, worker.id).map(a => ({ a, s: getShift(shifts, a.shift) })).sort((x, y) => shiftStart(x.a.date, x.s).valueOf() - shiftStart(y.a.date, y.s).valueOf());
    const weeks = new Map<string, number>(); let nights = 0;
    for (const { a, s } of items) { weeks.set(MomentDateUtils.weekKey(a.date), (weeks.get(MomentDateUtils.weekKey(a.date)) ?? 0) + s.hours); if (a.shift === 'NOTTE') nights++; }
    const maxWeekly = worker.rules?.maxWeeklyHours ?? worker.contract?.weeklyHours ?? worker.weeklyHours;
    for (const [week, hours] of weeks) if (hours > maxWeekly) issues.push({ id: `weekly_${worker.id}_${week}`, severity: 'WARNING', title: 'Ore settimanali superate', message: `${worker.name}: ${hours}/${maxWeekly} ore nella settimana ${week}`, workerId: worker.id });
    const maxNights = worker.rules?.maxNightShiftsPerMonth ?? worker.maxNightShiftsPerMonth ?? 8;
    if (nights > maxNights) issues.push({ id: `nights_${worker.id}`, severity: 'WARNING', title: 'Troppe notti', message: `${worker.name}: ${nights}/${maxNights} notti assegnate`, workerId: worker.id });
    for (let i = 1; i < items.length; i++) { const prev = items[i - 1]; const curr = items[i]; const rest = shiftStart(curr.a.date, curr.s).diff(shiftEnd(prev.a.date, prev.s), 'hours', true); const min = worker.rules?.minRestHoursBetweenShifts ?? worker.minRestHoursBetweenShifts ?? 11; if (rest < min) issues.push({ id: `rest_${worker.id}_${curr.a.id}`, severity: curr.a.forced ? 'WARNING' : 'ERROR', title: 'Riposo minimo non rispettato', message: `${worker.name}: ${rest.toFixed(1)} ore tra ${prev.a.shift} e ${curr.a.shift}. Minimo ${min}`, date: curr.a.date, shift: curr.a.shift, workerId: worker.id, assignmentId: curr.a.id }); }
  }
  return issues.length ? issues : [{ id: 'ok_plan', severity: 'INFO', title: 'Piano valido', message: 'Nessun errore bloccante rilevato.' }];
}
export function withRevalidatedPlan(plan: SchedulePlan, workers: Worker[], shifts: ShiftDefinition[]): { plan: SchedulePlan; issues: ValidationIssue[] } { const issues = validatePlan(plan, workers, shifts); return { plan: { ...plan, days: applyWarnings(plan, issues), updatedAt: now() }, issues }; }
export function assignWorkerToPlan(plan: SchedulePlan, workers: Worker[], shifts: ShiftDefinition[], date: string, shift: ShiftType, workerId: string, forced = false): SchedulePlan { void workers; void shifts; if (plan.days.some(d => d.date === date && d.assignments.some(a => a.workerId === workerId && a.shift === shift))) return plan; const assignment = createAssignment(date, shift, workerId, forced ? 'FORCED' : 'MANUAL', true, forced); return { ...plan, days: plan.days.map(day => day.date === date ? { ...day, assignments: [...day.assignments, assignment] } : day), updatedAt: now() }; }
export function removeWorkerFromPlan(plan: SchedulePlan, date: string, shift: ShiftType, workerId: string): SchedulePlan { return { ...plan, days: plan.days.map(day => day.date === date ? { ...day, assignments: day.assignments.filter(a => !(a.workerId === workerId && a.shift === shift)) } : day), updatedAt: now() }; }
export function lockAssignmentInPlan(plan: SchedulePlan, assignmentId: string, locked: boolean): SchedulePlan { return { ...plan, days: plan.days.map(day => ({ ...day, assignments: day.assignments.map(a => a.id === assignmentId ? { ...a, locked, source: locked ? 'MANUAL' : 'AUTO', forced: locked ? a.forced : false, updatedAt: now() } : a) })), updatedAt: now() }; }
export function moveAssignmentInPlan(plan: SchedulePlan, payload: MoveAssignmentPayload): SchedulePlan { let moved: Assignment | null = null; const without = plan.days.map(day => { const found = day.assignments.find(a => a.id === payload.assignmentId); if (found) moved = found; return { ...day, assignments: day.assignments.filter(a => a.id !== payload.assignmentId) }; }); if (!moved) return plan; const source = moved as Assignment; const next = createAssignment(payload.targetDate, payload.targetShift, source.workerId, payload.forced ? 'FORCED' : 'MANUAL', true, payload.forced ?? false); if (without.some(d => d.date === payload.targetDate && d.assignments.some(a => a.workerId === next.workerId && a.shift === payload.targetShift))) return plan; return { ...plan, days: without.map(day => day.date === payload.targetDate ? { ...day, assignments: [...day.assignments, next] } : day), updatedAt: now() }; }
export function clearShiftInPlan(plan: SchedulePlan, date: string, shift: ShiftType): SchedulePlan { return { ...plan, days: plan.days.map(day => day.date === date ? { ...day, assignments: day.assignments.filter(a => a.shift !== shift) } : day), updatedAt: now() }; }
export function regenerateAutomaticKeepingManual(plan: SchedulePlan, workers: Worker[], shifts: ShiftDefinition[]): SchedulePlan { const range: ScheduleRange = { key: plan.rangeKey, mode: plan.mode, label: plan.name.replace(/^Turni\s+|^Settimana\s+/, ''), startDate: plan.startDate, endDate: plan.endDate, visibleDays: plan.days.length, anchorDate: plan.startDate }; return generatePlan({ range, workers, shifts, previousPlan: plan, absences: plan.absences, holidays: plan.holidays }); }
export function planPenalty(plan: SchedulePlan, workers: Worker[], shifts: ShiftDefinition[]): number { const issues = validatePlan(plan, workers, shifts); let penalty = 0; for (const issue of issues) { penalty += issue.severity === 'ERROR' ? 1000 : issue.severity === 'WARNING' ? 120 : 10; if (issue.title.includes('scoperto')) penalty += 1500; } const hours = workers.map(w => countWorkerHours(plan, w.id, shifts)); const avg = hours.reduce((s, v) => s + v, 0) / Math.max(hours.length, 1); penalty += hours.reduce((s, v) => s + Math.abs(v - avg) * 3, 0); const nights = workers.map(w => countWorkerShift(plan, w.id, 'NOTTE')); const avgN = nights.reduce((s, v) => s + v, 0) / Math.max(nights.length, 1); penalty += nights.reduce((s, v) => s + Math.abs(v - avgN) * 40, 0); return Math.round(penalty); }
function rotate<T>(items: T[], offset: number): T[] { if (!items.length) return items; const clean = offset % items.length; return [...items.slice(clean), ...items.slice(0, clean)]; }
export function optimizePlan(plan: SchedulePlan, workers: Worker[], shifts: ShiftDefinition[], attempts = 80): { plan: SchedulePlan; optimizer: OptimizerResult; issues: ValidationIssue[] } { let bestPlan = plan; let bestScore = planPenalty(plan, workers, shifts); const range: ScheduleRange = { key: plan.rangeKey, mode: plan.mode, label: plan.name.replace(/^Turni\s+|^Settimana\s+/, ''), startDate: plan.startDate, endDate: plan.endDate, visibleDays: plan.days.length, anchorDate: plan.startDate }; for (let i = 0; i < attempts; i++) { const candidate = generatePlan({ range, workers: rotate(workers, i), shifts: rotate(shifts, i), previousPlan: plan, absences: plan.absences, holidays: plan.holidays, prioritizeNights: true }); const score = planPenalty(candidate, workers, shifts); if (score < bestScore) { bestPlan = candidate; bestScore = score; } } const issues = validatePlan(bestPlan, workers, shifts); return { plan: { ...bestPlan, updatedAt: now() }, issues, optimizer: { score: bestScore, attempts, errors: issues.filter(i => i.severity === 'ERROR').length, warnings: issues.filter(i => i.severity === 'WARNING').length } }; }
export function calculateWorkerStats(plan: SchedulePlan | null, workers: Worker[], shifts: ShiftDefinition[]): import('../models/turni.models').WorkerStats[] { if (!plan) return []; return workers.map(w => { const items = assignmentsForWorker(plan, w.id); const ore = items.reduce((s, a) => s + getShift(shifts, a.shift).hours, 0); return { workerId: w.id, name: w.name, initials: w.initials, color: w.color, turni: items.length, ore, notti: items.filter(a => a.shift === 'NOTTE').length, weekend: items.filter(a => MomentDateUtils.isWeekend(a.date)).length, festivi: items.filter(a => isHoliday(a.date, plan.holidays)).length, manuali: items.filter(a => a.source === 'MANUAL').length, forzati: items.filter(a => a.source === 'FORCED').length, completamento: Math.min(100, Math.round((ore / Math.max((w.contract?.monthlyTargetHours ?? w.weeklyHours * 4), 1)) * 100)) }; }); }
