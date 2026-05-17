import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
    ScheduleNavigationExtras,
    TurniFacade,
    WarningFilterType,
} from '@turni/data-access';

@Component({
    standalone: false,
    selector: 'turni-schedule-warnings-page',
    templateUrl: './schedule-warnings-page.component.html',
    styleUrls: ['./schedule-warnings-page.component.scss'],
})
export class ScheduleWarningsPageComponent implements OnInit {
    readonly filters: Array<{
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
        this.turniFacade.setWarningFilter(
            this.getWarningFilter(navigationExtras)
        );
    }

    setFilter(filter: WarningFilterType): void {
        this.turniFacade.setWarningFilter(filter);
    }

    clearWorkerFilter(): void {
        this.turniFacade.selectWorker(null);
    }

    private getNavigationExtras(): ScheduleNavigationExtras {
        return this.activatedRoute.snapshot.data['navigationExtras'] as ScheduleNavigationExtras;
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
