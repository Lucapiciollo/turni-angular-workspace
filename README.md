# Turni Step 4 - Pagine modulari lazy + stato condiviso

Questo pacchetto corregge lo Step 4 rendendo le pagine davvero modulari e lazy.

## Architettura

La web app principale resta shell:

```txt
src/app
```

La feature principale resta lazy:

```txt
/piano-turni -> TurniFeatureScheduleModule
```

Dentro la feature, anche le pagine sono lazy:

```txt
/piano-turni              -> PianoTurniPageModule
/piano-turni/statistiche  -> ScheduleStatsPageModule
/piano-turni/warning      -> ScheduleWarningsPageModule
```

## Routing interno lazy

```ts
const routes: Routes = [
    {
        path: '',
        loadChildren: () => {
            return import('./pages/piano-turni-page/piano-turni-page.module')
                .then((module) => module.PianoTurniPageModule);
        },
    },
    {
        path: 'statistiche',
        loadChildren: () => {
            return import('./pages/schedule-stats-page/schedule-stats-page.module')
                .then((module) => module.ScheduleStatsPageModule);
        },
    },
    {
        path: 'warning',
        loadChildren: () => {
            return import('./pages/schedule-warnings-page/schedule-warnings-page.module')
                .then((module) => module.ScheduleWarningsPageModule);
        },
    },
];
```

## Moduli pagina

```txt
pages/piano-turni-page/
 ├── piano-turni-page.component.*
 ├── piano-turni-page-routing.module.ts
 └── piano-turni-page.module.ts

pages/schedule-stats-page/
 ├── schedule-stats-page.component.*
 ├── schedule-stats-page-routing.module.ts
 └── schedule-stats-page.module.ts

pages/schedule-warnings-page/
 ├── schedule-warnings-page.component.*
 ├── schedule-warnings-page-routing.module.ts
 └── schedule-warnings-page.module.ts
```

## Componenti condivisi

Creato:

```txt
projects/turni-feature-schedule/src/lib/components/turni-schedule-shared.module.ts
```

Esporta:

```txt
OperatorStatsCardComponent
ScheduleRangeToolbarComponent
ScheduleTableComponent
WarningListComponent
WorkerPillComponent
```

## Stato condiviso

Resta attivo:

```txt
projects/turni-data-access/src/lib/services/schedule-state.service.ts
```

Quindi piano, statistiche e warning leggono lo stesso piano generato.

## Avvio

```bash
npm install
npm start
```

Apri:

```txt
http://localhost:4200/piano-turni
```
