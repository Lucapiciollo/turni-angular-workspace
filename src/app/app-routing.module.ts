import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

import { AppShellComponent } from './layout/app-shell/app-shell.component';

const routes: Routes = [
    {
        path: '',
        component: AppShellComponent,
        children: [
            {
                path: '',
                pathMatch: 'full',
                redirectTo: 'piano-turni',
            },
            {
                path: 'piano-turni',
                loadChildren: () => {
                    return import('@turni/feature-schedule')
                        .then((module) => module.TurniFeatureScheduleModule);
                },
            },
        ],
    },
    {
        path: '**',
        redirectTo: 'piano-turni',
    },
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, {
            scrollPositionRestoration: 'enabled',
            anchorScrolling: 'enabled',
            preloadingStrategy: PreloadAllModules,
        }),
    ],
    exports: [
        RouterModule,
    ],
})
export class AppRoutingModule {}
