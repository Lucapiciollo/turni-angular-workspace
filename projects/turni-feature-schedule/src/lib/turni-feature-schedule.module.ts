import { NgModule } from '@angular/core';
import { TurniStoreModule } from '@turni/data-access';

import { TurniFeatureScheduleRoutingModule } from './turni-feature-schedule-routing.module';

@NgModule({
    imports: [
        TurniStoreModule,
        TurniFeatureScheduleRoutingModule,
    ],
})
export class TurniFeatureScheduleModule {}
