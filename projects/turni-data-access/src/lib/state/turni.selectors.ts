import { createFeatureSelector, createSelector } from '@ngrx/store';
import { turniFeatureKey, TurniState } from './turni.reducer';
import { WorkerStats } from '../models/turni.models';

export const selectTurniState = createFeatureSelector<TurniState>(turniFeatureKey);
export const selectLoading = createSelector(selectTurniState, s => s.loading);
export const selectWorkers = createSelector(selectTurniState, s => s.workers);
export const selectPlan = createSelector(selectTurniState, s => s.plan);
export const selectDays = createSelector(selectPlan, p => p?.days ?? []);
export const selectIssues = createSelector(selectTurniState, s => s.issues);
export const selectAudits = createSelector(selectTurniState, s => s.audits);
export const selectOptimizer = createSelector(selectTurniState, s => s.optimizer);
export const selectErrors = createSelector(selectIssues, i => i.filter(x => x.severity === 'ERROR'));
export const selectWarnings = createSelector(selectIssues, i => i.filter(x => x.severity === 'WARNING'));
export const selectInfos = createSelector(selectIssues, i => i.filter(x => x.severity === 'INFO'));
export const selectCanPublish = createSelector(selectPlan, selectErrors, (p, e) => !!p && p.status === 'DRAFT' && e.length === 0);

export const selectWorkerMap = createSelector(selectWorkers, workers => new Map(workers.map(w => [w.id, w])));
export const selectWorkerStats = createSelector(selectWorkers, selectDays, (workers, days): WorkerStats[] => {
  return workers.map(w => {
    const assignments = days.flatMap(d => d.assignments.map(a => ({ ...a, badges: d.badges })) ).filter(a => a.workerId === w.id);
    const turni = assignments.length;
    const ore = turni * 8;
    const notti = assignments.filter(a => a.shift === 'NOTTE').length;
    const weekend = assignments.filter(a => a.badges.includes('Weekend')).length;
    const manuali = assignments.filter(a => a.source !== 'AUTO').length;
    return { workerId: w.id, name: w.name, initials: w.initials, color: w.color, turni, ore, notti, weekend, manuali, completamento: Math.min(100, Math.round((ore / Math.max(w.weeklyHours*4, 1)) * 100)) };
  });
});
