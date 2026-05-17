import { Injectable } from '@angular/core';
import { AuditLog, SchedulePlan, Worker } from '../models/turni.models';
@Injectable({ providedIn: 'root' })
export class ScheduleExportService {
  toCsv(plan: SchedulePlan, workers: Worker[]): string { const map = new Map(workers.map(w => [w.id, w.name])); return this.rowsToCsv([['Data','Turno','Operatore','Origine','Bloccato','Forzato'], ...plan.days.flatMap(day => day.assignments.map(a => [day.date, a.shift, map.get(a.workerId) ?? a.workerId, a.source, a.locked ? 'SI' : 'NO', a.forced ? 'SI' : 'NO']))]); }
  auditToCsv(audits: AuditLog[]): string { return this.rowsToCsv([['Data evento','Utente','Azione','Messaggio','Data turno','Turno','Operatore'], ...audits.map(a => [a.createdAt, a.createdBy, a.action, a.message, a.date ?? '', a.shift ?? '', a.workerId ?? ''])]); }
  download(filename: string, csv: string): void { const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url); }
  private rowsToCsv(rows: Array<Array<string | number>>): string { return rows.map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(';')).join('\n'); }
}
