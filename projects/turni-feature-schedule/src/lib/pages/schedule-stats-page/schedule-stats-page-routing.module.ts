import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ScheduleStatsPageComponent } from './schedule-stats-page.component';

const routes: Routes = [
    {
        path: '',
        component: ScheduleStatsPageComponent,
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
export class ScheduleStatsPageRoutingModule {}
