import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
    ScheduleNavigationExtras,
    TurniFacade,
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
        public turniFacade: TurniFacade,
        private activatedRoute: ActivatedRoute
    ) {}

    ngOnInit(): void {
        this.turniFacade.ensureInitialized();

        const navigationExtras = this.getNavigationExtras();

        this.turniFacade.selectWorker(navigationExtras.workerId ?? null);

        if (navigationExtras.workerId) {
            this.turniFacade.setWarningFilter(
                this.getWarningFilter(navigationExtras)
            );
            this.turniFacade.setStatsFilter('ALL');
            return;
        }

        this.turniFacade.setStatsFilter(
            this.getStatsFilter(navigationExtras)
        );
        this.turniFacade.setWarningFilter('ALL');
    }

    setStatsFilter(filter: StatsFilterType): void {
        this.turniFacade.setStatsFilter(filter);
    }

    setWarningFilter(filter: WarningFilterType): void {
        this.turniFacade.setWarningFilter(filter);
    }

    clearWorkerFilter(): void {
        this.turniFacade.selectWorker(null);
        this.turniFacade.setWarningFilter('ALL');
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
