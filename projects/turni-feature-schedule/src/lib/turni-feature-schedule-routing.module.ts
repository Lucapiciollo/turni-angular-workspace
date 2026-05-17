import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    {
        path: 'operatori',
        loadChildren: () => {
            return import('./pages/operators-page/operators-page.module')
                .then((module) => module.OperatorsPageModule);
        },
    },
    {
        path: 'statistiche',
        loadChildren: () => {
            return import('./pages/schedule-stats-page/schedule-stats-page.module')
                .then((module) => module.ScheduleStatsPageModule);
        },
    },
    {
        path: 'warning',
        loadChildren: () => {
            return import('./pages/schedule-warnings-page/schedule-warnings-page.module')
                .then((module) => module.ScheduleWarningsPageModule);
        },
    },
    {
        path: '',
        loadChildren: () => {
            return import('./pages/piano-turni-page/piano-turni-page.module')
                .then((module) => module.PianoTurniPageModule);
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
export class TurniFeatureScheduleRoutingModule {}
