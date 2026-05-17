# Turni Step 23 - Menu moderno web app

Questo pacchetto parte dallo Step 22 e introduce una shell moderna per la web app.

## Nuovo layout

Creato:

```txt
src/app/layout/app-shell/
 ├── app-shell.component.ts
 ├── app-shell.component.html
 └── app-shell.component.scss
```

## Menu

Il menu laterale richiama le pagine già create:

```txt
/piano-turni
/piano-turni/statistiche
/piano-turni/warning
```

Voci menu:

```txt
Piano turni
Statistiche
Warning
```

## Struttura routing

`AppComponent` resta solo con:

```html
<router-outlet></router-outlet>
```

La shell contiene:

```txt
mat-sidenav-container
mat-sidenav
mat-toolbar
router-outlet
```

Il routing principale diventa:

```txt
''
 -> AppShellComponent
    -> /piano-turni lazy TurniFeatureScheduleModule
```

## Material aggiunto

Nel modulo Material condiviso sono stati aggiunti:

```txt
MatListModule
MatSidenavModule
MatToolbarModule
```

## Vantaggio

La web app ora ha una struttura pronta per nuove pagine future:

```txt
dashboard
operatori
regole
assenze
configurazioni
```

basterà aggiungere una voce nel menu e una rotta lazy.

## Avvio

```bash
rm -rf node_modules package-lock.json
npm install
npm run build
npm start
```
