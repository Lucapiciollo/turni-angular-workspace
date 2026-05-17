import { NgModule } from '@angular/core';

import { TurniScheduleSharedModule } from '../../components/turni-schedule-shared.module';
import { ShiftRulesPageRoutingModule } from './shift-rules-page-routing.module';
import { ShiftRulesPageComponent } from './shift-rules-page.component';

@NgModule({
    declarations: [
        ShiftRulesPageComponent,
    ],
    imports: [
        TurniScheduleSharedModule,
        ShiftRulesPageRoutingModule,
    ],
})
export class ShiftRulesPageModule {}
