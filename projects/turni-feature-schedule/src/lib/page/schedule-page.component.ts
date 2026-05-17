import { Component, OnInit, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { DaySchedule, RangeMode, ScheduleRange, ShiftType, TurniFacade, Worker } from '@turni/data-access';

@Component({ selector: 'turni-schedule-page', templateUrl: './schedule-page.component.html', styleUrls: ['./schedule-page.component.scss'] })
export class SchedulePageComponent implements OnInit {
  public facade: TurniFacade = inject(TurniFacade);
  days$!: Observable<DaySchedule[]>;
  workers$!: Observable<Worker[]>;
  workerMap$!: Observable<Map<string, Worker>>;
  currentRange$ = this.facade.currentRange$;
  rangeKeys$ = this.facade.rangeKeys$;
  plan$ = this.facade.plan$;

  shifts: Array<{type: ShiftType; label: string; time: string; required: number}> = [
    {type:'MATTINA',label:'Mattina',time:'06:00–14:00', required: 2},
    {type:'POMERIGGIO',label:'Pomeriggio',time:'14:00–22:00', required: 2},
    {type:'NOTTE',label:'Notte',time:'22:00–06:00', required: 1}
  ];

  selected: Record<string,string> = {};

  ngOnInit(): void {
    this.facade.load();
    this.days$ = this.facade.days$;
    this.workers$ = this.facade.workers$;
    this.workerMap$ = this.workers$.pipe(map(ws => new Map(ws.map(w => [w.id, w]))));
  }

  setMode(mode: RangeMode): void { this.facade.setRangeMode(mode); }
  previous(): void { this.facade.previousRange(); }
  next(): void { this.facade.nextRange(); }
  assign(date: string, shift: ShiftType): void {
    const key = `${date}_${shift}`;
    const workerId = this.selected[key];
    if (workerId) {
      this.facade.assignWorker(date, shift, workerId);
      this.selected[key] = '';
    }
  }
  force(date: string, shift: ShiftType): void {
    const key = `${date}_${shift}`;
    const workerId = this.selected[key];
    if (workerId) {
      this.facade.assignWorker(date, shift, workerId, true);
      this.selected[key] = '';
    }
  }
  worker(map: Map<string, Worker>, id: string): Worker | undefined { return map.get(id); }
  assignmentsCount(day: DaySchedule, shift: ShiftType): number { return day.assignments.filter(a => a.shift === shift).length; }
  isCurrentMode(range: ScheduleRange | null, mode: RangeMode): boolean { return range?.mode === mode; }
}
