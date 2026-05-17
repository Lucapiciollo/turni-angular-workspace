import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, combineLatest, firstValueFrom, map } from 'rxjs';
import {
  AuditAction,
  AuditLog,
  ScheduleExportService,
  TurniFacade,
} from '@turni/data-access';

interface AuditFilter {
  text: string;
  action: string;
  fromDate: string;
  toDate: string;
}

@Component({
  selector: 'turni-audit-page',
  templateUrl: './audit-page.component.html',
  styleUrls: ['./audit-page.component.scss'],
})
export class AuditPageComponent implements OnInit {
  public facade: TurniFacade = inject(TurniFacade);

  private exporter: ScheduleExportService = inject(ScheduleExportService);
  private router: Router = inject(Router);
  private filterSubject = new BehaviorSubject<AuditFilter>({
    text: '',
    action: '',
    fromDate: '',
    toDate: '',
  });

  public audits$!: Observable<AuditLog[]>;
  public filteredAudits$!: Observable<AuditLog[]>;
  public actions$!: Observable<AuditAction[]>;

  public filter: AuditFilter = {
    text: '',
    action: '',
    fromDate: '',
    toDate: '',
  };

  public ngOnInit(): void {
    this.facade.load();

    this.audits$ = this.facade.audits$;
    this.actions$ = this.audits$.pipe(
      map((audits) => Array.from(new Set(audits.map((audit) => audit.action))).sort()),
    );

    this.filteredAudits$ = combineLatest([
      this.audits$,
      this.filterSubject.asObservable(),
    ]).pipe(
      map(([audits, filter]) => this.filterAudits(audits, filter)),
    );
  }

  public applyFilter(partial: Partial<AuditFilter>): void {
    this.filter = {
      ...this.filter,
      ...partial,
    };

    this.filterSubject.next(this.filter);
  }

  public clearFilters(): void {
    this.filter = {
      text: '',
      action: '',
      fromDate: '',
      toDate: '',
    };

    this.filterSubject.next(this.filter);
  }

  public async exportAudit(): Promise<void> {
    const audits = await firstValueFrom(this.filteredAudits$);
    const csv = this.exporter.auditToCsv(audits);

    this.exporter.download('audit-turni.csv', csv);
  }

  public openLog(log: AuditLog): void {
    if (log.date && log.shift) {
      void this.router.navigate(['/modifica-turno', log.date, log.shift]);
      return;
    }

    void this.router.navigate(['/piano-turni']);
  }

  public icon(action: AuditAction): string {
    if (action.includes('SAVE')) {
      return '💾';
    }

    if (action.includes('LOCK')) {
      return '🔒';
    }

    if (action.includes('UNLOCK')) {
      return '🔓';
    }

    if (action.includes('MOVE')) {
      return '↔';
    }

    if (action.includes('OPTIMIZE')) {
      return '✦';
    }

    if (action.includes('PUBLISH')) {
      return '🚀';
    }

    if (action.includes('ARCHIVE')) {
      return '📦';
    }

    if (action.includes('FORCE')) {
      return '⚠';
    }

    if (action.includes('REMOVE') || action.includes('CLEAR')) {
      return '−';
    }

    if (action.includes('ASSIGN') || action.includes('CREATE')) {
      return '+';
    }

    return '✓';
  }

  public actionClass(action: AuditAction): string {
    if (action.includes('FORCE') || action.includes('CLEAR') || action.includes('REMOVE')) {
      return 'danger';
    }

    if (action.includes('LOCK') || action.includes('MOVE')) {
      return 'primary';
    }

    if (action.includes('PUBLISH') || action.includes('SAVE')) {
      return 'success';
    }

    return 'info';
  }

  public trackAudit(_: number, log: AuditLog): string {
    return log.id;
  }

  private filterAudits(audits: AuditLog[], filter: AuditFilter): AuditLog[] {
    const text = filter.text.trim().toLowerCase();

    return audits.filter((log) => {
      const matchesText = !text || [
        log.action,
        log.message,
        log.createdBy,
        log.date,
        log.shift,
        log.workerId,
      ]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(text));

      const matchesAction = !filter.action || log.action === filter.action;
      const eventDate = log.createdAt.slice(0, 10);
      const matchesFrom = !filter.fromDate || eventDate >= filter.fromDate;
      const matchesTo = !filter.toDate || eventDate <= filter.toDate;

      return matchesText && matchesAction && matchesFrom && matchesTo;
    });
  }
}
