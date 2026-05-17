import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';

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
    ],
    imports: [
        CommonModule,
        RouterModule,
        MatTooltipModule,
    ],
    exports: [
        CommonModule,
        RouterModule,
        MatTooltipModule,
        OperatorStatsCardComponent,
        ScheduleRangeToolbarComponent,
        ScheduleTableComponent,
        WarningListComponent,
        WorkerPillComponent,
    ],
})
export class TurniScheduleSharedModule {}
