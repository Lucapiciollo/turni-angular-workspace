import { Injectable } from '@angular/core';
import { AuditLog, OptimizerResult, SchedulePlan, ScheduleRange, ValidationIssue, Worker } from '../models/turni.models';
import { createIssues, createPlanForRange, mockAudits, mockOptimizer, mockWorkers } from '../utils/mock-data';
import { DateRangeUtils } from '../utils/date-range.utils';
export interface PersistedTurniState { workers: Worker[]; planCache: Record<string, SchedulePlan>; currentRange: ScheduleRange; issues: ValidationIssue[]; audits: AuditLog[]; optimizer: OptimizerResult; }
@Injectable({ providedIn: 'root' })
export class MockTurniApiService {
  private readonly storageKey = 'turni-workforce-state-v5';
  load(): PersistedTurniState {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) { try { return JSON.parse(stored) as PersistedTurniState; } catch { localStorage.removeItem(this.storageKey); } }
    const range = DateRangeUtils.currentRange('MONTH'); const plan = createPlanForRange(range); const issues = createIssues(plan);
    return { workers: mockWorkers, planCache: { [range.key]: plan }, currentRange: range, issues, audits: mockAudits, optimizer: { ...mockOptimizer, errors: issues.filter(i => i.severity === 'ERROR').length, warnings: issues.filter(i => i.severity === 'WARNING').length } };
  }
  persist(state: PersistedTurniState): void { localStorage.setItem(this.storageKey, JSON.stringify(state)); }
  clear(): void { localStorage.removeItem(this.storageKey); }
}
