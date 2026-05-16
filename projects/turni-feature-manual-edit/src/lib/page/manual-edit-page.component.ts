import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, combineLatest, map } from 'rxjs';
import { Assignment, DaySchedule, ShiftType, TurniFacade, Worker } from '@turni/data-access';
@Component({ selector:'turni-manual-edit-page', templateUrl:'./manual-edit-page.component.html', styleUrls:['./manual-edit-page.component.scss'] })
export class ManualEditPageComponent implements OnInit {
  vm$!: Observable<{ day?: DaySchedule; assignments: Assignment[]; workers: Worker[]; workerMap: Map<string, Worker>; date: string; shift: ShiftType }>;
  selected = '';
  constructor(public facade: TurniFacade, private route: ActivatedRoute) {}
  ngOnInit(): void { this.facade.load(); this.vm$ = combineLatest([this.facade.days$, this.facade.workers$, this.route.paramMap]).pipe(map(([days, workers, params]) => { const date = params.get('date') ?? '2026-05-15'; const shift = (params.get('shift') ?? 'NOTTE') as ShiftType; const day = days.find(d => d.date === date); return { day, assignments: day?.assignments.filter(a => a.shift === shift) ?? [], workers, workerMap: new Map(workers.map(w=>[w.id,w])), date, shift }; })); }
  add(date: string, shift: ShiftType, forced=false): void { if(this.selected) this.facade.assignWorker(date, shift, this.selected, forced); }
}
