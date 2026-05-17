import {
    DateRange,
    RangeMode,
    SchedulePlan,
    SchedulePlanSource,
    ShiftDefinition,
    StatsFilterType,
    WarningFilterType,
    Worker,
    WorkerAbsence,
} from '../models/turni.models';

export const TURNI_FEATURE_KEY = 'turni';

export interface TurniState {
    mode: RangeMode;
    range: DateRange | null;
    plan: SchedulePlan | null;

    workers: Worker[];
    shifts: ShiftDefinition[];
    absences: WorkerAbsence[];

    generationSeed: number;
    lastSource: SchedulePlanSource;
    loading: boolean;
    error: string | null;

    selectedWorkerId: string | null;
    selectedStatsFilter: StatsFilterType;
    selectedWarningFilter: WarningFilterType;
}

export const initialTurniState: TurniState = {
    mode: 'MONTH',
    range: null,
    plan: null,

    workers: [],
    shifts: [],
    absences: [],

    generationSeed: 0,
    lastSource: 'GENERATED',
    loading: false,
    error: null,

    selectedWorkerId: null,
    selectedStatsFilter: 'ALL',
    selectedWarningFilter: 'ALL',
};
