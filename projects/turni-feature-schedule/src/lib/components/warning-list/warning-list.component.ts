import { Component, Input } from '@angular/core';
import { ScheduleWarning } from '@turni/data-access';

@Component({
    standalone: false,
    selector: 'turni-warning-list',
    templateUrl: './warning-list.component.html',
    styleUrls: ['./warning-list.component.scss'],
})
export class WarningListComponent {
    @Input() warnings: ScheduleWarning[] = [];

    trackByWarning(
        index: number,
        warning: ScheduleWarning
    ): string {
        return warning.id;
    }
}
