import { createActionGroup, emptyProps, props } from '@ngrx/store';

import {
    DateRange,
    RangeMode,
    SchedulePlan,
    StatsFilterType,
    WarningFilterType,
} from '../models/turni.models';

export const TurniActions = createActionGroup({
    source: 'Turni',
    events: {
        'Init': emptyProps(),

        'Open Range': props<{
            range: DateRange;
            useCache: boolean;
        }>(),

        'Set Mode': props<{
            mode: RangeMode;
        }>(),

        'Previous Range': emptyProps(),

        'Next Range': emptyProps(),

        'Refresh Range': emptyProps(),

        'Refresh Range Strong': emptyProps(),

        'Clear Current Period Cache': emptyProps(),

        'Generate Plan Success': props<{
            plan: SchedulePlan;
        }>(),

        'Generate Plan Failure': props<{
            error: string;
        }>(),

        'Select Worker': props<{
            workerId: string | null;
        }>(),

        'Set Stats Filter': props<{
            filter: StatsFilterType;
        }>(),

        'Set Warning Filter': props<{
            filter: WarningFilterType;
        }>(),

        'Reset Stats Filters': emptyProps(),

        'Reset Warning Filters': emptyProps(),
    },
});
