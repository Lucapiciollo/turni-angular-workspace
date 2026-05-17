import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, combineLatest, firstValueFrom, map } from 'rxjs';
import {
  OptimizerResult,
  RangeMode,
  ScheduleExportService,
  SchedulePlan,
  ScheduleRange,
  TurniFacade,
  ValidationIssue,
  Worker,
  WorkerStats,
} from '@turni/data-access';

interface DashboardVm {
  plan: SchedulePlan | null;
  plans: SchedulePlan[];
  stats: WorkerStats[];
  issues: ValidationIssue[];
  optimizer: OptimizerResult | null;
  workers: Worker[];
  currentRange: ScheduleRange | null;
  errorCount: number;
  warningCount: number;
  infoCount: number;
}

@Component({
  selector: 'turni-dashboard-page',
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.scss'],
})
export class DashboardPageComponent implements OnInit {
  public facade: TurniFacade = inject(TurniFacade);

  private exporter: ScheduleExportService = inject(ScheduleExportService);
  private router: Router = inject(Router);

  public vm$!: Observable<DashboardVm>;

  public planName = 'Turni Maggio 2026';
  public startDate = '2026-05-01';
  public endDate = '2026-05-31';

  public ngOnInit(): void {
    this.facade.load();

    this.vm$ = combineLatest({
      plan: this.facade.plan$,
      plans: this.facade.planCache$.pipe(
        map((cache) => Object.values(cache)),
      ),
      stats: this.facade.stats$,
      issues: this.facade.issues$,
      optimizer: this.facade.optimizer$,
      workers: this.facade.workers$,
      currentRange: this.facade.currentRange$,
    }).pipe(
      map((value) => ({
        ...value,
        errorCount: value.issues.filter((issue) => issue.severity === 'ERROR').length,
        warningCount: value.issues.filter((issue) => issue.severity === 'WARNING').length,
        infoCount: value.issues.filter((issue) => issue.severity === 'INFO').length,
      })),
    );
  }

  public generate(): void {
    this.facade.createPlan(
      this.planName,
      this.startDate,
      this.endDate,
    );
  }

  public setMode(mode: RangeMode): void {
    this.facade.setRangeMode(mode);
  }

  public previousRange(): void {
    this.facade.previousRange();
  }

  public nextRange(): void {
    this.facade.nextRange();
  }

  public regenerate(): void {
    this.facade.regenerateCurrentRange();
  }

  public optimize(): void {
    this.facade.optimize();
  }

  public save(): void {
    this.facade.save();
  }

  public publish(): void {
    this.facade.publish();
  }

  public archive(): void {
    this.facade.archive();
  }

  public openSchedule(): void {
    void this.router.navigate(['/piano-turni']);
  }

  public openValidation(): void {
    void this.router.navigate(['/validazioni']);
  }

  public openAudit(): void {
    void this.router.navigate(['/audit']);
  }

  public openManualEdit(issue: ValidationIssue): void {
    if (!issue.date || !issue.shift) {
      this.openValidation();
      return;
    }

    void this.router.navigate(['/modifica-turno', issue.date, issue.shift]);
  }

  public openPlan(plan: SchedulePlan): void {
    this.facade.openRange(this.toRange(plan));
    this.openSchedule();
  }

  public isCurrentPlan(plan: SchedulePlan, current: SchedulePlan | null): boolean {
    return !!current && current.id === plan.id;
  }

  public async exportCsv(): Promise<void> {
    const vm = await firstValueFrom(this.vm$);

    if (!vm.plan) {
      return;
    }

    const csv = this.exporter.toCsv(vm.plan, vm.workers);
    this.exporter.download(`${vm.plan.name}.csv`, csv);
  }

  public async exportIssues(): Promise<void> {
    const vm = await firstValueFrom(this.vm$);
    const csv = this.exporter.issuesToCsv(vm.issues);

    this.exporter.download('validazioni-turni.csv', csv);
  }

  public async exportStats(): Promise<void> {
    const vm = await firstValueFrom(this.vm$);
    const csv = this.exporter.statsToCsv(vm.stats);

    this.exporter.download('statistiche-operatori.csv', csv);
  }

  public visibleIssues(issues: ValidationIssue[]): ValidationIssue[] {
    return issues.slice(0, 5);
  }

  public statusClass(plan: SchedulePlan | null): string {
    return plan?.status.toLowerCase() ?? 'draft';
  }

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  public trackPlan(_: number, plan: SchedulePlan): string {
    return plan.id;
  }

  public trackIssue(_: number, issue: ValidationIssue): string {
    return issue.id;
  }

  public trackStat(_: number, stat: WorkerStats): string {
    return stat.workerId;
  }

  private toRange(plan: SchedulePlan): ScheduleRange {
    return {
      key: plan.rangeKey,
      mode: plan.mode,
      label: plan.name,
      startDate: plan.startDate,
      endDate: plan.endDate,
      visibleDays: plan.days.length,
      anchorDate: plan.startDate,
    };
  }
}
