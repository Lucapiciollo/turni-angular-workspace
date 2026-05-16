import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AuditLog, OptimizerResult, SchedulePlan, TurniFacade, ValidationIssue, WorkerStats } from '@turni/data-access';

@Component({ selector: 'turni-dashboard-page', templateUrl: './dashboard-page.component.html', styleUrls: ['./dashboard-page.component.scss'] })
export class DashboardPageComponent implements OnInit {
  plan$!: Observable<SchedulePlan | null>; stats$!: Observable<WorkerStats[]>; issues$!: Observable<ValidationIssue[]>; optimizer$!: Observable<OptimizerResult | null>;
  constructor(public facade: TurniFacade) {}
  ngOnInit(): void { this.facade.load(); this.plan$ = this.facade.plan$; this.stats$ = this.facade.stats$; this.issues$ = this.facade.issues$; this.optimizer$ = this.facade.optimizer$; }
  generate(): void { this.facade.createPlan('Turni Maggio 2026','2026-05-01','2026-05-31'); }
}
