import { Injectable } from '@angular/core';

import {
    ShiftDefinition,
    Worker,
    WorkerAbsence,
} from '../models/turni.models';

export interface TurniStoredData {
    workers: Worker[];
    shifts: ShiftDefinition[];
    absences: WorkerAbsence[];
}

@Injectable({
    providedIn: 'root',
})
export class TurniStorageService {
    private readonly storageKey = 'turni.data.v1';

    load(): TurniStoredData | null {
        if (!this.isBrowserStorageAvailable()) {
            return null;
        }

        const raw = localStorage.getItem(this.storageKey);

        if (!raw) {
            return null;
        }

        try {
            return JSON.parse(raw) as TurniStoredData;
        } catch {
            localStorage.removeItem(this.storageKey);
            return null;
        }
    }

    save(data: TurniStoredData): void {
        if (!this.isBrowserStorageAvailable()) {
            return;
        }

        localStorage.setItem(
            this.storageKey,
            JSON.stringify(data)
        );
    }

    clear(): void {
        if (!this.isBrowserStorageAvailable()) {
            return;
        }

        localStorage.removeItem(this.storageKey);
    }

    private isBrowserStorageAvailable(): boolean {
        try {
            return typeof localStorage !== 'undefined';
        } catch {
            return false;
        }
    }
}
