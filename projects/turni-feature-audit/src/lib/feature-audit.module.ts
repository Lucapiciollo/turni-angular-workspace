import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TurniSharedUiModule } from '@turni/shared-ui';
import { AuditPageComponent } from './page/audit-page.component';
const routes: Routes = [{ path: '', component: AuditPageComponent }];
@NgModule({ declarations: [AuditPageComponent], imports: [TurniSharedUiModule, RouterModule.forChild(routes)] })
export class TurniFeatureAuditModule {}
