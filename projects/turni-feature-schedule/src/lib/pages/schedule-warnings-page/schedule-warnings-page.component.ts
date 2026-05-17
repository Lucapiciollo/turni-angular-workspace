import { Component, OnInit } from '@angular/core';
import { ScheduleStateService } from '@turni/data-access';

@Component({
    selector: 'turni-schedule-warnings-page',
    templateUrl: './schedule-warnings-page.component.html',
    styleUrls: ['./schedule-warnings-page.component.scss'],
})
export class ScheduleWarningsPageComponent implements OnInit {
    constructor(
        public scheduleState: ScheduleStateService
    ) {}

    ngOnInit(): void {
        this.scheduleState.init();
    }
}
