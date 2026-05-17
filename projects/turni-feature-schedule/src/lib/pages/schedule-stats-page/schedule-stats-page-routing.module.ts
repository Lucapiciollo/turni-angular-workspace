import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { schedulePageCanActivateGuard, schedulePageCanDeactivateGuard } from '../../routing/schedule-page.guard';
import { scheduleNavigationExtrasResolver } from '../../routing/schedule-navigation-extras.resolver';
import { ScheduleStatsPageComponent } from './schedule-stats-page.component';

const routes: Routes = [
    {
        path: '',
        component: ScheduleStatsPageComponent,
        canActivate: [
            schedulePageCanActivateGuard,
        ],
        canDeactivate: [
            schedulePageCanDeactivateGuard,
        ],
        resolve: {
            navigationExtras: scheduleNavigationExtrasResolver,
        },
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
