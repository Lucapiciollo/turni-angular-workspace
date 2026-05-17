import { NgModule } from '@angular/core';

import { TurniScheduleSharedModule } from '../../components/turni-schedule-shared.module';
import { OperatorsPageRoutingModule } from './operators-page-routing.module';
import { OperatorsPageComponent } from './operators-page.component';

@NgModule({
    declarations: [
        OperatorsPageComponent,
    ],
    imports: [
        TurniScheduleSharedModule,
        OperatorsPageRoutingModule,
    ],
})
export class OperatorsPageModule {}
