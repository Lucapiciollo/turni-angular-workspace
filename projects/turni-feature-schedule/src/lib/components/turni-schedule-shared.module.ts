import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TurniSharedModule } from '@turni/shared';

import { CloseTooltipsOnScrollDirective } from '../directives/close-tooltips-on-scroll.directive';
import { LongShiftDialogComponent } from './long-shift-dialog/long-shift-dialog.component';
import { OperatorStatsCardComponent } from './operator-stats-card/operator-stats-card.component';
import { ScheduleRangeToolbarComponent } from './schedule-range-toolbar/schedule-range-toolbar.component';
import { ScheduleTableComponent } from './schedule-table/schedule-table.component';
import { WarningListComponent } from './warning-list/warning-list.component';
import { WorkerPillComponent } from './worker-pill/worker-pill.component';

@NgModule({
    declarations: [
        OperatorStatsCardComponent,
        ScheduleRangeToolbarComponent,
        ScheduleTableComponent,
        WarningListComponent,
        WorkerPillComponent,
        CloseTooltipsOnScrollDirective,
        LongShiftDialogComponent,
    ],
    imports: [
        RouterModule,
        TurniSharedModule,
    ],
    exports: [
        RouterModule,
        TurniSharedModule,
        OperatorStatsCardComponent,
        ScheduleRangeToolbarComponent,
        ScheduleTableComponent,
        WarningListComponent,
        WorkerPillComponent,
        CloseTooltipsOnScrollDirective,
        LongShiftDialogComponent,
    ],
})
export class TurniScheduleSharedModule {}
