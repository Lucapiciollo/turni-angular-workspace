import turniFullMockJson from './turni-full-mock.json';

import {
    ShiftDefinition,
    Worker,
    WorkerAbsence,
} from '../models/turni.models';

export interface OperatorsFullMock {
    workers: Worker[];
    absences: WorkerAbsence[];
    shifts: ShiftDefinition[];
}

export const OPERATORS_FULL_MOCK = turniFullMockJson as unknown as OperatorsFullMock;
export const OPERATORS_FULL_MOCK_WORKERS = OPERATORS_FULL_MOCK.workers;
export const OPERATORS_FULL_MOCK_ABSENCES = OPERATORS_FULL_MOCK.absences;
export const OPERATORS_FULL_MOCK_SHIFTS = OPERATORS_FULL_MOCK.shifts;
