import { Injectable } from '@angular/core';

import {
    TurniLogEntry,
    TurniLogWriter,
} from '../models/turni-log.models';

@Injectable({
    providedIn: 'root',
})
export class TurniMemoryLogWriterService implements TurniLogWriter {
    private logs: TurniLogEntry[] = [];
    private maxLogs = 3000;

    configure(maxLogs: number): void {
        this.maxLogs = Math.max(0, maxLogs);
        this.trim();
    }

    write(entry: TurniLogEntry): void {
        this.logs.push(entry);
        this.trim();
    }

    getLogs(): TurniLogEntry[] {
        return [
            ...this.logs,
        ];
    }

    clear(): void {
        this.logs = [];
    }

    private trim(): void {
        if (this.maxLogs <= 0) {
            this.logs = [];
            return;
        }

        if (this.logs.length <= this.maxLogs) {
            return;
        }

        this.logs = this.logs.slice(this.logs.length - this.maxLogs);
    }
}
