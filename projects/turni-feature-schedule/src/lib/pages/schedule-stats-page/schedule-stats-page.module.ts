import { NgModule } from '@angular/core';

import { TurniScheduleSharedModule } from '../../components/turni-schedule-shared.module';
import { ScheduleStatsPageRoutingModule } from './schedule-stats-page-routing.module';
import { ScheduleStatsPageComponent } from './schedule-stats-page.component';

@NgModule({
    declarations: [
        ScheduleStatsPageComponent,
    ],
    imports: [
        TurniScheduleSharedModule,
        ScheduleStatsPageRoutingModule,
    ],
})
export class ScheduleStatsPageModule {}
