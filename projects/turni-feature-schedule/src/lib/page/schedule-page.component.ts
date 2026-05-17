import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, combineLatest, firstValueFrom, map } from 'rxjs';
import {
  Assignment,
  DaySchedule,
  RangeMode,
  ScheduleExportService,
  SchedulePlan,
  ScheduleRange,
  ShiftType,
  TurniFacade,
  Worker,
} from '@turni/data-access';

interface ScheduleShiftView {
  type: ShiftType;
  label: string;
  time: string;
  required: number;
}

interface AssignmentDragData {
  assignmentId: string;
  sourceDate: string;
  sourceShift: ShiftType;
  workerId: string;
}

@Component({
  selector: 'turni-schedule-page',
  templateUrl: './schedule-page.component.html',
  styleUrls: ['./schedule-page.component.scss'],
})
export class SchedulePageComponent implements OnInit {
  public facade: TurniFacade = inject(TurniFacade);

  private router: Router = inject(Router);
  private exporter: ScheduleExportService = inject(ScheduleExportService);

  public days$!: Observable<DaySchedule[]>;
  public workers$!: Observable<Worker[]>;
  public workerMap$!: Observable<Map<string, Worker>>;

  public readonly currentRange$ = this.facade.currentRange$;
  public readonly rangeKeys$ = this.facade.rangeKeys$;
  public readonly plan$ = this.facade.plan$;
  public readonly issues$ = this.facade.issues$;
  public readonly optimizer$ = this.facade.optimizer$;
  public readonly canPublish$ = this.facade.canPublish$;

  public readonly shifts: ScheduleShiftView[] = [
    {
      type: 'MATTINA',
      label: 'Mattina',
      time: '06:00–14:00',
      required: 2,
    },
    {
      type: 'POMERIGGIO',
      label: 'Pomeriggio',
      time: '14:00–22:00',
      required: 2,
    },
    {
      type: 'NOTTE',
      label: 'Notte',
      time: '22:00–06:00',
      required: 1,
    },
  ];

  public selected: Record<string, string> = {};

  public ngOnInit(): void {
    this.facade.load();
    this.days$ = this.facade.days$;
    this.workers$ = this.facade.workers$;
    this.workerMap$ = this.workers$.pipe(
      map((workers) => new Map(workers.map((worker) => [worker.id, worker]))),
    );
  }

  public setMode(mode: RangeMode): void {
    this.facade.setRangeMode(mode);
  }

  public previous(): void {
    this.facade.previousRange();
  }

  public next(): void {
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

  public openManualEdit(date: string, shift: ShiftType): void {
    void this.router.navigate(['/modifica-turno', date, shift]);
  }

  public async exportCsv(): Promise<void> {
    const [plan, workers] = await firstValueFrom(
      combineLatest([this.plan$, this.workers$]),
    );

    if (!plan) {
      return;
    }

    const csv = this.exporter.toCsv(plan, workers);
    this.exporter.download(`${plan.name}.csv`, csv);
  }

  public assign(date: string, shift: ShiftType): void {
    const workerId = this.getSelectedWorker(date, shift);

    if (!workerId) {
      return;
    }

    this.facade.assignWorker(date, shift, workerId);
    this.setSelectedWorker(date, shift, '');
  }

  public force(date: string, shift: ShiftType): void {
    const workerId = this.getSelectedWorker(date, shift);

    if (!workerId) {
      return;
    }

    this.facade.assignWorker(date, shift, workerId, true);
    this.setSelectedWorker(date, shift, '');
  }

  public changeAssignmentWorker(
    assignment: Assignment,
    newWorkerId: string,
  ): void {
    if (!newWorkerId || assignment.workerId === newWorkerId) {
      return;
    }

    this.facade.removeWorker(
      assignment.date,
      assignment.shift,
      assignment.workerId,
    );
    this.facade.assignWorker(assignment.date, assignment.shift, newWorkerId);
  }

  public removeAssignment(assignment: Assignment): void {
    this.facade.removeWorker(
      assignment.date,
      assignment.shift,
      assignment.workerId,
    );
  }

  public clearShift(date: string, shift: ShiftType): void {
    this.facade.clearShift(date, shift);
  }

  public toggleLock(assignment: Assignment): void {
    if (assignment.locked) {
      this.facade.unlock(assignment.id);
      return;
    }

    this.facade.lock(assignment.id);
  }

  public dropAssignment(
    event: CdkDragDrop<Assignment[]>,
    targetDate: string,
    targetShift: ShiftType,
  ): void {
    const data = event.item.data as AssignmentDragData | undefined;

    if (!data) {
      return;
    }

    const sameCell =
      data.sourceDate === targetDate && data.sourceShift === targetShift;

    if (sameCell) {
      return;
    }

    const forced = event.event instanceof MouseEvent && event.event.shiftKey;

    this.facade.move(
      data.assignmentId,
      targetDate,
      targetShift,
      forced,
    );
  }

  public dragData(assignment: Assignment): AssignmentDragData {
    return {
      assignmentId: assignment.id,
      sourceDate: assignment.date,
      sourceShift: assignment.shift,
      workerId: assignment.workerId,
    };
  }

  public getAssignmentsByShift(
    day: DaySchedule,
    shift: ShiftType,
  ): Assignment[] {
    return day.assignments.filter((assignment) => assignment.shift === shift);
  }

  public assignmentsCount(day: DaySchedule, shift: ShiftType): number {
    return this.getAssignmentsByShift(day, shift).length;
  }

  public worker(
    map: Map<string, Worker> | null | undefined,
    id: string,
  ): Worker | undefined {
    return map?.get(id);
  }

  public getCellKey(date: string, shift: ShiftType): string {
    return `${date}_${shift}`;
  }

  public getSelectedWorker(date: string, shift: ShiftType): string {
    return this.selected[this.getCellKey(date, shift)] ?? '';
  }

  public setSelectedWorker(
    date: string,
    shift: ShiftType,
    workerId: string,
  ): void {
    this.selected = {
      ...this.selected,
      [this.getCellKey(date, shift)]: workerId,
    };
  }

  public getDropListId(date: string, shift: ShiftType): string {
    return `drop_${date}_${shift}`;
  }

  public dropListIds(days: DaySchedule[] | null | undefined): string[] {
    if (!days?.length) {
      return [];
    }

    return days.flatMap((day) =>
      this.shifts.map((shift) => this.getDropListId(day.date, shift.type)),
    );
  }

  public isCurrentMode(
    range: ScheduleRange | null,
    mode: RangeMode,
  ): boolean {
    return range?.mode === mode;
  }

  public isEditable(plan: SchedulePlan | null): boolean {
    return !!plan && plan.status !== 'PUBLISHED' && plan.status !== 'ARCHIVED';
  }

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  public trackDay(_: number, day: DaySchedule): string {
    return day.date;
  }

  public trackAssignment(_: number, assignment: Assignment): string {
    return assignment.id;
  }
}
