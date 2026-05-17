import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatTooltip } from '@angular/material/tooltip';
import { AssignedShift, Worker } from '@turni/data-access';

@Component({
    standalone: false,
    selector: 'turni-worker-pill',
    templateUrl: './worker-pill.component.html',
    styleUrls: ['./worker-pill.component.scss'],
})
export class WorkerPillComponent {
    @Input() assignment!: AssignedShift;
    @Input() worker?: Worker;
    @Input() showActions = true;

    @Output() markSick = new EventEmitter<AssignedShift>();

    @Output() requestLongShift = new EventEmitter<AssignedShift>();

    @ViewChild('sourceTooltip') sourceTooltip?: MatTooltip;
    @ViewChild('statsTooltip') statsTooltip?: MatTooltip;
    @ViewChild('warningTooltip') warningTooltip?: MatTooltip;

    constructor(
        private router: Router
    ) {}

    get color(): string {
        return this.worker?.color ?? '#64748b';
    }

    get role(): string {
        return this.worker?.role ?? 'Operatore';
    }

    get isForced(): boolean {
        return this.assignment.source === 'FORCED';
    }

    get isManual(): boolean {
        return this.assignment.source === 'MANUAL';
    }

    get tooltip(): string {
        if (this.assignment.source === 'FORCED') {
            const rules = this.assignment.violatedRules.length > 0
                ? this.assignment.violatedRules.join(', ')
                : 'nessuna regola specifica';

            return (
                `Turno forzato. ${this.assignment.forcedReason ?? ''} ` +
                `Regole violate: ${rules}. Extra: ${this.assignment.extraHours} ore.`
            ).trim();
        }

        if (this.assignment.source === 'MANUAL') {
            return 'Turno inserito manualmente.';
        }

        return 'Turno assegnato automaticamente rispettando le regole.';
    }

    hideTooltips(): void {
        this.sourceTooltip?.hide(0);
        this.statsTooltip?.hide(0);
        this.warningTooltip?.hide(0);
    }

    emitRequestLongShift(event: MouseEvent): void {
        event.stopPropagation();
        this.hideTooltips();
        this.requestLongShift.emit(this.assignment);
    }

    emitMarkSick(event: MouseEvent): void {
        event.stopPropagation();
        this.hideTooltips();
        this.markSick.emit(this.assignment);
    }

    openStats(event: MouseEvent): void {
        event.stopPropagation();
        this.hideTooltips();

        this.router.navigate(
            ['/piano-turni/statistiche'],
            {
                state: {
                    workerId: this.assignment.workerId,
                    filter: 'ALL',
                    statsFilter: 'ALL',
                    origin: 'PERIOD_PLAN',
                    periodDate: this.assignment.date,
                },
            }
        );
    }

    openWarnings(event: MouseEvent): void {
        event.stopPropagation();
        this.hideTooltips();

        this.router.navigate(
            ['/piano-turni/warning'],
            {
                state: {
                    workerId: this.assignment.workerId,
                    filter: 'ALL',
                    warningFilter: 'ALL',
                    origin: 'PERIOD_PLAN',
                    periodDate: this.assignment.date,
                },
            }
        );
    }
}
