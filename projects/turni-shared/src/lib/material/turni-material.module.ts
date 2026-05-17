import { NgModule } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MAT_TOOLTIP_DEFAULT_OPTIONS, MatTooltipModule } from '@angular/material/tooltip';

import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';

const MATERIAL_MODULES = [
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatBadgeModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatIconModule,
    MatExpansionModule,
    MatTooltipModule,
];

@NgModule({
    imports: [
        ...MATERIAL_MODULES,
    ],
    providers: [
        {
            provide: MAT_TOOLTIP_DEFAULT_OPTIONS,
            useValue: {
                showDelay: 250,
                hideDelay: 0,
                touchendHideDelay: 0,
                touchGestures: 'auto',
                disableTooltipInteractivity: true,
            },
        },
    ],
    exports: [
        ...MATERIAL_MODULES,
    ],
})
export class TurniMaterialModule {}
