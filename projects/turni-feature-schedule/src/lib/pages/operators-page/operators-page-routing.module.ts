import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { OperatorsPageComponent } from './operators-page.component';

const routes: Routes = [
    {
        path: '',
        component: OperatorsPageComponent,
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
export class OperatorsPageRoutingModule {}
