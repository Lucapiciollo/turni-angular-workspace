import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, combineLatest, firstValueFrom, map } from 'rxjs';
import {
  IssueSeverity,
  OptimizerResult,
  ScheduleExportService,
  TurniFacade,
  ValidationIssue,
} from '@turni/data-access';

interface ValidationVm {
  issues: ValidationIssue[];
  filteredIssues: ValidationIssue[];
  optimizer: OptimizerResult | null;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  infos: ValidationIssue[];
}

interface ValidationFilter {
  text: string;
  severity: '' | IssueSeverity;
}

@Component({
  selector: 'turni-validation-page',
  templateUrl: './validation-page.component.html',
  styleUrls: ['./validation-page.component.scss'],
})
export class ValidationPageComponent implements OnInit {
  public facade: TurniFacade = inject(TurniFacade);

  private router: Router = inject(Router);
  private exporter: ScheduleExportService = inject(ScheduleExportService);
  private filterSubject = new BehaviorSubject<ValidationFilter>({
    text: '',
    severity: '',
  });

  public vm$!: Observable<ValidationVm>;
  public filter: ValidationFilter = {
    text: '',
    severity: '',
  };

  public ngOnInit(): void {
    this.facade.load();

    this.vm$ = combineLatest({
      issues: this.facade.issues$,
      optimizer: this.facade.optimizer$,
      errors: this.facade.errors$,
      warnings: this.facade.warnings$,
      infos: this.facade.infos$,
      filter: this.filterSubject.asObservable(),
    }).pipe(
      map((value) => ({
        ...value,
        filteredIssues: this.filterIssues(value.issues, value.filter),
      })),
    );
  }

  public applyFilter(partial: Partial<ValidationFilter>): void {
    this.filter = {
      ...this.filter,
      ...partial,
    };

    this.filterSubject.next(this.filter);
  }

  public clearFilter(): void {
    this.filter = {
      text: '',
      severity: '',
    };

    this.filterSubject.next(this.filter);
  }

  public optimize(): void {
    this.facade.optimize();
  }

  public regenerate(): void {
    this.facade.regenerateCurrentRange();
  }

  public recalculate(): void {
    this.facade.recalculateIssues();
  }

  public openSchedule(): void {
    void this.router.navigate(['/piano-turni']);
  }

  public goToIssue(issue: ValidationIssue): void {
    if (!issue.date || !issue.shift) {
      this.openSchedule();
      return;
    }

    void this.router.navigate(['/modifica-turno', issue.date, issue.shift]);
  }

  public async exportIssues(): Promise<void> {
    const vm = await firstValueFrom(this.vm$);
    const csv = this.exporter.issuesToCsv(vm.filteredIssues);

    this.exporter.download('validazioni-turni.csv', csv);
  }

  public severityIcon(severity: IssueSeverity): string {
    if (severity === 'ERROR') {
      return '×';
    }

    if (severity === 'WARNING') {
      return '△';
    }

    return 'i';
  }

  public suggestionFor(issue: ValidationIssue): string {
    if (issue.title.toLowerCase().includes('scoperto')) {
      return 'Aggiungi un operatore disponibile o riduci il fabbisogno del turno.';
    }

    if (issue.message.toLowerCase().includes('riposo')) {
      return 'Sposta il turno o assegna un altro operatore con più ore di riposo.';
    }

    if (issue.message.toLowerCase().includes('ore')) {
      return 'Bilancia le ore assegnando parte dei turni ad altri operatori.';
    }

    if (issue.message.toLowerCase().includes('notte')) {
      return 'Distribuisci le notti tra più operatori o aumenta il limite mensile.';
    }

    return 'Controlla il turno e valuta una modifica manuale o una nuova ottimizzazione.';
  }

  public generalSuggestions(issues: ValidationIssue[]): string[] {
    if (!issues.length) {
      return [
        'Il piano non presenta problemi. Puoi salvarlo o pubblicarlo.',
        'Esegui comunque un controllo finale sulle assenze e sui festivi.',
      ];
    }

    return [
      'Risolvi prima gli errori, poi i warning.',
      'Usa “Ottimizza” per tentare un ribilanciamento automatico.',
      'Sblocca i turni manuali non necessari prima di ottimizzare.',
      'Controlla i turni forzati: sono utili ma generano warning.',
      'Apri il dettaglio del problema per modificare direttamente il turno.',
    ];
  }

  public trackIssue(_: number, issue: ValidationIssue): string {
    return issue.id;
  }

  private filterIssues(
    issues: ValidationIssue[],
    filter: ValidationFilter,
  ): ValidationIssue[] {
    const text = filter.text.trim().toLowerCase();

    return issues.filter((issue) => {
      const matchesText = !text || [
        issue.severity,
        issue.title,
        issue.message,
        issue.date,
        issue.shift,
        issue.workerId,
      ]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(text));

      const matchesSeverity = !filter.severity || issue.severity === filter.severity;

      return matchesText && matchesSeverity;
    });
  }
}
