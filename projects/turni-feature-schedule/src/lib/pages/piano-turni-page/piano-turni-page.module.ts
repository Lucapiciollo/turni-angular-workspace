import { NgModule } from '@angular/core';

import { TurniScheduleSharedModule } from '../../components/turni-schedule-shared.module';
import { PianoTurniPageRoutingModule } from './piano-turni-page-routing.module';
import { PianoTurniPageComponent } from './piano-turni-page.component';

@NgModule({
    declarations: [
        PianoTurniPageComponent,
    ],
    imports: [
        TurniScheduleSharedModule,
        PianoTurniPageRoutingModule,
    ],
})
export class PianoTurniPageModule {}
