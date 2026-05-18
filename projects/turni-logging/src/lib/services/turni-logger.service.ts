import {
    Inject,
    Injectable,
} from '@angular/core';

import {
    TurniLogCategory,
    TurniLogEntry,
    TurniLoggerConfig,
    TurniLogLevel,
} from '../models/turni-log.models';
import { TURNI_LOGGER_CONFIG } from '../tokens/turni-logger.tokens';
import { TurniConsoleLogWriterService } from './turni-console-log-writer.service';
import { TurniMemoryLogWriterService } from './turni-memory-log-writer.service';

@Injectable({
    providedIn: 'root',
})
export class TurniLoggerService {
    private config: TurniLoggerConfig;

    constructor(
        @Inject(TURNI_LOGGER_CONFIG) config: TurniLoggerConfig,
        private consoleWriter: TurniConsoleLogWriterService,
        private memoryWriter: TurniMemoryLogWriterService
    ) {
        this.config = {
            ...config,
            enabledLevels: [
                ...config.enabledLevels,
            ],
            enabledCategories: [
                ...config.enabledCategories,
            ],
        };

        this.memoryWriter.configure(this.config.maxMemoryLogs);
    }

    configure(config: Partial<TurniLoggerConfig>): void {
        this.config = {
            ...this.config,
            ...config,
            enabledLevels: config.enabledLevels
                ? [
                    ...config.enabledLevels,
                ]
                : this.config.enabledLevels,
            enabledCategories: config.enabledCategories
                ? [
                    ...config.enabledCategories,
                ]
                : this.config.enabledCategories,
        };

        this.memoryWriter.configure(this.config.maxMemoryLogs);
    }

    getConfig(): TurniLoggerConfig {
        return {
            ...this.config,
            enabledLevels: [
                ...this.config.enabledLevels,
            ],
            enabledCategories: [
                ...this.config.enabledCategories,
            ],
        };
    }

    enable(): void {
        this.configure({
            enabled: true,
        });
    }

    disable(): void {
        this.configure({
            enabled: false,
        });
    }

    enableOnlyCategories(categories: TurniLogCategory[]): void {
        this.configure({
            enabledCategories: categories,
        });
    }

    enableOnlyLevels(levels: TurniLogLevel[]): void {
        this.configure({
            enabledLevels: levels,
        });
    }

    log(entry: TurniLogEntry): void {
        if (!this.shouldLog(entry)) {
            return;
        }

        const normalized = this.normalizeEntry(entry);

        if (this.config.storeInMemory) {
            this.memoryWriter.write(normalized);
        }

        if (this.config.writeToConsole) {
            this.consoleWriter.write(
                this.config.includePayloadInConsole
                    ? normalized
                    : {
                        ...normalized,
                        payload: undefined,
                    }
            );
        }
    }

    debug(entry: Omit<TurniLogEntry, 'level'>): void {
        this.log({
            ...entry,
            level: 'DEBUG',
        });
    }

    info(entry: Omit<TurniLogEntry, 'level'>): void {
        this.log({
            ...entry,
            level: 'INFO',
        });
    }

    warn(entry: Omit<TurniLogEntry, 'level'>): void {
        this.log({
            ...entry,
            level: 'WARN',
        });
    }

    error(entry: Omit<TurniLogEntry, 'level'>): void {
        this.log({
            ...entry,
            level: 'ERROR',
        });
    }

    getLogs(): TurniLogEntry[] {
        return this.memoryWriter.getLogs();
    }

    clear(): void {
        this.memoryWriter.clear();
    }

    private shouldLog(entry: TurniLogEntry): boolean {
        return this.config.enabled
            && this.config.enabledLevels.includes(entry.level)
            && this.config.enabledCategories.includes(entry.category);
    }

    private normalizeEntry(entry: TurniLogEntry): TurniLogEntry {
        return {
            ...entry,
            createdAt: entry.createdAt ?? new Date().toISOString(),
            rules: entry.rules
                ? [
                    ...entry.rules,
                ]
                : undefined,
        };
    }
}
