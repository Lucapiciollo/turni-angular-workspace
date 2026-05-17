import { Component, OnInit } from '@angular/core';
import { ScheduleStateService } from '@turni/data-access';

@Component({
    selector: 'turni-schedule-stats-page',
    templateUrl: './schedule-stats-page.component.html',
    styleUrls: ['./schedule-stats-page.component.scss'],
})
export class ScheduleStatsPageComponent implements OnInit {
    constructor(
        public scheduleState: ScheduleStateService
    ) {}

    ngOnInit(): void {
        this.scheduleState.init();
    }
}
