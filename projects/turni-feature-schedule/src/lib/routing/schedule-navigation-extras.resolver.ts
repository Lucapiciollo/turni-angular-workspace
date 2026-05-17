import { inject } from '@angular/core';
import {
    ResolveFn,
    Router,
} from '@angular/router';
import { ScheduleNavigationExtras } from '@turni/data-access';

export const scheduleNavigationExtrasResolver: ResolveFn<ScheduleNavigationExtras> = () => {
    const router = inject(Router);

    const currentNavigationState =
        router.getCurrentNavigation()?.extras.state as ScheduleNavigationExtras | undefined;

    const historyState = history.state as ScheduleNavigationExtras | undefined;

    return {
        ...(historyState ?? {}),
        ...(currentNavigationState ?? {}),
    };
};
