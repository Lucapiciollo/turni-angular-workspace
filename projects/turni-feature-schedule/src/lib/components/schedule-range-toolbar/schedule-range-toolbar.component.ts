import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DateRange, RangeMode } from '@turni/data-access';

@Component({
    standalone: false,
    selector: 'turni-schedule-range-toolbar',
    templateUrl: './schedule-range-toolbar.component.html',
    styleUrls: ['./schedule-range-toolbar.component.scss'],
})
export class ScheduleRangeToolbarComponent {
    @Input() mode: RangeMode = 'MONTH';
    @Input() range: DateRange | null = null;
    @Input() generatedAtLabel = '-';
    @Input() generationSeed = 0;
    @Input() isPastRange = false;
    @Input() source = 'GENERATED';
    @Input() cacheKey = '-';
    @Input() generating = false;
    @Input() generationProgress = 0;
    @Input() generationCurrentDate: string | null = null;

    @Output() modeChange = new EventEmitter<RangeMode>();
    @Output() previousRange = new EventEmitter<void>();
    @Output() nextRange = new EventEmitter<void>();
    @Output() refreshRange = new EventEmitter<void>();
    @Output() refreshStrongRange = new EventEmitter<void>();
    @Output() clearCacheRange = new EventEmitter<void>();

    @Output() clearCurrentPeriodCache = new EventEmitter<void>();

    @Output() exportPdf = new EventEmitter<void>();
    @Output() viewGrid = new EventEmitter<void>();
    @Output() cancelGeneration = new EventEmitter<void>();
}
