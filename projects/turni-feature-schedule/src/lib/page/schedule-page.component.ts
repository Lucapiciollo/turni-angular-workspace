import { Component, OnInit } from '@angular/core';
import { Observable, combineLatest, map } from 'rxjs';
import { DaySchedule, ShiftType, TurniFacade, Worker } from '@turni/data-access';

@Component({ selector: 'turni-schedule-page', templateUrl: './schedule-page.component.html', styleUrls: ['./schedule-page.component.scss'] })
export class SchedulePageComponent implements OnInit {
  days$!: Observable<DaySchedule[]>; workers$!: Observable<Worker[]>; workerMap$!: Observable<Map<string, Worker>>;
  shifts: Array<{type: ShiftType; label: string; time: string}> = [{type:'MATTINA',label:'Mattina',time:'06:00–14:00'}, {type:'POMERIGGIO',label:'Pomeriggio',time:'14:00–22:00'}, {type:'NOTTE',label:'Notte',time:'22:00–06:00'}];
  selected: Record<string,string> = {};
  constructor(public facade: TurniFacade) {}
  ngOnInit(): void { this.facade.load(); this.days$ = this.facade.days$; this.workers$ = this.facade.workers$; this.workerMap$ = this.workers$.pipe(map(ws => new Map(ws.map(w => [w.id, w])))); }
  assign(date: string, shift: ShiftType): void { const workerId = this.selected[`${date}_${shift}`]; if(workerId) this.facade.assignWorker(date, shift, workerId); }
  worker(map: Map<string, Worker>, id: string): Worker | undefined { return map.get(id); }
}
