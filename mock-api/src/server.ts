import cors from 'cors';
import express from 'express';

import { createId, readDb, writeDb } from './db.js';
import {
    ShiftDefinition,
    Worker,
    WorkerAbsence,
} from './models.js';

const app = express();
const port = Number(process.env.PORT ?? 3001);

app.use(cors());
app.use(express.json({
    limit: '2mb',
}));

app.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        service: 'turni-mock-api',
        port,
        now: new Date().toISOString(),
    });
});

app.get('/api/turni/bootstrap', (_req, res) => {
    res.json(readDb());
});

app.put('/api/turni/bootstrap', (req, res) => {
    const body = req.body as {
        workers?: Worker[];
        shifts?: ShiftDefinition[];
        absences?: WorkerAbsence[];
    };

    const current = readDb();

    const next = {
        workers: body.workers ?? current.workers,
        shifts: body.shifts ?? current.shifts,
        absences: body.absences ?? current.absences,
    };

    writeDb(next);

    res.json(next);
});

app.get('/api/workers', (_req, res) => {
    res.json(readDb().workers);
});

app.post('/api/workers', (req, res) => {
    const db = readDb();
    const worker = {
        ...req.body,
        id: req.body.id ?? createId('op'),
    } as Worker;

    db.workers.push(worker);
    writeDb(db);

    res.status(201).json(worker);
});

app.put('/api/workers/:id', (req, res) => {
    const db = readDb();
    const id = req.params.id;
    const existing = db.workers.find((worker) => worker.id === id);

    if (!existing) {
        res.status(404).json({
            message: `Operatore ${id} non trovato`,
        });
        return;
    }

    const updated = {
        ...existing,
        ...req.body,
        id,
    } as Worker;

    db.workers = db.workers.map((worker) => {
        return worker.id === id
            ? updated
            : worker;
    });

    writeDb(db);

    res.json(updated);
});

app.delete('/api/workers/:id', (req, res) => {
    const db = readDb();
    const id = req.params.id;

    db.workers = db.workers.filter((worker) => worker.id !== id);
    db.absences = db.absences.filter((absence) => absence.workerId !== id);

    writeDb(db);

    res.status(204).send();
});

app.get('/api/shifts', (_req, res) => {
    res.json(readDb().shifts);
});

app.put('/api/shifts', (req, res) => {
    const db = readDb();

    db.shifts = req.body as ShiftDefinition[];

    writeDb(db);

    res.json(db.shifts);
});

app.get('/api/absences', (_req, res) => {
    res.json(readDb().absences);
});

app.post('/api/absences', (req, res) => {
    const db = readDb();
    const absence = {
        ...req.body,
        id: req.body.id ?? createId('abs'),
    } as WorkerAbsence;

    db.absences.push(absence);
    writeDb(db);

    res.status(201).json(absence);
});

app.put('/api/absences/:id', (req, res) => {
    const db = readDb();
    const id = req.params.id;
    const existing = db.absences.find((absence) => absence.id === id);

    if (!existing) {
        res.status(404).json({
            message: `Assenza ${id} non trovata`,
        });
        return;
    }

    const updated = {
        ...existing,
        ...req.body,
        id,
    } as WorkerAbsence;

    db.absences = db.absences.map((absence) => {
        return absence.id === id
            ? updated
            : absence;
    });

    writeDb(db);

    res.json(updated);
});

app.delete('/api/absences/:id', (req, res) => {
    const db = readDb();
    const id = req.params.id;

    db.absences = db.absences.filter((absence) => absence.id !== id);

    writeDb(db);

    res.status(204).send();
});

app.listen(port, () => {
    console.log(`Turni Mock API attiva su http://localhost:${port}`);
});
