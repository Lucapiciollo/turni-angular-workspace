import { Injectable } from '@angular/core';
import { AuditLog, OptimizerResult, SchedulePlan, ValidationIssue, Worker } from '../models/turni.models';
import { createInitialMockPlan, createIssues, mockAudits, mockWorkers } from '../utils/mock-data';

@Injectable({ providedIn: 'root' })
export class MockTurniApiService {
  load(): { workers: Worker[]; plan: SchedulePlan; issues: ValidationIssue[]; audits: AuditLog[]; optimizer: OptimizerResult } {
    const stored = localStorage.getItem('turni-workforce-state');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as { plan: SchedulePlan; audits: AuditLog[] };
        return { workers: mockWorkers, plan: parsed.plan, issues: createIssues(parsed.plan), audits: parsed.audits, optimizer: { score: 450, attempts: 250, errors: 1, warnings: 4 } };
      } catch { /* fallback */ }
    }
    const plan = createInitialMockPlan('Turni Maggio 2026', '2026-05-01', '2026-05-31');
    return { workers: mockWorkers, plan, issues: createIssues(plan), audits: mockAudits, optimizer: { score: 450, attempts: 250, errors: 1, warnings: 4 } };
  }

  persist(plan: SchedulePlan | null, audits: AuditLog[]): void {
    if (!plan) return;
    localStorage.setItem('turni-workforce-state', JSON.stringify({ plan, audits }));
  }
}
