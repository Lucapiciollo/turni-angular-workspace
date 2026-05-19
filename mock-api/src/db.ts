import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { TurniBootstrapData } from './models.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'data', 'turni-full-mock.json');

export function readDb(): TurniBootstrapData {
    const raw = fs.readFileSync(dbPath, 'utf-8');

    return JSON.parse(raw) as TurniBootstrapData;
}

export function writeDb(data: TurniBootstrapData): void {
    fs.writeFileSync(
        dbPath,
        JSON.stringify(data, null, 2),
        'utf-8'
    );
}

export function createId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}
