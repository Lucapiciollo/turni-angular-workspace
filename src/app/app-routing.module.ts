import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ShellComponent } from './shell/shell.component';

const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', loadChildren: () => import('@turni/feature-dashboard').then(m => m.TurniFeatureDashboardModule) },
      { path: 'piano-turni', loadChildren: () => import('@turni/feature-schedule').then(m => m.TurniFeatureScheduleModule) },
      { path: 'modifica-turno/:date/:shift', loadChildren: () => import('@turni/feature-manual-edit').then(m => m.TurniFeatureManualEditModule) },
      { path: 'validazioni', loadChildren: () => import('@turni/feature-validation').then(m => m.TurniFeatureValidationModule) },
      { path: 'audit', loadChildren: () => import('@turni/feature-audit').then(m => m.TurniFeatureAuditModule) }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];

@NgModule({ imports: [RouterModule.forRoot(routes)], exports: [RouterModule] })
export class AppRoutingModule {}
