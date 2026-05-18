import { InjectionToken } from '@angular/core';

import {
    DEFAULT_TURNI_LOGGER_CONFIG,
    TurniLoggerConfig,
} from '../models/turni-log.models';

export const TURNI_LOGGER_CONFIG = new InjectionToken<TurniLoggerConfig>(
    'TURNI_LOGGER_CONFIG',
    {
        providedIn: 'root',
        factory: () => DEFAULT_TURNI_LOGGER_CONFIG,
    }
);
