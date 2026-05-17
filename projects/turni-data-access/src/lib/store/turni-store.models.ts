import {
    DateRange,
    RangeMode,
    SchedulePlan,
    SchedulePlanSource,
    StatsFilterType,
    WarningFilterType,
} from '../models/turni.models';

export const TURNI_FEATURE_KEY = 'turni';

export interface TurniState {
    mode: RangeMode;
    range: DateRange | null;
    plan: SchedulePlan | null;
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
    generationSeed: 0,
    lastSource: 'GENERATED',
    loading: false,
    error: null,

    selectedWorkerId: null,
    selectedStatsFilter: 'ALL',
    selectedWarningFilter: 'ALL',
};
