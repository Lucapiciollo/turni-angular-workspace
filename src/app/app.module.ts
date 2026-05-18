import { LOCALE_ID, NgModule, isDevMode } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { TurniSharedModule } from '@turni/shared';
import { registerLocaleData } from '@angular/common';
import localeIt from '@angular/common/locales/it';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { AppShellComponent } from './layout/app-shell/app-shell.component';
import { AppRoutingModule } from './app-routing.module';
import { TURNI_LOGGER_INIT_PROVIDER } from './core/turni-logger-init.provider';

registerLocaleData(localeIt);

@NgModule({
    declarations: [
        AppComponent,
            AppShellComponent,
    ],
    imports: [
        TurniSharedModule,
        StoreModule.forRoot({}),
        EffectsModule.forRoot([]),
        StoreDevtoolsModule.instrument({
            maxAge: 25,
            logOnly: !isDevMode(),
            autoPause: true,
        }),
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
    ],
    providers: [
        TURNI_LOGGER_INIT_PROVIDER,
        {
            provide: LOCALE_ID,
            useValue: 'it-IT',
        },
    ],
    bootstrap: [
        AppComponent,
    ],
})
export class AppModule {}
