import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, combineLatest, map } from 'rxjs';
import {
  Assignment,
  DaySchedule,
  SchedulePlan,
  ShiftType,
  TurniFacade,
  ValidationIssue,
  Worker,
} from '@turni/data-access';

interface ManualEditVm {
  plan: SchedulePlan | null;
  day?: DaySchedule;
  assignments: Assignment[];
  issues: ValidationIssue[];
  workers: Worker[];
  workerMap: Map<string, Worker>;
  date: string;
  shift: ShiftType;
}

@Component({
  selector: 'turni-manual-edit-page',
  templateUrl: './manual-edit-page.component.html',
  styleUrls: ['./manual-edit-page.component.scss'],
})
export class ManualEditPageComponent implements OnInit {
  public facade: TurniFacade = inject(TurniFacade);

  private route: ActivatedRoute = inject(ActivatedRoute);
  private router: Router = inject(Router);

  public vm$!: Observable<ManualEditVm>;
  public selectedWorkerId = '';

  public ngOnInit(): void {
    this.facade.load();

    this.vm$ = combineLatest([
      this.facade.plan$,
      this.facade.days$,
      this.facade.workers$,
      this.facade.issues$,
      this.route.paramMap,
    ]).pipe(
      map(([plan, days, workers, issues, params]) => {
        const date = params.get('date') ?? '2026-05-15';
        const shift = (params.get('shift') ?? 'NOTTE') as ShiftType;
        const day = days.find((item) => item.date === date);
        const assignments = day?.assignments.filter(
          (assignment) => assignment.shift === shift,
        ) ?? [];
        const shiftIssues = issues.filter(
          (issue) => issue.date === date && issue.shift === shift,
        );

        return {
          plan,
          day,
          assignments,
          issues: shiftIssues,
          workers,
          workerMap: new Map(workers.map((worker) => [worker.id, worker])),
          date,
          shift,
        };
      }),
    );
  }

  public add(date: string, shift: ShiftType, forced = false): void {
    if (!this.selectedWorkerId) {
      return;
    }

    this.facade.assignWorker(
      date,
      shift,
      this.selectedWorkerId,
      forced,
    );
    this.selectedWorkerId = '';
  }

  public remove(assignment: Assignment): void {
    this.facade.removeWorker(
      assignment.date,
      assignment.shift,
      assignment.workerId,
    );
  }

  public clear(date: string, shift: ShiftType): void {
    this.facade.clearShift(date, shift);
  }

  public toggleLock(assignment: Assignment): void {
    if (assignment.locked) {
      this.facade.unlock(assignment.id);
      return;
    }

    this.facade.lock(assignment.id);
  }

  public changeWorker(assignment: Assignment, workerId: string): void {
    if (!workerId || assignment.workerId === workerId) {
      return;
    }

    this.facade.removeWorker(
      assignment.date,
      assignment.shift,
      assignment.workerId,
    );
    this.facade.assignWorker(
      assignment.date,
      assignment.shift,
      workerId,
    );
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

  public backToSchedule(): void {
    void this.router.navigate(['/piano-turni']);
  }

  public worker(
    map: Map<string, Worker>,
    workerId: string,
  ): Worker | undefined {
    return map.get(workerId);
  }

  public shiftTime(shift: ShiftType): string {
    if (shift === 'MATTINA') {
      return '06:00–14:00';
    }

    if (shift === 'POMERIGGIO') {
      return '14:00–22:00';
    }

    return '22:00–06:00';
  }

  public sourceClass(assignment: Assignment): string {
    return assignment.source.toLowerCase();
  }

  public isEditable(plan: SchedulePlan | null): boolean {
    return !!plan && plan.status !== 'PUBLISHED' && plan.status !== 'ARCHIVED';
  }

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  public trackAssignment(_: number, assignment: Assignment): string {
    return assignment.id;
  }

  public trackIssue(_: number, issue: ValidationIssue): string {
    return issue.id;
  }
}
