export type TurniLogLevel =
    | 'DEBUG'
    | 'INFO'
    | 'WARN'
    | 'ERROR';

export type TurniLogCategory =
    | 'GENERATION'
    | 'RULE_CHECK'
    | 'ASSIGNMENT'
    | 'REJECTION'
    | 'FORCED_ASSIGNMENT'
    | 'CACHE'
    | 'PERIOD_CONTEXT'
    | 'SHIFT_CHANGE'
    | 'SICK_REPLACEMENT'
    | 'PDF_EXPORT'
    | 'STORAGE'
    | 'OPERATORS'
    | 'SHIFT_RULES';

export interface TurniLogEntry {
    level: TurniLogLevel;
    category: TurniLogCategory;
    message: string;

    date?: string;
    shift?: string;
    workerId?: string;
    workerName?: string;

    rules?: string[];
    payload?: unknown;

    createdAt?: string;
}

export interface TurniLoggerConfig {
    enabled: boolean;
    enabledLevels: TurniLogLevel[];
    enabledCategories: TurniLogCategory[];
    writeToConsole: boolean;
    storeInMemory: boolean;
    maxMemoryLogs: number;
    includePayloadInConsole: boolean;
}

export interface TurniLogWriter {
    write(entry: TurniLogEntry): void;
    clear?(): void;
    getLogs?(): TurniLogEntry[];
}

export const DEFAULT_TURNI_LOGGER_CONFIG: TurniLoggerConfig = {
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
};
