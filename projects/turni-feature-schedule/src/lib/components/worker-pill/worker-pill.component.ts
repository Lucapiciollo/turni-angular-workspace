import { Component, Input } from '@angular/core';
import { AssignedShift, Worker } from '@turni/data-access';

@Component({
    selector: 'turni-worker-pill',
    templateUrl: './worker-pill.component.html',
    styleUrls: ['./worker-pill.component.scss'],
})
export class WorkerPillComponent {
    @Input() assignment!: AssignedShift;
    @Input() worker?: Worker;

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
}
