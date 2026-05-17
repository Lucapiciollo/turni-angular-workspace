import { Injectable } from '@angular/core';
import {
  AuditLog,
  SchedulePlan,
  ValidationIssue,
  Worker,
  WorkerStats,
} from '../models/turni.models';

@Injectable({
  providedIn: 'root',
})
export class ScheduleExportService {
  public toCsv(plan: SchedulePlan, workers: Worker[]): string {
    const workerMap = new Map(workers.map((worker) => [worker.id, worker.name]));

    const rows: Array<Array<string | number>> = [
      [
        'Data',
        'Turno',
        'Operatore',
        'Origine',
        'Bloccato',
        'Forzato',
      ],
      ...plan.days.flatMap((day) =>
        day.assignments.map((assignment) => [
          day.date,
          assignment.shift,
          workerMap.get(assignment.workerId) ?? assignment.workerId,
          assignment.source,
          assignment.locked ? 'SI' : 'NO',
          assignment.forced ? 'SI' : 'NO',
        ]),
      ),
    ];

    return this.rowsToCsv(rows);
  }

  public auditToCsv(audits: AuditLog[]): string {
    const rows: Array<Array<string | number>> = [
      [
        'Data evento',
        'Utente',
        'Azione',
        'Messaggio',
        'Data turno',
        'Turno',
        'Operatore',
      ],
      ...audits.map((audit) => [
        audit.createdAt,
        audit.createdBy,
        audit.action,
        audit.message,
        audit.date ?? '',
        audit.shift ?? '',
        audit.workerId ?? '',
      ]),
    ];

    return this.rowsToCsv(rows);
  }

  public issuesToCsv(issues: ValidationIssue[]): string {
    const rows: Array<Array<string | number>> = [
      [
        'Severita',
        'Titolo',
        'Messaggio',
        'Data',
        'Turno',
        'Operatore',
        'Assegnazione',
      ],
      ...issues.map((issue) => [
        issue.severity,
        issue.title,
        issue.message,
        issue.date ?? '',
        issue.shift ?? '',
        issue.workerId ?? '',
        issue.assignmentId ?? '',
      ]),
    ];

    return this.rowsToCsv(rows);
  }

  public statsToCsv(stats: WorkerStats[]): string {
    const rows: Array<Array<string | number>> = [
      [
        'Operatore',
        'Turni',
        'Ore',
        'Notti',
        'Weekend',
        'Festivi',
        'Manuali',
        'Forzati',
        'Completamento',
      ],
      ...stats.map((stat) => [
        stat.name,
        stat.turni,
        stat.ore,
        stat.notti,
        stat.weekend,
        stat.festivi,
        stat.manuali,
        stat.forzati,
        `${stat.completamento}%`,
      ]),
    ];

    return this.rowsToCsv(rows);
  }

  public download(filename: string, csv: string): void {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = filename;
    anchor.click();

    URL.revokeObjectURL(url);
  }

  private rowsToCsv(rows: Array<Array<string | number>>): string {
    return rows
      .map((row) => row
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(';'))
      .join('\n');
  }
}
