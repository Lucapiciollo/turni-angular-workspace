# Turni Step 17 - Angular 19 + ux-directives nello shared

Questo pacchetto aggiorna il workspace ad Angular 19 mantenendo architettura modulare NgModule, non standalone.

## Upgrade

Aggiornati:

```txt
@angular/*              ^19.2.0
@angular/material       ^19.2.0
@angular/cdk            ^19.2.0
@angular/cli            ^19.2.0
@angular/compiler-cli   ^19.2.0
ng-packagr              ^19.2.0
typescript              ~5.8.3
zone.js                 ~0.15.1
rxjs                    ~7.8.1
```

## NgModule non standalone

Configurati gli schematics in `angular.json`:

```txt
component standalone false
directive standalone false
pipe standalone false
```

## ux-directives

Reinstallato:

```txt
ux-directives
```

e inizializzato nello shared:

```txt
projects/turni-shared/src/lib/ux/ux-directives-shared.module.ts
```

`TurniSharedModule` importa/esporta `UxDirectivesSharedModule`, quindi tutte le feature lo ereditano importando lo shared.

## Documentazione

Vedi anche:

```txt
ANGULAR_19_MIGRATION.md
```

# Turni Step 16 - Moment in italiano

Questo pacchetto parte dallo Step 15 e configura Moment.js in italiano.

## Cosa è stato aggiunto

Nuovo servizio:

```txt
projects/turni-data-access/src/lib/services/moment-locale.service.ts
```

Contiene:

```ts
import moment from 'moment';
import 'moment/locale/it';

moment.locale('it');
```

## Inizializzazione

`ScheduleStateService` inizializza il locale italiano tramite:

```ts
MomentLocaleService
```

Così il locale viene impostato quando parte la gestione del piano turni.

## DateRangeService

Aggiornato per usare:

```ts
import 'moment/locale/it';
moment.locale('it');
```

e aggiunti helper:

```ts
formatItalianDate(date: string): string
formatItalianMonth(date: string): string
```

## Angular locale

Configurato anche `LOCALE_ID` italiano in:

```txt
src/app/app.module.ts
```

con:

```ts
registerLocaleData(localeIt);

{
    provide: LOCALE_ID,
    useValue: 'it-IT',
}
```

## Risultato

Le label basate su Moment possono essere mostrate in italiano:

```txt
lunedì
martedì
maggio 2026
domenica 17 maggio 2026
```

## Avvio

```bash
npm install
npm start
```

Apri:

```txt
http://localhost:4200/piano-turni
```
