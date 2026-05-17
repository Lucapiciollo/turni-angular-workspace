import { Injectable } from '@angular/core';
import moment from 'moment';

import {
    AbsenceType,
    WorkerAbsence,
} from '../models/turni.models';

@Injectable({
    providedIn: 'root',
})
export class WorkerAbsenceService {
    isWorkerAbsent(params: {
        workerId: string;
        date: string;
        absences: WorkerAbsence[];
    }): boolean {
        return this.getAbsenceForDate(params) !== null;
    }

    isWorkerInSickLeave(params: {
        workerId: string;
        date: string;
        absences: WorkerAbsence[];
    }): boolean {
        const absence = this.getAbsenceForDate(params);

        return absence?.type === 'MALATTIA';
    }

    getAbsenceForDate(params: {
        workerId: string;
        date: string;
        absences: WorkerAbsence[];
    }): WorkerAbsence | null {
        const targetDate = moment(params.date, 'YYYY-MM-DD');

        const absence = params.absences.find((item) => {
            const startDate = moment(item.startDate, 'YYYY-MM-DD');
            const endDate = moment(item.endDate, 'YYYY-MM-DD');

            return item.workerId === params.workerId
                && targetDate.isSameOrAfter(startDate, 'day')
                && targetDate.isSameOrBefore(endDate, 'day');
        });

        return absence ?? null;
    }

    getAbsenceLabel(type: AbsenceType): string {
        if (type === 'MALATTIA') {
            return 'Malattia';
        }

        if (type === 'FERIE') {
            return 'Ferie';
        }

        if (type === 'PERMESSO') {
            return 'Permesso';
        }

        return 'Riposo';
    }
}
