import { createReducer, on } from '@ngrx/store';
import { TurniActions } from './turni.actions';
import { Assignment, AuditAction, AuditLog, OptimizerResult, SchedulePlan, ValidationIssue, Worker } from '../models/turni.models';
import { createInitialMockPlan, createIssues, optimizeMockPlan } from '../utils/mock-data';

export const turniFeatureKey = 'turni';

export interface TurniState {
  loading: boolean;
  error: string | null;
  workers: Worker[];
  plan: SchedulePlan | null;
  issues: ValidationIssue[];
  audits: AuditLog[];
  optimizer: OptimizerResult | null;
}

export const initialState: TurniState = {
  loading: false,
  error: null,
  workers: [],
  plan: null,
  issues: [],
  audits: [],
  optimizer: null
};

function id(prefix: string): string { return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`; }
function now(): string { return new Date().toISOString(); }
function audit(action: AuditAction, message: string, extra: Partial<AuditLog> = {}): AuditLog {
  return { id: id('audit'), action, message, createdAt: now(), createdBy: 'Admin', ...extra };
}
function appendAudit(state: TurniState, log: AuditLog): TurniState { return { ...state, audits: [log, ...state.audits] }; }
function withPlan(state: TurniState, plan: SchedulePlan): TurniState { return { ...state, plan: { ...plan, updatedAt: now() }, issues: createIssues(plan) }; }

export const turniReducer = createReducer(
  initialState,
  on(TurniActions.loadPlanningData, state => ({ ...state, loading: true, error: null })),
  on(TurniActions.loadPlanningDataSuccess, (state, { workers, plan, issues, audits, optimizer }) => ({ ...state, loading: false, workers, plan, issues, audits, optimizer })),
  on(TurniActions.loadPlanningDataFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(TurniActions.createPlan, (state, { name, startDate, endDate }) => {
    const plan = createInitialMockPlan(name, startDate, endDate);
    return appendAudit({ ...state, plan, issues: createIssues(plan) }, audit('CREATE_PLAN', `Creato piano ${name}`));
  }),

  on(TurniActions.assignWorker, (state, { date, shift, workerId, forced }) => {
    if (!state.plan) return state;
    const exists = state.plan.days.some(d => d.date === date && d.assignments.some(a => a.workerId === workerId && a.shift === shift));
    if (exists) return state;
    const assignment: Assignment = { id: `${date}_${shift}_${workerId}`, date, shift, workerId, locked: true, source: forced ? 'FORCED' : 'MANUAL', forced };
    const plan = { ...state.plan, days: state.plan.days.map(d => d.date === date ? { ...d, assignments: [...d.assignments, assignment] } : d) };
    return appendAudit(withPlan(state, plan), audit(forced ? 'FORCE_ASSIGNMENT' : 'ASSIGN_WORKER', `${forced ? 'Forzato' : 'Assegnato'} operatore al turno ${shift} del ${date}`, { date, shift, workerId }));
  }),

  on(TurniActions.removeWorker, (state, { date, shift, workerId }) => {
    if (!state.plan) return state;
    const plan = { ...state.plan, days: state.plan.days.map(d => d.date === date ? { ...d, assignments: d.assignments.filter(a => !(a.workerId === workerId && a.shift === shift)) } : d) };
    return appendAudit(withPlan(state, plan), audit('REMOVE_WORKER', `Rimosso operatore dal turno ${shift} del ${date}`, { date, shift, workerId }));
  }),

  on(TurniActions.lockAssignment, (state, { assignmentId }) => {
    if (!state.plan) return state;
    let found: Assignment | undefined;
    const plan = { ...state.plan, days: state.plan.days.map(d => ({ ...d, assignments: d.assignments.map(a => {
      if (a.id === assignmentId) { found = a; return { ...a, locked: true, source: 'MANUAL' as const }; }
      return a;
    }) })) };
    return appendAudit(withPlan(state, plan), audit('LOCK_ASSIGNMENT', `Bloccato turno ${found?.shift ?? ''} del ${found?.date ?? ''}`, { date: found?.date, shift: found?.shift, workerId: found?.workerId }));
  }),

  on(TurniActions.unlockAssignment, (state, { assignmentId }) => {
    if (!state.plan) return state;
    let found: Assignment | undefined;
    const plan = { ...state.plan, days: state.plan.days.map(d => ({ ...d, assignments: d.assignments.map(a => {
      if (a.id === assignmentId) { found = a; return { ...a, locked: false, source: 'AUTO' as const, forced: false }; }
      return a;
    }) })) };
    return appendAudit(withPlan(state, plan), audit('UNLOCK_ASSIGNMENT', `Sbloccato turno ${found?.shift ?? ''} del ${found?.date ?? ''}`, { date: found?.date, shift: found?.shift, workerId: found?.workerId }));
  }),

  on(TurniActions.moveAssignment, (state, { assignmentId, targetDate, targetShift, forced }) => {
    if (!state.plan) return state;
    let moved: Assignment | undefined;
    let fromDate = '';
    const daysWithout = state.plan.days.map(d => {
      const found = d.assignments.find(a => a.id === assignmentId);
      if (found) { moved = found; fromDate = d.date; }
      return { ...d, assignments: d.assignments.filter(a => a.id !== assignmentId) };
    });
    if (!moved) return state;
    const newA: Assignment = { ...moved, id: `${targetDate}_${targetShift}_${moved.workerId}`, date: targetDate, shift: targetShift, source: forced ? 'FORCED' : 'MANUAL', forced, locked: true };
    const plan = { ...state.plan, days: daysWithout.map(d => d.date === targetDate ? { ...d, assignments: [...d.assignments, newA] } : d) };
    return appendAudit(withPlan(state, plan), audit('MOVE_ASSIGNMENT', `Spostato operatore da ${fromDate} a ${targetDate}`, { date: targetDate, shift: targetShift, workerId: moved.workerId }));
  }),

  on(TurniActions.clearShift, (state, { date, shift }) => {
    if (!state.plan) return state;
    const plan = { ...state.plan, days: state.plan.days.map(d => d.date === date ? { ...d, assignments: d.assignments.filter(a => a.shift !== shift) } : d) };
    return appendAudit(withPlan(state, plan), audit('CLEAR_SHIFT', `Pulito turno ${shift} del ${date}`, { date, shift }));
  }),

  on(TurniActions.optimizePlan, state => {
    if (!state.plan) return state;
    const { plan, optimizer } = optimizeMockPlan(state.plan);
    return appendAudit({ ...withPlan(state, plan), optimizer }, audit('OPTIMIZE_PLAN', `Ottimizzato piano ${plan.name}. Score: ${optimizer.score}`));
  }),
  on(TurniActions.optimizePlanSuccess, (state, { plan, issues, optimizer }) => appendAudit({ ...state, plan, issues, optimizer }, audit('OPTIMIZE_PLAN', `Ottimizzato piano ${plan.name}. Score: ${optimizer.score}`))),
  on(TurniActions.savePlan, state => state.plan ? appendAudit({ ...state, plan: { ...state.plan, saved: true, updatedAt: now() } }, audit('SAVE_PLAN', `Salvato piano ${state.plan.name}`)) : state),
  on(TurniActions.publishPlan, state => state.plan ? appendAudit({ ...state, plan: { ...state.plan, status: 'PUBLISHED', updatedAt: now() } }, audit('PUBLISH_PLAN', `Pubblicato piano ${state.plan.name}`)) : state),
  on(TurniActions.archivePlan, state => state.plan ? appendAudit({ ...state, plan: { ...state.plan, status: 'ARCHIVED', updatedAt: now() } }, audit('SAVE_PLAN', `Archiviato piano ${state.plan.name}`)) : state),
  on(TurniActions.recalculateIssues, state => state.plan ? { ...state, issues: createIssues(state.plan) } : state),
  on(TurniActions.auditAdded, (state, { log }) => appendAudit(state, log))
);
