# Turni Step 21 - Template type fix

Questa fix corregge errori di template Angular e typing NgRx.

## Problemi risolti

### 1. WorkerStats non ha `name`

Nel template veniva usato:

```html
turniFacade.selectedWorker()?.name
```

ma `selectedWorker()` nel selector restituisce una `WorkerStats`, quindi il campo corretto è:

```html
turniFacade.selectedWorker()?.workerName
```

### 2. OperatorStatsCard deve ricevere `Worker`

Se il template passa il dettaglio al componente statistiche, `[worker]` ora usa:

```html
turniFacade.getWorker(selectedStat.workerId)
```

non `selectedWorker()`, perché `selectedWorker()` è una statistica.

### 3. Selectors troppo parziali

Le funzioni helper nei selector usavano tipi strutturali parziali come:

```ts
Array<{ id: string; severity: string }>
```

Questo faceva perdere proprietà obbligatorie di `ScheduleWarning`, come `message`, `workerId`, ecc.

Ora usano i tipi reali:

```ts
WorkerStats[]
ScheduleWarning[]
```

## File modificati

```txt
projects/turni-data-access/src/lib/store/turni.selectors.ts
projects/turni-data-access/src/lib/store/turni.facade.ts
projects/turni-feature-schedule/src/lib/pages/schedule-stats-page/schedule-stats-page.component.html
projects/turni-feature-schedule/src/lib/pages/schedule-warnings-page/schedule-warnings-page.component.html
```

# Turni Step 21 - NgRx withLatestFrom fix

Questa fix rimuove `concatLatestFrom` perché in alcune installazioni/versioni non risulta esportato da `@ngrx/effects`.

## Modifica

Prima:

```ts
import { concatLatestFrom } from '@ngrx/effects';
```

Ora:

```ts
import { withLatestFrom } from 'rxjs';
```

Gli effects usano quindi:

```ts
withLatestFrom(
    this.store.select(...)
)
```

invece di:

```ts
concatLatestFrom(() => [
    this.store.select(...)
])
```

## File modificato

```txt
projects/turni-data-access/src/lib/store/turni.effects.ts
```

# Turni Step 21 - NgRx Foundation FIX

Questo pacchetto corregge gli errori emersi nello Step 21.

## Fix incluse

### 1. Reducer typing

Errore:

```txt
Type 'string' is not assignable to type 'StatsFilterType'
Type 'string' is not assignable to type 'WarningFilterType'
```

Risolto usando:

```ts
selectedStatsFilter: 'ALL' as const
selectedWarningFilter: 'ALL' as const
```

e riscrivendo il reducer in modo più esplicito.

### 2. Niente bind nell'HTML

Errore:

```txt
Property 'scheduleState' does not exist
```

e richiesta:

```txt
non mettere codice bind in pagine html
```

Risolto creando nella `TurniFacade` funzioni già pronte:

```ts
getAssignmentsByShiftFn
getFigurativeAbsencesByDayFn
getWorkerFn
```

Ora il template usa:

```html
[getAssignmentsByShiftFn]="turniFacade.getAssignmentsByShiftFn"
[getFigurativeAbsencesByDayFn]="turniFacade.getFigurativeAbsencesByDayFn"
[getWorkerFn]="turniFacade.getWorkerFn"
```

senza `.bind(...)`.

### 3. mat-icon non trovato

Verificato che:

```txt
TurniMaterialModule esporta MatIconModule
TurniSharedModule esporta TurniMaterialModule
TurniScheduleSharedModule importa/esporta TurniSharedModule
```

Quindi `mat-icon` è disponibile nei componenti dichiarati nella feature.

### 4. ux-directives latest

Aggiornato `package.json`:

```json
"ux-directives": "latest"
```

### 5. NgRx concatLatestFrom

Corretto import:

```ts
concatLatestFrom
```

da:

```ts
@ngrx/effects
```

## Avvio

```bash
rm -rf node_modules package-lock.json
npm install
npm run build
npm start
```
