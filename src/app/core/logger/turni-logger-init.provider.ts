import { APP_INITIALIZER, Provider, isDevMode } from '@angular/core';
import { TurniLoggerService } from '@turni/logging';

export function initTurniLogger(
    logger: TurniLoggerService
): () => void {
    return () => {
        if (isDevMode()) {
            logger.configure({
                enabled: true,
                enabledLevels: [
                    'DEBUG',
                    'INFO',
                    'WARN',
                    'ERROR',
                ],
                enabledCategories: [
                    'GENERATION',
                    'PERIOD_CONTEXT',
                    'RULE_CHECK',
                    'REJECTION',
                    'ASSIGNMENT',
                    'FORCED_ASSIGNMENT',
                    'CACHE',
                    'SHIFT_CHANGE',
                    'SICK_REPLACEMENT',
                    'PDF_EXPORT',
                    'STORAGE',
                    'OPERATORS',
                    'SHIFT_RULES',
                ],
                writeToConsole: true,
                storeInMemory: true,
                maxMemoryLogs: 5000,
                includePayloadInConsole: true,
            });

            logger.info({
                category: 'GENERATION',
                message: 'Logger Turni inizializzato in modalità sviluppo.',
            });

            return;
        }

        logger.configure({
            enabled: true,
            enabledLevels: [
                'WARN',
                'ERROR',
            ],
            enabledCategories: [
                'REJECTION',
                'FORCED_ASSIGNMENT',
                'GENERATION',
                'SHIFT_CHANGE',
                'SICK_REPLACEMENT',
            ],
            writeToConsole: false,
            storeInMemory: true,
            maxMemoryLogs: 1000,
            includePayloadInConsole: false,
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
