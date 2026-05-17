import { NgModule } from '@angular/core';

import { TurniScheduleSharedModule } from '../../components/turni-schedule-shared.module';
import { ScheduleWarningsPageRoutingModule } from './schedule-warnings-page-routing.module';
import { ScheduleWarningsPageComponent } from './schedule-warnings-page.component';

@NgModule({
    declarations: [
        ScheduleWarningsPageComponent,
    ],
    imports: [
        TurniScheduleSharedModule,
        ScheduleWarningsPageRoutingModule,
    ],
})
export class ScheduleWarningsPageModule {}
