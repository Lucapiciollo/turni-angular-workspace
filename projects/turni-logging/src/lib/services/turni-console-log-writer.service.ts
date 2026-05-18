import { Injectable } from '@angular/core';

import {
    TurniLogEntry,
    TurniLogWriter,
} from '../models/turni-log.models';

@Injectable({
    providedIn: 'root',
})
export class TurniConsoleLogWriterService implements TurniLogWriter {
    write(entry: TurniLogEntry): void {
        const message = `[Turni][${entry.category}] ${entry.message}`;

        if (entry.level === 'ERROR') {
            console.error(message, entry.payload ?? entry);
            return;
        }

        if (entry.level === 'WARN') {
            console.warn(message, entry.payload ?? entry);
            return;
        }

        if (entry.level === 'DEBUG') {
            console.debug(message, entry.payload ?? entry);
            return;
        }

        // console.info(message, entry.payload ?? entry);
    }
}
