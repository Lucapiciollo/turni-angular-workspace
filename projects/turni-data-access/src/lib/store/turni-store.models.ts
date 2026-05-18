import {
    DateRange,
    DaySchedule,
    GenerationDecisionLog,
    GenerationSettings,
    RangeMode,
    SchedulePlan,
    PendingSickReplacement,
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
    generationSettings: GenerationSettings;
    generationLogs: GenerationDecisionLog[];
    lastSource: SchedulePlanSource;
    loading: boolean;
    generating: boolean;
    generationProgress: number;
    generationCurrentDate: string | null;
    partialDays: DaySchedule[];
    error: string | null;

    selectedWorkerId: string | null;
    pendingSickReplacement: PendingSickReplacement | null;
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
    generationSettings: {
        previousContextDays: 14,
        enableDecisionLogs: true,
    },
    generationLogs: [],
    lastSource: 'GENERATED',
    loading: false,
    generating: false,
    generationProgress: 0,
    generationCurrentDate: null,
    partialDays: [],
    error: null,

    selectedWorkerId: null,
    pendingSickReplacement: null,
    selectedStatsFilter: 'ALL',
    selectedWarningFilter: 'ALL',
};
