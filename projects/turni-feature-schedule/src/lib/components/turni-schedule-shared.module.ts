import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TurniSharedModule } from '@turni/shared';

import { CloseTooltipsOnScrollDirective } from '../directives/close-tooltips-on-scroll.directive';
import { LongShiftDialogComponent } from './long-shift-dialog/long-shift-dialog.component';
import { ManualAssignmentDialogComponent } from './manual-assignment-dialog/manual-assignment-dialog.component';
import { OperatorStatsCardComponent } from './operator-stats-card/operator-stats-card.component';
import { ScheduleGridViewComponent } from './schedule-grid-view/schedule-grid-view.component';
import { ScheduleRangeToolbarComponent } from './schedule-range-toolbar/schedule-range-toolbar.component';
import { ScheduleTableComponent } from './schedule-table/schedule-table.component';
import { ShiftChangeDialogComponent } from './shift-change-dialog/shift-change-dialog.component';
import { WarningListComponent } from './warning-list/warning-list.component';
import { WorkerPillComponent } from './worker-pill/worker-pill.component';

@NgModule({
    declarations: [
        OperatorStatsCardComponent,
        ScheduleGridViewComponent,
        ScheduleRangeToolbarComponent,
        ScheduleTableComponent,
        WarningListComponent,
        WorkerPillComponent,
        CloseTooltipsOnScrollDirective,
        LongShiftDialogComponent,
        ManualAssignmentDialogComponent,
        ShiftChangeDialogComponent,
    ],
    imports: [
        RouterModule,
        TurniSharedModule,
    ],
    exports: [
        RouterModule,
        TurniSharedModule,
        OperatorStatsCardComponent,
        ScheduleGridViewComponent,
        ScheduleRangeToolbarComponent,
        ScheduleTableComponent,
        WarningListComponent,
        WorkerPillComponent,
        CloseTooltipsOnScrollDirective,
        LongShiftDialogComponent,
        ManualAssignmentDialogComponent,
        ShiftChangeDialogComponent,
    ],
})
export class TurniScheduleSharedModule {}
