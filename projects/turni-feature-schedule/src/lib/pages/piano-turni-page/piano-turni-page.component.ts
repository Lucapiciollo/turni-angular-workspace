import { Component, OnInit } from '@angular/core';
import { ScheduleStateService } from '@turni/data-access';

@Component({
    standalone: false,
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

    scrollToSection(sectionId: string): void {
        const element = document.getElementById(sectionId);

        if (!element) {
            return;
        }

        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    }
}
