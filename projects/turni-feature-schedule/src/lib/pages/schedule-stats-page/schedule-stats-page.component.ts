import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
    ScheduleNavigationExtras,
    ScheduleStateService,
    StatsFilterType,
    WarningFilterType,
} from '@turni/data-access';

@Component({
    standalone: false,
    selector: 'turni-schedule-stats-page',
    templateUrl: './schedule-stats-page.component.html',
    styleUrls: ['./schedule-stats-page.component.scss'],
})
export class ScheduleStatsPageComponent implements OnInit {
    readonly statsFilters: Array<{
        label: string;
        value: StatsFilterType;
    }> = [
        {
            label: 'Tutti',
            value: 'ALL',
        },
        {
            label: 'Forzati',
            value: 'FORCED',
        },
        {
            label: 'Extra',
            value: 'EXTRA',
        },
        {
            label: 'Sotto ore',
            value: 'UNDER_HOURS',
        },
        {
            label: 'No WE libero',
            value: 'NO_FREE_WEEKEND',
        },
    ];

    readonly warningFilters: Array<{
        label: string;
        value: WarningFilterType;
    }> = [
        {
            label: 'Tutti',
            value: 'ALL',
        },
        {
            label: 'Errori',
            value: 'ERROR',
        },
        {
            label: 'Warning',
            value: 'WARNING',
        },
        {
            label: 'Info',
            value: 'INFO',
        },
        {
            label: 'Forzature',
            value: 'FORCED',
        },
    ];

    constructor(
        public scheduleState: ScheduleStateService,
        private activatedRoute: ActivatedRoute
    ) {}

    ngOnInit(): void {
        this.scheduleState.init();

        const navigationExtras = this.getNavigationExtras();

        this.scheduleState.selectWorker(navigationExtras.workerId ?? null);

        if (navigationExtras.workerId) {
            this.scheduleState.setWarningFilter(
                this.getWarningFilter(navigationExtras)
            );
            this.scheduleState.setStatsFilter('ALL');
            return;
        }

        this.scheduleState.setStatsFilter(
            this.getStatsFilter(navigationExtras)
        );
        this.scheduleState.setWarningFilter('ALL');
    }

    setStatsFilter(filter: StatsFilterType): void {
        this.scheduleState.setStatsFilter(filter);
    }

    setWarningFilter(filter: WarningFilterType): void {
        this.scheduleState.setWarningFilter(filter);
    }

    clearWorkerFilter(): void {
        this.scheduleState.selectWorker(null);
        this.scheduleState.setWarningFilter('ALL');
    }

    private getNavigationExtras(): ScheduleNavigationExtras {
        return this.activatedRoute.snapshot.data['navigationExtras'] as ScheduleNavigationExtras;
    }

    private getStatsFilter(
        navigationExtras: ScheduleNavigationExtras
    ): StatsFilterType {
        const filter = navigationExtras.statsFilter ?? navigationExtras.filter;

        if (
            filter === 'FORCED'
            || filter === 'EXTRA'
            || filter === 'UNDER_HOURS'
            || filter === 'NO_FREE_WEEKEND'
            || filter === 'ALL'
        ) {
            return filter;
        }

        return 'ALL';
    }

    private getWarningFilter(
        navigationExtras: ScheduleNavigationExtras
    ): WarningFilterType {
        const filter = navigationExtras.warningFilter ?? navigationExtras.filter;

        if (
            filter === 'ERROR'
            || filter === 'WARNING'
            || filter === 'INFO'
            || filter === 'FORCED'
            || filter === 'ALL'
        ) {
            return filter;
        }

        return 'ALL';
    }
}
