import { CanActivateFn, CanDeactivateFn } from '@angular/router';

export const schedulePageCanActivateGuard: CanActivateFn = () => {
    return true;
};

export const schedulePageCanDeactivateGuard: CanDeactivateFn<unknown> = () => {
    return true;
};
