# Upgrade Angular 19 - NgModule non standalone

Questo pacchetto è predisposto per Angular 19 mantenendo l'architettura modulare NgModule.

## Versioni impostate

```txt
@angular/*              ^19.2.0
@angular/material       ^19.2.0
@angular/cdk            ^19.2.0
@angular/cli            ^19.2.0
@angular/compiler-cli   ^19.2.0
@angular-devkit/build-angular ^19.2.0
ng-packagr              ^19.2.0
typescript              ~5.8.3
zone.js                 ~0.15.1
rxjs                    ~7.8.1
```

## Node richiesto

Angular 19.2 richiede Node:

```txt
^18.19.1 || ^20.11.1 || ^22.0.0
```

Controlla:

```bash
node -v
```

## Comandi consigliati

Dopo aver sostituito il pacchetto:

```bash
rm -rf node_modules package-lock.json
npm install
npm run build
npm start
```

Oppure:

```bash
npm run update:angular19
```

## NgModule, non standalone

In `angular.json` sono stati aggiunti gli schematics default:

```json
"@schematics/angular:component": {
    "standalone": false
},
"@schematics/angular:directive": {
    "standalone": false
},
"@schematics/angular:pipe": {
    "standalone": false
}
```

Quindi i nuovi componenti/directive/pipe restano compatibili con l'architettura modulare.

## ux-directives

Reinstallato:

```json
"ux-directives": "^0.0.1"
```

Inizializzato nello shared:

```txt
projects/turni-shared/src/lib/ux/ux-directives-shared.module.ts
```

Importato da:

```txt
projects/turni-shared/src/lib/turni-shared.module.ts
```

Le feature continuano a importare solo:

```ts
TurniSharedModule
```

## Nota importante

Il wrapper assume che il pacchetto esponga:

```ts
UxDirectivesModule
```

Se il nome reale dell'export è diverso, devi modificare solo:

```txt
projects/turni-shared/src/lib/ux/ux-directives-shared.module.ts
```
