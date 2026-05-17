import { WorkerAbsence } from '../models/turni.models';

export const ABSENCES: WorkerAbsence[] = [
    {
        id: 'A001',
        workerId: 'W003',
        type: 'MALATTIA',
        startDate: '2026-05-05',
        endDate: '2026-05-10',
        note: 'Malattia certificata',
    },
    {
        id: 'A002',
        workerId: 'W007',
        type: 'FERIE',
        startDate: '2026-05-15',
        endDate: '2026-05-18',
        note: 'Ferie approvate',
    },
    {
        id: 'A003',
        workerId: 'W014',
        type: 'PERMESSO',
        startDate: '2026-05-20',
        endDate: '2026-05-20',
        note: 'Permesso giornaliero',
    },
    {
        id: 'A004',
        workerId: 'W019',
        type: 'RIPOSO',
        startDate: '2026-05-24',
        endDate: '2026-05-25',
        note: 'Riposo pianificato',
    },
];
