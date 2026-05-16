import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { turniFeatureKey, turniReducer } from './state/turni.reducer';
import { TurniEffects } from './state/turni.effects';

@NgModule({ imports: [StoreModule.forFeature(turniFeatureKey, turniReducer), EffectsModule.forFeature([TurniEffects])] })
export class TurniDataAccessModule {}
