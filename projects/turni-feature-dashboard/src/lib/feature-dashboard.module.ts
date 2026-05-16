import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TurniSharedUiModule } from '@turni/shared-ui';
import { DashboardPageComponent } from './page/dashboard-page.component';
const routes: Routes = [{ path: '', component: DashboardPageComponent }];
@NgModule({ declarations: [DashboardPageComponent], imports: [TurniSharedUiModule, RouterModule.forChild(routes)] })
export class TurniFeatureDashboardModule {}
