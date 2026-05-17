import { Component, OnInit } from '@angular/core';
import { ScheduleStateService } from '@turni/data-access';

@Component({
    selector: 'turni-piano-turni-page',
    templateUrl: './piano-turni-page.component.html',
    styleUrls: ['./piano-turni-page.component.scss'],
})
export class PianoTurniPageComponent implements OnInit {
    constructor(
        public scheduleState: ScheduleStateService
    ) {}

    ngOnInit(): void {
        this.scheduleState.init();
    }
}
