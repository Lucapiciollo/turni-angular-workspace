import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    {
        path: '',
        redirectTo: 'piano-turni',
        pathMatch: 'full',
    },
    {
        path: 'piano-turni',
        loadChildren: () => {
            return import('@turni/feature-schedule')
                .then((module) => module.TurniFeatureScheduleModule);
        },
    },
    {
        path: '**',
        redirectTo: 'piano-turni',
    },
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes),
    ],
    exports: [
        RouterModule,
    ],
})
export class AppRoutingModule {}
