import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';

import { PreventDefaultDirective } from './directives/prevent-default.directive';
import { StopPropagationDirective } from './directives/stop-propagation.directive';
import { TurniMaterialModule } from './material/turni-material.module';
import { UxDirectivesSharedModule } from './ux/ux-directives-shared.module';
import { InitialsPipe } from './pipes/initials.pipe';
import { SafeArrayPipe } from './pipes/safe-array.pipe';
import { ShiftLabelPipe } from './pipes/shift-label.pipe';

const DECLARATIONS = [
    InitialsPipe,
    ShiftLabelPipe,
    SafeArrayPipe,
    StopPropagationDirective,
    PreventDefaultDirective,
];

@NgModule({
    declarations: [
        ...DECLARATIONS,
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TurniMaterialModule,
        UxDirectivesSharedModule,
    ],
    exports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TurniMaterialModule,
        UxDirectivesSharedModule,
        ...DECLARATIONS,
    ],
})
export class TurniSharedModule {}
