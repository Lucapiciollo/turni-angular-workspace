import turniFullMockJson from './turni-full-mock.json';

import {
    ShiftDefinition,
    Worker,
    WorkerAbsence,
} from '../models/turni.models';

export interface TurniFullMock {
    workers: Worker[];
    absences: WorkerAbsence[];
    shifts: ShiftDefinition[];
}

export const TURNI_FULL_MOCK = turniFullMockJson as unknown as TurniFullMock;

export const FULL_MOCK_WORKERS = TURNI_FULL_MOCK.workers;
export const FULL_MOCK_ABSENCES = TURNI_FULL_MOCK.absences;
export const FULL_MOCK_SHIFTS = TURNI_FULL_MOCK.shifts;
