# Step 65 - Libreria turni-logging

Aggiunta una libreria dedicata al logging:

```txt
projects/turni-logging
```

## Path alias

Aggiunto in `tsconfig.json`:

```json
"@turni/logging": [
  "projects/turni-logging/src/public-api.ts"
]
```

## Build

Aggiornato `build:libs`:

```txt
ng build turni-shared && ng build turni-logging && ng build turni-data-access && ng build turni-feature-schedule
```

## Servizi principali

```txt
TurniLoggerService
TurniConsoleLogWriterService
TurniMemoryLogWriterService
TurniLoggingModule
```

## Configurazione

Il logger può essere configurato con:

```ts
logger.configure({
    enabled: true,
    enabledLevels: ['INFO', 'WARN', 'ERROR'],
    enabledCategories: ['REJECTION', 'ASSIGNMENT'],
    writeToConsole: true,
    storeInMemory: true,
    maxMemoryLogs: 3000,
    includePayloadInConsole: true,
});
```

## Categorie disponibili

```txt
GENERATION
RULE_CHECK
ASSIGNMENT
REJECTION
FORCED_ASSIGNMENT
CACHE
PERIOD_CONTEXT
SHIFT_CHANGE
SICK_REPLACEMENT
PDF_EXPORT
STORAGE
OPERATORS
SHIFT_RULES
```

## Generatore aggiornato

`TurniGeneratorService` non scrive più direttamente:

```ts
console.info(...)
console.warn(...)
```

ma usa:

```ts
this.logger.log(...)
```

Il messaggio resta leggibile, ma ora il tipo di log può essere filtrato dalla libreria.

# Step 64 - Log generazione più leggibili

Migliorati i log della generazione turni.

## Nuovo formato

La console mostra frasi leggibili come:

```txt
[Turni][Generazione] Per il giorno 2026-06-01, turno NOTTE, l'operatore Mario Rossi è stato scartato perché ha già raggiunto il massimo di notti consecutive.
```

## Esempi

### Operatore scartato

```txt
Per il giorno 2026-06-01, turno NOTTE, l'operatore Mario Rossi è stato scartato perché 1) ha già fatto troppe notti consecutive. 2) non rispetta il riposo dopo il turno precedente.
```

### Operatore assegnato

```txt
Per il giorno 2026-06-01, turno MATTINA, l'operatore Luca Bianchi è stato assegnato automaticamente perché risulta il candidato migliore con punteggio 42.
```

### Slot scoperto

```txt
Per il giorno 2026-06-01, turno NOTTE: lo slot 2 è rimasto scoperto perché nessun operatore disponibile rispettava le regole.
```

## Dettaglio tecnico mantenuto

Oltre alla frase leggibile, rimane anche il payload tecnico con:

```txt
decision
date
shift
worker
slotIndex
allowed
hardBlocked
score
finalScore
rules
messages
contextPreviousDaysCount
```

# Step 62 clean fix - WorkerAbsenceService e reducer comma

Corretto il pacchetto Step 62 clean.

## Fix 1

Nel file:

```txt
projects/turni-data-access/src/lib/services/turni-generator.service.ts
```

era chiamato un metodo inesistente:

```ts
findAbsenceForWorkerOnDate(...)
```

Sostituito con il metodo realmente presente in `WorkerAbsenceService`:

```ts
getAbsenceForDate({
    workerId,
    date,
    absences,
})
```

## Fix 2

Nel file:

```txt
projects/turni-data-access/src/lib/store/turni.reducer.ts
```

mancava una virgola dopo:

```ts
on(TurniActions.resetWarningFilters, ...)
```

Aggiunta la virgola prima di:

```ts
on(TurniActions.setGenerationSettings, ...)
```

# Step 62 clean - Contesto precedente e log generazione

Pacchetto rigenerato da zero partendo dallo Step 61 pulito.

## Importante

Questo pacchetto NON deriva dallo Step 62 difettoso e NON deriva dai fix successivi.
È stato ricostruito direttamente da:

```txt
turni-step-61-period-load-and-full-scale-ui.zip
```

## Funzioni aggiunte

### 1. Contesto periodo precedente

La generazione ora può usare i giorni precedenti al periodo corrente per valutare le regole.

Parametro:

```ts
generationSettings: {
    previousContextDays: 14,
    enableDecisionLogs: true,
}
```

### 2. Recupero giorni precedenti da cache

Aggiunto in:

```txt
projects/turni-data-access/src/lib/services/schedule-cache.service.ts
```

metodo:

```ts
getPreviousContextDays(range, lookBackDays)
```

### 3. Log decisioni sempre attivo

Ogni candidato viene loggato:

```txt
candidato ammesso
candidato scartato
candidato ammesso come forzatura
candidato scartato come forzatura
assegnazione automatica
assegnazione forzata
slot scoperto
contesto caricato
```

I log sono salvati in:

```ts
plan.generationLogs
```

e scritti anche in console:

```ts
console.info
console.warn
```

### 4. Facade pulita

`turni.facade.ts` è stato riscritto da base pulita, senza il bug:

```ts
GenerationSettings
```

inserito come parametro nei metodi.

Firme corrette:

```ts
getAssignmentsByShiftFn(day, shift)
getAssignmentsByShift(day, shift)
getLongShiftCandidates(day, assignment)
```

# Step 61 - Cambio periodo senza autogenerazione + scala UI completa

## Cambio periodo

Corretto il comportamento delle frecce periodo e del cambio mese/settimana.

Ora quando cambi periodo:

```txt
carica il periodo
cerca eventuale piano in cache
se non trova cache mostra il periodo vuoto
NON genera automaticamente i turni
```

La generazione avviene solo da:

```txt
Genera
Rigenera
```

## Cosa è cambiato tecnicamente

Nel file:

```txt
projects/turni-data-access/src/lib/store/turni.effects.ts
```

`openRange$` non chiama più:

```ts
generatorService.generatePlan(...)
```

ma restituisce:

```ts
cachedPlan
```

oppure:

```ts
createEmptyPlan(range)
```

## Scala UI globale estesa

La variabile principale resta:

```scss
$turni-ui-scale: 0.88 !default;
```

Ora dipendono da questa variabile anche:

```txt
pulsanti
icon button
icone nei pulsanti
chip
form field
select/input
option
menu item
button toggle
dialog
expansion panel
tab
toolbar
worker pill
tabella turni
```

## Nuovi token derivati

Nel file:

```txt
projects/turni-shared/src/lib/styles/_turni-ui-tokens.scss
```

aggiunti token come:

```scss
--turni-button-height
--turni-button-padding-x
--turni-button-gap
--turni-button-font-size
--turni-button-icon-size
--turni-icon-button-size
--turni-form-field-height
--turni-option-height
--turni-menu-item-height
--turni-chip-height
```

Così in linea di massima tutta la UI si ridimensiona cambiando solo `$turni-ui-scale`.

# Step 60 - Scala globale UI nei token SCSS

Aggiunto un fattore di scala globale per ridimensionare l'interfaccia da una sola variabile.

## Variabile principale

File:

```txt
projects/turni-shared/src/lib/styles/_turni-ui-tokens.scss
```

Variabile:

```scss
$turni-ui-scale: 0.88 !default;
```

## Come usarla

Esempi:

```scss
$turni-ui-scale: 0.82 !default; // molto compatto
$turni-ui-scale: 0.88 !default; // compatto consigliato
$turni-ui-scale: 1.00 !default; // dimensione standard
$turni-ui-scale: 1.12 !default; // più grande
```

## Cosa scala automaticamente

La scala influenza:

```txt
font size
padding pagina
gap
padding card
padding sezioni
radius
icone
altezza controlli
avatar
larghezza menu
altezza topbar
righe menu
lista operatori
righe lista operatori
celle tabella
larghezza colonna operatori tabella
```

## Perché

Così non serve chiedere ogni volta il ridimensionamento: modifichi solo `$turni-ui-scale` e tutta l'interfaccia si adatta in proporzione.

## Override Material

Aggiunti override globali su:

```txt
button
icon button
chip
card
dialog
form field
select/input
menu item
option
button toggle
```

# Step 59 - Fix vista tabellare turni

Corretto il problema della vista tabellare che mostrava solo un operatore e celle vuote.

## Problemi corretti

La tabella usava:

```txt
celle recuperate da mappa con chiave ricostruita nel template
worker-cell con display:flex direttamente su una cella <th>
```

Questo poteva rompere il rendering della tabella e rendere la vista instabile.

## Fix

Ora ogni riga viene preparata già con un array di celle:

```ts
rows: ScheduleGridRow[]
row.cells: ScheduleGridCell[]
```

Il template non ricostruisce più chiavi e non accede più a mappe complesse.

## Correzione CSS

La cella operatore `<th>` non usa più `display:flex`.

Il layout flex è stato spostato dentro:

```html
<span class="worker-cell-content">
```

così la tabella mantiene un comportamento corretto.

## Risultato

La vista tabellare mostra correttamente:

```txt
tutti gli operatori
tutte le colonne giorno/turno
celle X/F/M/P/R/C/S/+
```

# Step 58 - Vista tabellare turni come PDF

Aggiunta una funzionalità per visualizzare la situazione dei turni in forma tabellare, simile alla stampa PDF.

## Nuovo pulsante

Nella toolbar, vicino a `Esporta PDF`, è stato aggiunto:

```txt
Vista tabella
```

## Cosa mostra

La tabella mostra:

```txt
operatori sulle righe
giorni sulle colonne
sotto ogni giorno i turni M/P/N
celle con simboli X/F/M/P/R e manuali
```

## Legenda

```txt
X = turno assegnato
F = ferie
M = malattia
P = permesso
R = riposo
C = cambio turno manuale
S = scambio turno manuale
+ = inserimento manuale
```

## Componenti aggiunti

```txt
ScheduleGridViewComponent
```

Percorso:

```txt
projects/turni-feature-schedule/src/lib/components/schedule-grid-view
```

## Integrazione

La vista tabellare viene mostrata nella pagina Piano Turni tramite:

```html
<turni-schedule-grid-view
    [days]="turniFacade.days()"
    [shifts]="turniFacade.shifts()"
    [workers]="turniFacade.workers()"
></turni-schedule-grid-view>
```

La sezione è attivata/disattivata dal pulsante della toolbar.

# Step 57 - Fix blocco dialog cambio operatore

Corretto il blocco della pagina quando si selezionava il turno nella dialog cambio operatore.

## Causa probabile

La lista operatori del turno era calcolata con una getter:

```ts
get filteredSwapCandidates()
```

Il template la richiamava continuamente durante la change detection, ricreando sempre nuovi array.

## Fix

La lista viene ora calcolata solo quando cambia il turno selezionato:

```ts
updateFilteredSwapCandidates(targetShift)
```

e salvata in una proprietà:

```ts
filteredSwapCandidates: ShiftSwapCandidate[]
```

## Migliorie aggiunte

Aggiunti anche `trackBy` su:

```txt
giorni
turni
operatori candidati
```

e reset dei controlli con:

```ts
emitEvent: false
```

per evitare loop inutili tra form control.

# Step 56 - Cambio turno con scelta obbligatoria dell'altro operatore

Corretto il comportamento del cambio turno nello stesso giorno.

## Nuova regola

Il cambio nello stesso giorno non è più uno spostamento libero.

Ora devi scegliere:

```txt
turno diverso
operatore presente in quel turno
```

## Esempio

```txt
Mario Rossi è in Mattina
selezioni Pomeriggio
selezioni Luca Bianchi che è in Pomeriggio
confermi
```

Risultato:

```txt
Mario Rossi passa in Pomeriggio
Luca Bianchi passa in Mattina
```

## Modalità disponibili nella dialog

```txt
Cambio con operatore
Altro giorno
```

## Perché

Il cambio turno reale deve sempre coinvolgere un altro operatore del turno di destinazione, che sia Pomeriggio, Notte o altro turno configurato.

## File modificati

```txt
projects/turni-feature-schedule/src/lib/components/shift-change-dialog/shift-change-dialog.component.ts
projects/turni-feature-schedule/src/lib/components/shift-change-dialog/shift-change-dialog.component.html
projects/turni-feature-schedule/src/lib/components/shift-change-dialog/shift-change-dialog.component.scss
projects/turni-data-access/src/lib/models/turni.models.ts
```

# Step 55 - Validazione cambio turno

Corretto il cambio turno per rispettare la regola:

```txt
il cambio non può essere stesso giorno + stesso turno
```

## Regola applicata

Il cambio è valido solo se cambia almeno uno dei due elementi:

```txt
giorno diverso
oppure turno diverso
```

## Esempi validi

```txt
10/05 Mattina → 10/05 Pomeriggio
10/05 Mattina → 12/05 Mattina
10/05 Mattina → 12/05 Notte
```

## Esempio non valido

```txt
10/05 Mattina → 10/05 Mattina
```

## File corretti

```txt
projects/turni-data-access/src/lib/services/shift-change.service.ts
projects/turni-feature-schedule/src/lib/components/shift-change-dialog/shift-change-dialog.component.ts
projects/turni-feature-schedule/src/lib/components/shift-change-dialog/shift-change-dialog.component.html
```

## Controlli aggiunti

Nel service:

```ts
validateShiftChangeTarget(...)
```

Nella dialog:

```ts
isInvalidSameDateSameShift(...)
```

# Step 54 - Template compatto e menu più elegante

Rivisto il template generale dell'app.

## Cosa cambia

Il menu laterale ora è:

```txt
più stretto
meno alto nei singoli item
meno padding
icone più leggere
descrizioni più compatte
active state più elegante con marker laterale
footer ridotto
```

La topbar ora è:

```txt
più bassa
meno invasiva
con azioni rapide a icona
con pulsante Piano compatto
```

## Token aggiunti

Nel file:

```txt
projects/turni-shared/src/lib/styles/_turni-ui-tokens.scss
```

sono stati aggiunti token per controllare il template:

```scss
$turni-shell-menu-width
$turni-shell-menu-collapsed-width
$turni-shell-menu-padding
$turni-shell-menu-gap
$turni-shell-topbar-height
$turni-shell-topbar-padding-y
$turni-shell-topbar-padding-x
$turni-shell-menu-item-height
$turni-shell-menu-icon-size
$turni-shell-brand-logo-size
```

## Compattezza generale

Sono stati ridotti leggermente anche i default di:

```scss
$turni-page-padding
$turni-page-gap
$turni-card-padding
$turni-section-padding
$turni-radius-md
$turni-radius-lg
$turni-control-height
$turni-avatar-size
$turni-operator-list-width
$turni-operator-list-row-height
```

Così l'app appare meno grande e più gestionale.

# Step 53 - UI compatta e token SCSS configurabili

Intervento su stile e dimensioni.

## Nuovo file variabili SCSS

Aggiunto:

```txt
projects/turni-shared/src/lib/styles/_turni-ui-tokens.scss
```

Da questo file puoi modificare:

```txt
colori
background
bordi
border-radius
ombre
padding pagina
padding card
gap
font-size
dimensione icone
altezza controlli
dimensione avatar
larghezza lista operatori
altezza scroll lista operatori
altezza scroll form operatori
transizioni
```

## Collegamento globale

Il file viene importato in:

```txt
src/styles.scss
```

e pubblica variabili CSS globali su `:root`.

## Pagina Operatori rivista

La pagina operatori ora è più compatta.

La lista operatori:

```txt
ha scroll interno
non scrolla insieme alla pagina
resta dentro il pannello sinistro
```

Il form a destra:

```txt
ha scroll interno separato
azioni finali sticky in basso
componenti più piccoli
spaziature ridotte
```

## Altre pagine alleggerite

Aggiunti override compatti anche su:

```txt
Piano turni
Regole turni
Schedule table
Material button/chip/card/dialog/form-field
```

## Variabili principali da modificare

```scss
$turni-page-padding
$turni-page-gap
$turni-card-padding
$turni-radius-lg
$turni-font-size-page-title
$turni-control-height
$turni-operator-list-width
$turni-operator-list-scroll-height
$turni-operator-form-scroll-height
$turni-primary
$turni-bg
$turni-border
```

# Step 52 fix - Metodi warning mancanti in ShiftChangeService

Corretto errore TypeScript:

```txt
Property 'createShiftMoveWarning' does not exist on type 'ShiftChangeService'
Property 'createShiftSwapWarning' does not exist on type 'ShiftChangeService'
```

## File corretto

```txt
projects/turni-data-access/src/lib/services/shift-change.service.ts
```

## Fix

Aggiunti i metodi mancanti:

```ts
private createShiftMoveWarning(...)
private createShiftSwapWarning(...)
```

Questi metodi creano warning informativi per:

```txt
spostamento su altro giorno
scambio tra due operatori
```

# Step 52 - Spostamento turno su altro giorno

Esteso il cambio turno con una terza modalità.

## Nuova modalità

La dialog `Cambio turno` ora ha:

```txt
Sposta
Scambia
Altro giorno
```

## Altro giorno

Permette di scegliere:

```txt
giorno destinazione
turno destinazione
nota facoltativa
```

L'operatore viene rimosso dal giorno/turno di partenza e aggiunto al giorno/turno destinazione.

## Tracciamento

Lo spostamento viene marcato come manuale:

```ts
source: 'MANUAL'
manualReason: 'SHIFT_CHANGE'
changedFromDate
changedFromShift
changedFromWorkerId
changeNote
```

## Attenzione operativa

Spostando un operatore su un altro giorno, il turno di partenza può restare scoperto. Per questo vengono ricalcolati indicatori, warning e statistiche.

## Modalità ora disponibili

```txt
MOVE_SAME_DAY    → sposta nello stesso giorno
SWAP_SAME_DAY    → scambia con altro operatore nello stesso giorno
MOVE_OTHER_DAY   → sposta su un altro giorno del periodo
```

# Step 51 - Scambio turno stesso giorno

Esteso il cambio turno.

## Nuova modalità

La dialog `Cambio turno` ora ha due modalità:

```txt
Sposta
Scambia
```

## Sposta

Sposta l'operatore selezionato su un altro turno dello stesso giorno.

## Scambia

Permette di scegliere un altro operatore già presente nello stesso giorno e inverte i rispettivi turni.

Esempio:

```txt
Mario in Mattina
Luca in Pomeriggio

Dopo lo scambio:
Mario in Pomeriggio
Luca in Mattina
```

## Tracciamento

Gli operatori coinvolti nello scambio vengono marcati con:

```ts
source: 'MANUAL'
manualReason: 'SHIFT_SWAP'
changedFromShift
changedWithWorkerId
changeNote
```

## Aggiornamenti

Alla conferma:

```txt
piano aggiornato
cache aggiornata
statistiche ricalcolate
warning informativo creato
```

Lo spostamento su un altro giorno resta fuori da questo step.

# Step 50 - Cambio turno stesso giorno

Aggiunto il primo step del cambio turno.

## Nuovo comportamento

Sulla pill dell'operatore c'è un pulsante:

```txt
swap_horiz
```

Cliccandolo si apre la dialog `Cambio turno`.

## Cosa fa

In questo step il cambio turno permette di:

```txt
spostare un operatore nello stesso giorno
da un turno a un altro turno
```

Esempio:

```txt
Mario Rossi da Mattina a Pomeriggio
```

## Cosa NON fa ancora

Non gestisce ancora:

```txt
scambio tra due operatori
spostamento su altro giorno
```

Questi verranno aggiunti in step successivi.

## Dati tecnici

L'assegnazione spostata viene marcata con:

```ts
source: 'MANUAL'
manualReason: 'SHIFT_CHANGE'
changedFromShift
changedFromDate
changeNote
```

## Aggiornamenti

Alla conferma:

```txt
il piano viene aggiornato
la cache viene aggiornata
statistiche e warning vengono ricalcolati
viene creato un warning informativo
```

## File principali

```txt
ShiftChangeDialogComponent
ShiftChangeService
TurniActions.changeShift
TurniFacade.changeShift
WorkerPillComponent requestShiftChange
ScheduleTableComponent requestShiftChange
```

# Step 49 - Inserimento manuale operatore su turno

Aggiunto il flusso per inserire manualmente un operatore in un turno.

## Nuovo comportamento

In ogni card turno ora è presente un pulsante `+`.

Cliccando il pulsante:

```txt
si apre una dialog
si seleziona un operatore da una combo
si può inserire una nota facoltativa
alla conferma l'operatore viene aggiunto al turno
```

## Risultato

L'assegnazione viene salvata con:

```ts
source: 'MANUAL'
```

e quindi risulta distinguibile da una generazione automatica.

## Regole UI

La combo mostra solo operatori:

```txt
attivi
non già presenti nello stesso turno
```

## Dati aggiornati

Alla conferma:

```txt
il piano viene aggiornato
la cache viene aggiornata
statistiche e warning vengono ricalcolati
compare un warning informativo di inserimento manuale
```

## File principali

```txt
ManualAssignmentDialogComponent
ManualAssignmentService
TurniActions.addManualAssignment
TurniFacade.addManualAssignment
ScheduleTableComponent output addManualAssignment
```

# Step 48 fix - tipo lastSource nel reducer

Corretto errore TypeScript:

```txt
Type 'string' is not assignable to type 'SchedulePlanSource'
```

## File corretto

```txt
projects/turni-data-access/src/lib/store/turni.reducer.ts
```

## Fix

Nel reducer `confirmSickReplacement`:

```ts
lastSource: 'REGENERATED' as const
```

così TypeScript mantiene il literal type corretto invece di inferirlo come `string`.

# Step 48 - Conferma o refresh sostituto malattia

Modificato il flusso malattia.

## Nuovo comportamento

Quando metti in malattia un operatore in turno:

```txt
il piano non viene applicato subito
il sistema propone un sostituto
compare un box di conferma
```

Nel box puoi scegliere:

```txt
Conferma
Cerca altro
Annulla
```

## Cerca altro

Ogni volta che premi `Cerca altro`:

```txt
il sostituto appena proposto viene escluso
il sistema cerca un altro operatore
la nuova proposta sostituisce la precedente
```

Puoi continuare finché trovi il sostituto che vuoi confermare.

## Conferma

Alla conferma:

```txt
il piano proposto diventa definitivo
la cache viene aggiornata
le assenze vengono salvate nello storage
```

## Annulla

Annulla chiude la proposta e lascia il piano precedente invariato.

# Step 47 - Navigazione tra pagine più veloce

Ottimizzato il passaggio tra pagine.

## Problema

Ogni pagina richiamava:

```ts
turniFacade.init()
```

quindi anche passando da Piano turni a Operatori o Regole turni lo store veniva risollecitato.

## Correzione

Aggiunto nel facade:

```ts
ensureInitialized()
```

Ora le pagine chiamano `ensureInitialized()` e non rilanciano inizializzazione se:

```txt
workers già caricati
shifts già caricati
plan già presente
```

## NgRx

Aggiunta action leggera:

```txt
Noop
```

usata quando `init` viene chiamato ma lo store è già pronto.

## Routing

Abilitato preload dei moduli lazy:

```ts
preloadingStrategy: PreloadAllModules
```

Così dopo il primo caricamento Angular può precaricare:

```txt
Operatori
Regole turni
Statistiche
Warning
```

e il click successivo è più rapido.

# Step 46 - Ingresso pagina stabile, yield solo su richiesta

Corretto il comportamento percepito come refresh all'ingresso del portale.

## Causa

Al primo ingresso la sequenza era:

```txt
init
loadInitialData
openRange
generatePlanSuccess
```

e, dopo l'introduzione della generazione progressiva, lo store passava da più stati intermedi.

## Correzione

La generazione progressiva con `yield` resta disponibile, ma viene usata solo quando l'utente preme:

```txt
Genera
Rigenera
```

L'ingresso iniziale resta stabile e cache-friendly:

```txt
se esiste già un piano nello store non ricarica tutto
se non esiste, carica dati e apre il range corrente
openRange usa ancora generazione sincrona/cache
```

## Risultato

```txt
niente effetto pagina che refresha all'ingresso
progress bar solo durante generazione richiesta dall'utente
moduli operatori/regole non rilanciano inutilmente il piano se lo store è già inizializzato
```

# Step 45 - Generazione progressiva con AsyncGenerator/yield

Aggiunta generazione progressiva dei turni usando `async *generatePlanSteps(...)`.

## Cosa cambia

La generazione può avanzare giorno per giorno, aggiornando la UI durante il processo.

## Nuovo stato NgRx

```txt
generating
generationProgress
generationCurrentDate
partialDays
```

## Nuove action

```txt
Generate Plan Progressive
Generate Plan Progress
Cancel Plan Generation
Cancel Plan Generation Success
```

## UI

La toolbar mostra:

```txt
Generazione in corso
percentuale
data corrente
progress bar Material
pulsante Annulla
```

Durante la generazione la lista mostra i giorni parziali già generati.

## Nota

Il generatore sincrono `generatePlan(...)` resta disponibile. La modalità yield usa il nuovo metodo:

```ts
async *generatePlanSteps(...)
```

e lascia respirare il browser con `requestAnimationFrame`.

# Step 44 - Regole turni senza combo tipo turno

Rimossa la combo `Tipo` dalla pagina configurazione turni.

## Perché

Ogni card rappresenta già un turno preciso:

```txt
Mattina
Pomeriggio
Notte
```

quindi la select per cambiare tipo turno era inutile.

## Ora puoi modificare solo

```txt
etichetta
orario inizio
orario fine
operatori richiesti
ore turno
```

Il valore `type` resta nel form internamente perché serve al salvataggio e alla generazione, ma non è più modificabile dalla UI.

# Step 43 - Configurazione regole turni

Aggiunto modulo lazy per configurare quanti operatori servono per ogni turno.

## Nuova pagina

```txt
/piano-turni/regole-turni
```

## Menu

Aggiunta voce:

```txt
Regole turni
```

## Cosa puoi configurare

```txt
tipo turno
etichetta
orario inizio
orario fine
operatori richiesti
ore turno
```

per:

```txt
Mattina
Pomeriggio
Notte
```

## Storage

Le modifiche vengono salvate nello stesso storage locale:

```txt
turni.data.v1
```

e vengono usate dalla prossima generazione del piano.

# Step 42 fix - TurniFacade e routing operatori

Corretto errore di build in:

```txt
projects/turni-data-access/src/lib/store/turni.facade.ts
```

## Problema

La patch precedente aveva inserito metodi CRUD dentro gli import del facade, causando:

```txt
Expected string but found "("
```

## Correzione

`TurniFacade` è stato riscritto in modo pulito:

```txt
import corretti
selector corretti
metodi CRUD dentro la classe
nessun codice dentro gli import
```

## Altre correzioni

```txt
ReactiveFormsModule esportato dallo shared
route operatori messa prima della route vuota
rimossi import mock non usati dagli effects
```

# Step 42 - CRUD operatori con salvataggio su storage

Aggiunta pagina lazy per gestione operatori.

## Nuova pagina

```txt
/piano-turni/operatori
```

Voce menu:

```txt
Operatori
```

## Funzioni

```txt
lista operatori
ricerca operatore
creazione nuovo operatore
modifica dati anagrafici
modifica contratto
modifica regole turni
eliminazione operatore
ripristino mock iniziale
salvataggio su localStorage
```

## Storage

Aggiunto servizio:

```txt
projects/turni-data-access/src/lib/services/turni-storage.service.ts
```

Chiave usata:

```txt
turni.data.v1
```

Al primo avvio:

```txt
se lo store è vuoto
se lo storage contiene dati usa lo storage
altrimenti usa il JSON mock iniziale
```

## Moduli

La pagina è modulare/lazy:

```txt
operators-page.module.ts
operators-page-routing.module.ts
```

# Step 41 - Menu principale pulito

Pulito il menu principale.

## Cosa cambia

Nel menu laterale/app shell non compaiono più:

```txt
Statistiche
Warning
```

Resta solo:

```txt
Piano turni
```

con descrizione aggiornata:

```txt
Turni, avvisi e statistiche del periodo
```

## Modularità mantenuta

Le route lazy restano nel progetto:

```txt
/piano-turni/statistiche
/piano-turni/warning
```

ma non sono più proposte nel menu principale, perché statistiche e warning sono consultazioni del periodo e ora stanno inline nella pagina del piano turni.

# Step 40 fix - WorkerPill syntax

Corretto errore TypeScript in:

```txt
projects/turni-feature-schedule/src/lib/components/worker-pill/worker-pill.component.ts
```

## Problema

Era rimasto un frammento della vecchia navigazione router:

```ts
);
```

fuori da qualsiasi metodo.

## Correzione

`WorkerPillComponent` ora non usa più `Router` e invia solo eventi:

```ts
openStatsDetail.emit(...)
openWarningsDetail.emit(...)
```

La pagina piano turni intercetta gli eventi e scorre alle sezioni inline.

# Step 40 - Statistiche e warning inline nel piano periodo

Riorganizzata la consultazione del periodo.

## Cosa cambia

Statistiche e warning non sono più proposti come navigazione principale dalla pagina piano turni.

Ora sono sotto la lista del piano periodo, negli accordion:

```txt
Avvisi del periodo
Statistiche operatori del periodo
```

## Modularità mantenuta

I moduli lazy restano nel progetto:

```txt
schedule-stats-page
schedule-warnings-page
```

quindi la struttura modulare non viene persa.

## Dettaglio operatore

Cliccando il dettaglio da una pill operatore:

```txt
non cambia pagina
seleziona l'operatore nello store
scorre alla card statistiche
evidenzia la card selezionata
```

Il pulsante warning sulla pill:

```txt
non cambia pagina
seleziona l'operatore
scorre alla sezione avvisi
mostra i warning filtrati
```

# Step 39 - Redesign pagina statistiche

Ridisegnata la pagina statistiche per essere più leggibile e moderna.

## Modifiche principali

```txt
header più pulito
filtri in toolbar compatta
card operatori più leggere
layout a dashboard
metriche principali in evidenza
indicatori qualità più leggibili
footer card con weekend, forzati, extra
stile soft coerente con Angular Material
```

## Card statistiche

Le vecchie card molto dense sono state trasformate in una card più leggibile:

```txt
avatar operatore
ore come chip
turni/mattine/pomeriggi/notti in prima riga
controlli qualità in strip
forzati/extra/weekend nel footer
```

# Step 38 public-api fix

Corretto errore Angular:

```txt
TS2308: Module './lib/data/operators-full.mock' has already exported a member named ...
```

## Causa

`public-api.ts` esportava sia:

```ts
export * from './lib/data/operators-full.mock';
export * from './lib/data/turni-full-mock';
```

Entrambi esportavano:

```txt
FULL_MOCK_WORKERS
FULL_MOCK_ABSENCES
FULL_MOCK_SHIFTS
```

## Correzione

Il barrel pubblico ora esporta solo il mock canonico:

```ts
export * from './lib/data/turni-full-mock';
```

`operators-full.mock.ts` resta nel progetto ma non viene riesportato dal barrel pubblico.

# Step 38 - JSON mock completo collegato

Corretto il pacchetto: ora il JSON completo è presente e collegato ai dati iniziali.

## File JSON aggiunti

```txt
projects/turni-data-access/src/lib/data/turni-full-mock.json
projects/turni-data-access/src/lib/data/operators-full.mock.json
src/assets/mock/turni-full-mock.json
```

## Contenuto

```txt
30 operatori
25 assenze
FERIE
MALATTIA
PERMESSO con startTime/endTime
RIPOSO
3 turni MATTINA/POMERIGGIO/NOTTE
```

## Collegamento

`TurniEffects` ora, al primo avvio se lo store è vuoto, carica:

```ts
TURNI_FULL_MOCK.workers
TURNI_FULL_MOCK.shifts
TURNI_FULL_MOCK.absences
```

quindi il mock non è solo presente nel pacchetto, ma viene realmente usato come sorgente dati iniziale.

## WorkerAbsence

Confermato nel modello:

```ts
startTime?: string;
endTime?: string;
```

# Step 37 build fix - fullName mock e defaultProject

Corretto errore di build sul mock operatori.

## Errore risolto

```txt
Property 'fullName' is missing in type ... but required in type 'Worker'
```

## Correzione

Nel file:

```txt
projects/turni-data-access/src/lib/data/operators-full.mock.json
```

ogni operatore ora ha sia:

```json
"name": "Luca Bianchi",
"fullName": "Luca Bianchi"
```

Così resta compatibile con:

```txt
UI corrente che usa name
modello Worker che richiede fullName
```

Nel wrapper TypeScript:

```txt
projects/turni-data-access/src/lib/data/operators-full.mock.ts
```

il cast ora passa da `unknown`:

```ts
operatorsFullMockJson as unknown as OperatorsFullMock
```

Rimosso anche `defaultProject` da `angular.json` se presente, perché Angular segnala:

```txt
Workspace extension with invalid name (defaultProject) found.
```

# Step 37 - Toolbar layout fix

Corretto layout toolbar.

## Nuova disposizione

Sulla stessa linea:

```txt
sinistra: frecce periodo + titolo periodo
centro/sinistra: Genera, Rigenera, Pulisci cache, Esporta PDF
destra estrema: Mese / Settimana
```

## Dettagli

```txt
Mese/Settimana restano sempre a destra
le frecce restano compatte vicino al periodo
i pulsanti operativi sono a seguire sulla sinistra dell'area centrale
layout responsive per tablet/mobile
```

# Step 36 - WorkerAbsence con orari e mock 30 operatori

Questo pacchetto parte dallo Step 35 fix.

## WorkerAbsence

Aggiunti al modello:

```ts
startTime?: string;
endTime?: string;
```

Servono per gestire:

```txt
permessi orari
uscite anticipate
coperture parziali
test PDF con P
```

## Mock completo

Aggiunto:

```txt
projects/turni-data-access/src/lib/data/operators-full.mock.json
projects/turni-data-access/src/lib/data/operators-full.mock.ts
```

Il mock contiene:

```txt
30 operatori
ferie
malattia
permesso con startTime/endTime
riposo
casi distribuiti nel mese di maggio 2026
```

## Export

Aggiunto anche in:

```txt
projects/turni-data-access/src/public-api.ts
```

## JSON imports

Abilitati dove possibile:

```json
"resolveJsonModule": true
"esModuleInterop": true
```

# Step 35 fix - AbsenceType compatibile

Corretto errore TypeScript in:

```txt
projects/turni-data-access/src/lib/services/schedule-pdf-export.service.ts
```

## Problema

`USCITA_ANTICIPATA` era confrontato con `absenceType`, ma nel modello corrente non fa parte di `AbsenceType`.

## Correzione

`USCITA_ANTICIPATA` resta gestita come `leaveReason`, quindi viene comunque stampata come:

```txt
P = permesso / uscita anticipata
```

ma non viene più confrontata direttamente contro `absenceType`.

Ho anche reso il controllo compatibile con i tipi realmente presenti in `AbsenceType`.

# Step 35 - Marcatori assenze e separatori giorni nel PDF

Aggiornato l'export PDF.

## Marcatori

Nel PDF ora la cella mostra:

```txt
X = turno reale
F = ferie
M = malattia
P = permesso / uscita anticipata
R = riposo
```

Quindi non viene più usata sempre la X quando la presenza è figurativa.

## Separatori giorni

I bordi verticali che separano i gruppi giorno sono più visibili.

Ogni gruppo:

```txt
M P N
```

è separato dal giorno successivo con una linea verticale più marcata.

## Colori soft

I marcatori hanno colore leggero:

```txt
X azzurro soft
F verde soft
M rosso soft
P arancio soft
R grigio soft
```

# Step 34 - PDF con celle a larghezza fissa

Corretto l'export PDF.

## Cosa cambia

Prima l'ultima pagina del mese, se aveva pochi giorni, allargava le celle fino a occupare tutto il foglio.

Ora invece:

```txt
mese: le celle sono calcolate sempre su 15 giorni × 3 turni
settimana: le celle sono calcolate sempre su 7 giorni × 3 turni
```

Quindi se in una pagina restano pochi giorni, la tabella resta compatta e non si allarga.

## Colonna operatori

La prima colonna è stata ridotta ancora:

```txt
da 28mm a 22mm
```

I nomi restano in formato:

```txt
Cognome N.
```

con taglio automatico se troppo lunghi.

# Step 33 - PDF più elegante e nomi abbreviati

Migliorato lo stile dell'export PDF.

## Nomi operatori

La prima colonna è stata accorciata da 38mm a 28mm.

I nomi vengono stampati in formato:

```txt
Cognome N.
```

Esempio:

```txt
Luca Bianchi -> Bianchi L.
Anna Rossi -> Rossi A.
```

## Stile PDF

Aggiunti:

```txt
titolo con sfondo azzurro soft
intestazioni più pulite
bordi più leggeri
righe alternate
weekend evidenziati leggermente
X dentro una piccola pill soft
footer pagina
font più piccolo e centrato
```

# Step 32 - Fix PDF mese/settimana e quindicine

Corretto l'export PDF.

## Problemi risolti

```txt
il mese non rispettava esattamente i giorni del mese selezionato
il PDF sbordava con troppe colonne
la settimana doveva esportare solo i 7 giorni selezionati
```

## Nuovo comportamento

Se sei in vista mese:

```txt
stampa solo i giorni reali del mese della referenceDate
divide il mese in blocchi da 15 giorni
pagina 1: giorni 1-15
pagina 2: giorni 16-fine mese
```

Se sei in vista settimana:

```txt
stampa solo startDate-endDate
quindi i 7 giorni della settimana selezionata
```

## Layout

```txt
A4 landscape
colonna operatori fissa
M/P/N centrate
X centrate
font ridotto
celle calcolate sul blocco corrente, non su tutto il mese
```

# Step 31 fix

Corretto `TurniFacade`.

## Errore risolto

```txt
Property 'pdfExportService' does not exist on type 'TurniFacade'
```

## Correzione

Aggiunta nella classe:

```ts
private readonly pdfExportService: SchedulePdfExportService = inject(SchedulePdfExportService);
```

e confermato il metodo:

```ts
exportCurrentPlanPdf()
```

# Turni Step 31 - Export PDF griglia turni

Questo pacchetto parte dallo Step 30.

## Nuovo pulsante

Aggiunto in toolbar:

```txt
Esporta PDF
```

con icona:

```txt
picture_as_pdf
```

## Formato PDF

Il PDF viene estratto come tabella compatta:

```txt
prima riga: mese-anno, esempio mag-26
seconda riga: numero dei giorni
terza riga: M P N per ogni giorno
prima colonna: operatori
celle: X sui turni assegnati
```

Esempio logico:

```txt
          mag-26
Operatori  1       2
           M P N   M P N
Mario      X
Luigi        X       X
```

## Logica

Il PDF considera solo assegnazioni reali:

```ts
assignment.isFigurative !== true
```

Quindi malattie/assenze figurative non coprono il turno nel PDF.

## File principali

```txt
projects/turni-data-access/src/lib/services/schedule-pdf-export.service.ts
projects/turni-data-access/src/lib/store/turni.facade.ts
projects/turni-feature-schedule/src/lib/components/schedule-range-toolbar/*
projects/turni-feature-schedule/src/lib/pages/piano-turni-page/piano-turni-page.component.html
package.json
```

## Dipendenza aggiunta

```json
"jspdf": "^2.5.2"
```
