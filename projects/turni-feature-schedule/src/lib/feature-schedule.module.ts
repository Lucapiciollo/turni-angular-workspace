import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TurniSharedUiModule } from '@turni/shared-ui';
import { SchedulePageComponent } from './page/schedule-page.component';
const routes: Routes = [{ path: '', component: SchedulePageComponent }];
@NgModule({ declarations: [SchedulePageComponent], imports: [TurniSharedUiModule, RouterModule.forChild(routes)] })
export class TurniFeatureScheduleModule {}
