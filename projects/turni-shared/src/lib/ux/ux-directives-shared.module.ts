import { ModuleWithProviders, NgModule } from '@angular/core';
import { UxDirectivesModule } from 'ux-directives';

/*
 * Inizializzazione centralizzata ux-directives.
 *
 * Tutte le feature devono importare TurniSharedModule.
 * TurniSharedModule importa questo modulo e rende disponibili le direttive UX.
 *
 * Nota:
 * Se il tuo pacchetto ux-directives espone un nome diverso da UxDirectivesModule,
 * cambia solo questo file senza toccare le feature.
 */
@NgModule({
    imports: [
        UxDirectivesModule,
    ],
    exports: [
        UxDirectivesModule,
    ],
})
export class UxDirectivesSharedModule {
    static forRoot(): ModuleWithProviders<UxDirectivesSharedModule> {
        return {
            ngModule: UxDirectivesSharedModule,
            providers: [],
        };
    }
}
