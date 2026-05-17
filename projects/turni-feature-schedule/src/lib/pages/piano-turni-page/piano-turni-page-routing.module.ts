import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PianoTurniPageComponent } from './piano-turni-page.component';

const routes: Routes = [
    {
        path: '',
        component: PianoTurniPageComponent,
    },
];

@NgModule({
    imports: [
        RouterModule.forChild(routes),
    ],
    exports: [
        RouterModule,
    ],
})
export class PianoTurniPageRoutingModule {}
