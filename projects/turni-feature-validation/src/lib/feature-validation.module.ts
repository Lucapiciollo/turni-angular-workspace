import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TurniSharedUiModule } from '@turni/shared-ui';
import { ValidationPageComponent } from './page/validation-page.component';
const routes: Routes = [{ path: '', component: ValidationPageComponent }];
@NgModule({ declarations: [ValidationPageComponent], imports: [TurniSharedUiModule, RouterModule.forChild(routes)] })
export class TurniFeatureValidationModule {}
