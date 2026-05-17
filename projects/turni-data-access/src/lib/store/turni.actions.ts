import { createActionGroup, emptyProps, props } from '@ngrx/store';

import {
    DateRange,
    RangeMode,
    SchedulePlan,
    ShiftDefinition,
    ShiftType,
    StatsFilterType,
    WarningFilterType,
    Worker,
    WorkerAbsence,
} from '../models/turni.models';

export const TurniActions = createActionGroup({
    source: 'Turni',
    events: {
        'Init': emptyProps(),
        'Load Initial Data': emptyProps(),
        'Load Initial Data Success': props<{
            workers: Worker[];
            shifts: ShiftDefinition[];
            absences: WorkerAbsence[];
        }>(),
        'Load Initial Data Failure': props<{
            error: string;
        }>(),
        'Set Workers': props<{
            workers: Worker[];
        }>(),
        'Set Shifts': props<{
            shifts: ShiftDefinition[];
        }>(),
        'Set Absences': props<{
            absences: WorkerAbsence[];
        }>(),
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
        'Mark Worker Sick On Shift': props<{
            date: string;
            shift: ShiftType;
            workerId: string;
            note?: string;
        }>(),
        'Mark Worker Sick On Shift Success': props<{
            plan: SchedulePlan;
            absences: WorkerAbsence[];
        }>(), 
        'Mark Worker Sick On Shift Failure': props<{
            error: string;
        }>(),
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
