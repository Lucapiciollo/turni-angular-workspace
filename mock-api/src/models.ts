export type ShiftType =
    | 'MATTINA'
    | 'POMERIGGIO'
    | 'NOTTE';

export interface ShiftDefinition {
    type: ShiftType;
    label: string;
    shortLabel?: string;
    startTime?: string;
    endTime?: string;
    start?: string;
    end?: string;
    hours: number;
    requiredWorkers: number;
}

export interface WorkerRules {
    maxConsecutiveMorning?: number;
    maxConsecutiveAfternoon?: number;
    maxNightPerWeek?: number;
    maxHoursPerMonth?: number;
    maxConsecutiveWorkingDays?: number;
    maxConsecutiveNights?: number;
}

export interface Worker {
    id: string;
    name: string;
    fullName: string;
    role: string;
    color: string;
    active?: boolean;
    enabled?: boolean;
    rules?: WorkerRules;
}

export type WorkerAbsenceType =
    | 'FERIE'
    | 'MALATTIA'
    | 'PERMESSO'
    | 'RIPOSO'
    | 'USCITA_ANTICIPATA';

export interface WorkerAbsence {
    id: string;
    workerId: string;
    type: WorkerAbsenceType;
    startDate: string;
    endDate: string;
    startTime?: string;
    endTime?: string;
    note?: string;
}

export interface TurniBootstrapData {
    workers: Worker[];
    shifts: ShiftDefinition[];
    absences: WorkerAbsence[];
}
