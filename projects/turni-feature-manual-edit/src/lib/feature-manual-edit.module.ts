import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TurniSharedUiModule } from '@turni/shared-ui';
import { ManualEditPageComponent } from './page/manual-edit-page.component';
const routes: Routes = [{ path: '', component: ManualEditPageComponent }];
@NgModule({ declarations: [ManualEditPageComponent], imports: [TurniSharedUiModule, RouterModule.forChild(routes)] })
export class TurniFeatureManualEditModule {}
