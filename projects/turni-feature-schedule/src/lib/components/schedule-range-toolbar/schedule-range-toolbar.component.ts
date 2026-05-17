import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DateRange, RangeMode } from '@turni/data-access';

@Component({
    selector: 'turni-schedule-range-toolbar',
    templateUrl: './schedule-range-toolbar.component.html',
    styleUrls: ['./schedule-range-toolbar.component.scss'],
})
export class ScheduleRangeToolbarComponent {
    @Input() mode: RangeMode = 'MONTH';
    @Input() range: DateRange | null = null;

    @Output() modeChange = new EventEmitter<RangeMode>();
    @Output() previousRange = new EventEmitter<void>();
    @Output() nextRange = new EventEmitter<void>();
    @Output() refreshRange = new EventEmitter<void>();

    isCurrentMode(mode: RangeMode): boolean {
        return this.mode === mode;
    }
}
