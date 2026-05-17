import { Injectable } from '@angular/core';
import { AuditAction, AuditLog, ShiftType } from '../models/turni.models';
import { MomentDateUtils } from '../utils/moment-date.utils';
export interface CreateAuditLogParams { action: AuditAction; message: string; createdBy?: string; date?: string; shift?: ShiftType; workerId?: string; oldValue?: unknown; newValue?: unknown; }
@Injectable({ providedIn: 'root' })
export class ScheduleAuditService {
  create(params: CreateAuditLogParams): AuditLog { return { id: MomentDateUtils.uniqueId('audit'), action: params.action, message: params.message, createdAt: MomentDateUtils.nowIso(), createdBy: params.createdBy ?? 'Admin', date: params.date, shift: params.shift, workerId: params.workerId, oldValue: params.oldValue, newValue: params.newValue }; }
  prepend(logs: AuditLog[], log: AuditLog): AuditLog[] { return [log, ...logs]; }
}
