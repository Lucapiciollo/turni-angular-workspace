# Turni Mock API

Servizio Node.js/Express per servire i dati mock dell'app Turni.

## Installazione

```bash
cd mock-api
npm install
```

## Avvio sviluppo

```bash
npm run dev
```

API disponibile su:

```txt
http://localhost:3001
```

## Endpoint principali

```txt
GET    /health
GET    /api/turni/bootstrap
PUT    /api/turni/bootstrap

GET    /api/workers
POST   /api/workers
PUT    /api/workers/:id
DELETE /api/workers/:id

GET    /api/shifts
PUT    /api/shifts

GET    /api/absences
POST   /api/absences
PUT    /api/absences/:id
DELETE /api/absences/:id
```

## Dati

Il database mock è un JSON locale:

```txt
mock-api/src/data/turni-full-mock.json
```
