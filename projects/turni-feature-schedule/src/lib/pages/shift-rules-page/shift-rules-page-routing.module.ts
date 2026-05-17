import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ShiftRulesPageComponent } from './shift-rules-page.component';

const routes: Routes = [
    {
        path: '',
        component: ShiftRulesPageComponent,
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
export class ShiftRulesPageRoutingModule {}
