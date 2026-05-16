# Turni Workforce Angular

Workspace Angular modulare per gestione turni **Mattina / Pomeriggio / Notte** con UI moderna, NgRx, lazy routing e librerie per pagina.

## Struttura

```txt
src/app
  shell/                      # layout principale con sidebar
projects/
  turni-data-access/          # modelli, NgRx actions/reducer/selectors/effects/facade, mock API
  turni-shared-ui/            # SharedModule + motore SCSS tokens/mixin/theme
  turni-feature-dashboard/    # Dashboard
  turni-feature-schedule/     # Tabella turni
  turni-feature-manual-edit/  # Modifica manuale turno
  turni-feature-audit/        # Storico modifiche
  turni-feature-validation/   # Validazione e ottimizzazione
```

## Avvio

```bash
npm install
npm start
```

Apri `http://localhost:4200`.

## NgRx incluso

- `TurniActions`
- `turniReducer`
- `TurniEffects`
- `TurniFacade`
- selector per piano, operatori, giorni, audit, errori, warning, statistiche
- persistenza mock su `localStorage`

## Rotte principali

```txt
/dashboard
/piano-turni
/modifica-turno/:date/:shift
/validazioni
/audit
```

## Note

Il progetto è generato come base modulare. Le API sono mock, già separate in `MockTurniApiService`, quindi puoi sostituirle facilmente con HTTP reali.
