import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { TurniEffects } from './turni.effects';
import { turniReducer } from './turni.reducer';
import { TURNI_FEATURE_KEY } from './turni-store.models';

@NgModule({
    imports: [
        StoreModule.forFeature(
            TURNI_FEATURE_KEY,
            turniReducer
        ),
        EffectsModule.forFeature([
            TurniEffects,
        ]),
    ],
})
export class TurniStoreModule {}
