import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ScheduleWarningsPageComponent } from './schedule-warnings-page.component';

const routes: Routes = [
    {
        path: '',
        component: ScheduleWarningsPageComponent,
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
export class ScheduleWarningsPageRoutingModule {}
