// src/app/core/logger/turni-logger-init.provider.ts

import { APP_INITIALIZER, Provider } from '@angular/core';
import { TurniLoggerService } from '@turni/logging';

export function initTurniLogger(logger: TurniLoggerService): () => void {
    return () => {
        logger.configure({
            enabled: true,

            enabledLevels: [
                'INFO',
                // 'WARN',
                // 'ERROR',
            ],

            enabledCategories: [
                'PERIOD_CONTEXT',
                'RULE_CHECK',
                'REJECTION',
                'ASSIGNMENT',
                'FORCED_ASSIGNMENT',
                'GENERATION',
            ],

            writeToConsole: true,
            storeInMemory: true,
            maxMemoryLogs: 3000,
            includePayloadInConsole: true,
        });
    };
}

export const TURNI_LOGGER_INIT_PROVIDER: Provider = {
    provide: APP_INITIALIZER,
    useFactory: initTurniLogger,
    deps: [
        TurniLoggerService,
    ],
    multi: true,
};