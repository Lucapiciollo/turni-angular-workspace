import { Assignment, AuditLog, DaySchedule, OptimizerResult, SchedulePlan, ShiftType, ValidationIssue, Worker } from '../models/turni.models';

export const mockWorkers: Worker[] = [
  { id: 'w1', name: 'Luca Bianchi', initials: 'LC', color: 'indigo', role: 'Operatore', weeklyHours: 40, allowedShifts: ['MATTINA','POMERIGGIO','NOTTE'] },
  { id: 'w2', name: 'Marco Conti', initials: 'MC', color: 'green', role: 'Operatore', weeklyHours: 40, allowedShifts: ['MATTINA','POMERIGGIO','NOTTE'] },
  { id: 'w3', name: 'Anna Neri', initials: 'AN', color: 'pink', role: 'Operatore', weeklyHours: 36, allowedShifts: ['MATTINA','POMERIGGIO','NOTTE'] },
  { id: 'w4', name: 'Giulia Servi', initials: 'GS', color: 'orange', role: 'Operatore', weeklyHours: 32, allowedShifts: ['MATTINA','POMERIGGIO','NOTTE'] }
];

const names = ['Lun','Mar','Mer','Gio','Ven','Sab','Dom','Lun'];
function assignment(date: string, shift: ShiftType, workerId: string, source: Assignment['source'] = 'AUTO', locked = false): Assignment {
  return { id: `${date}_${shift}_${workerId}`, date, shift, workerId, source, locked, forced: source === 'FORCED' };
}

export function createInitialMockPlan(name: string, startDate: string, endDate: string): SchedulePlan {
  const dates = ['2026-05-18','2026-05-19','2026-05-20','2026-05-21','2026-05-22','2026-05-23','2026-05-24','2026-05-25'];
  const days: DaySchedule[] = dates.map((date, i) => ({
    date,
    weekday: names[i],
    dayNumber: String(18+i),
    monthLabel: 'Mag 2026',
    badges: i === 5 || i === 6 ? ['Weekend'] : i === 7 ? ['Festa'] : [],
    assignments: [
      assignment(date,'MATTINA', ['w1','w4','w3','w2','w1','w4','w3','w2'][i], i===1 || i===2 ? 'MANUAL':'AUTO', i===1 || i===2),
      assignment(date,'POMERIGGIO', ['w2','w1','w4','w3','w2','w1','w4','w3'][i], i===4 ? 'MANUAL': i===5 ? 'FORCED':'AUTO', i===4 || i===5),
      ...(i === 7 ? [] : [assignment(date,'NOTTE', ['w3','w2','w1','w4','w3','w2','w1','w4'][i], i===2 ? 'FORCED':'AUTO', i===2)])
    ],
    warnings: []
  }));
  return { id: 'plan_2026_05', name, startDate, endDate, status: 'DRAFT', days, updatedAt: new Date().toISOString() };
}

export function createIssues(plan: SchedulePlan): ValidationIssue[] {
  const missing = plan.days.some(d => d.assignments.filter(a => a.shift === 'NOTTE').length === 0);
  const issues: ValidationIssue[] = [
    { id: 'i1', severity: missing ? 'ERROR' : 'WARNING', title: 'Copertura insufficiente per il turno Notte del 17/05', message: 'Mancano operatori qualificati per coprire il fabbisogno minimo.', date: '2026-05-17', shift: 'NOTTE' },
    { id: 'i2', severity: 'WARNING', title: 'Violazione riposo minimo per Marco il 12/05', message: 'Turno precedente: 22:00 - 06:00', date: '2026-05-12', workerId: 'w2' },
    { id: 'i3', severity: 'WARNING', title: 'Weekend coperto in 1 giorno su 2 nel 24/05', message: 'La policy richiede almeno 2 giorni su 2.', date: '2026-05-24' },
    { id: 'i4', severity: 'INFO', title: '2 richieste in attesa di approvazione', message: 'Richieste: Ferie e Cambio turno' }
  ];
  return issues;
}

export function optimizeMockPlan(plan: SchedulePlan): { plan: SchedulePlan; optimizer: OptimizerResult } {
  return { plan: { ...plan, updatedAt: new Date().toISOString() }, optimizer: { score: 450, attempts: 250, errors: 1, warnings: 4 } };
}

export const mockAudits: AuditLog[] = [
  { id:'a1', action:'OPTIMIZE_PLAN', message:'Piano turni Maggio 2026 ottimizzato automaticamente', createdAt:'2026-05-19T10:45:00', createdBy:'Admin' },
  { id:'a2', action:'SAVE_PLAN', message:'Piano turni Maggio 2026 salvato', createdAt:'2026-05-19T10:40:00', createdBy:'Admin' },
  { id:'a3', action:'LOCK_ASSIGNMENT', message:'Anna Neri bloccata sul turno del 20/05/2026 (08:00 - 16:00)', createdAt:'2026-05-19T09:15:00', createdBy:'Giulia Servi', workerId:'w3' },
  { id:'a4', action:'MOVE_ASSIGNMENT', message:'Marco Conti spostato dal 22/05/2026 al 21/05/2026', createdAt:'2026-05-18T16:29:00', createdBy:'Luca Bianchi', workerId:'w2' }
];
