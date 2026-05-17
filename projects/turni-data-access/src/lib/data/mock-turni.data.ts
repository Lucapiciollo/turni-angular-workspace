import { ShiftDefinition, Worker } from '../models/turni.models';
import workersMock from './workers.mock.json';

interface WorkersMockFile {
    workers: Worker[];
}

const workersData = workersMock as WorkersMockFile;

export const WORKERS: Worker[] = workersData.workers
    .filter((worker) => {
        return worker.enabled !== false;
    })
    .map((worker) => {
        return {
            ...worker,
            name: worker.fullName,
        };
    });

export const SHIFTS: ShiftDefinition[] = [
    {
        type: 'MATTINA',
        label: 'Mattina',
        start: '06:00',
        end: '14:00',
        requiredWorkers: 6,
        hours: 8,
    },
    {
        type: 'POMERIGGIO',
        label: 'Pomeriggio',
        start: '14:00',
        end: '22:00',
        requiredWorkers: 6,
        hours: 8,
    },
    {
        type: 'NOTTE',
        label: 'Notte',
        start: '22:00',
        end: '06:00',
        requiredWorkers: 4,
        hours: 8,
    },
];
