import {
    ModuleWithProviders,
    NgModule,
} from '@angular/core';

import { TurniLoggerConfig } from './models/turni-log.models';
import { TURNI_LOGGER_CONFIG } from './tokens/turni-logger.tokens';

@NgModule()
export class TurniLoggingModule {
    static forRoot(config: Partial<TurniLoggerConfig> = {}): ModuleWithProviders<TurniLoggingModule> {
        return {
            ngModule: TurniLoggingModule,
            providers: [
                {
                    provide: TURNI_LOGGER_CONFIG,
                    useValue: {
                        enabled: true,
                        enabledLevels: [
                            'INFO',
                            'WARN',
                            'ERROR',
                        ],
                        enabledCategories: [
                            'GENERATION',
                            'RULE_CHECK',
                            'ASSIGNMENT',
                            'REJECTION',
                            'FORCED_ASSIGNMENT',
                            'CACHE',
                            'PERIOD_CONTEXT',
                            'SHIFT_CHANGE',
                            'SICK_REPLACEMENT',
                            'PDF_EXPORT',
                            'STORAGE',
                            'OPERATORS',
                            'SHIFT_RULES',
                        ],
                        writeToConsole: true,
                        storeInMemory: true,
                        maxMemoryLogs: 3000,
                        includePayloadInConsole: true,
                        ...config,
                    },
                },
            ],
        };
    }
}
