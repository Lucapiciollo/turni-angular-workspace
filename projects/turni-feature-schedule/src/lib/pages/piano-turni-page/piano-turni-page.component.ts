import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AssignedShift, DaySchedule, TurniFacade } from '@turni/data-access';
import { LongShiftDialogComponent, LongShiftDialogResult } from '../../components/long-shift-dialog/long-shift-dialog.component';

@Component({
    standalone: false,
    selector: 'turni-piano-turni-page',
    templateUrl: './piano-turni-page.component.html',
    styleUrls: ['./piano-turni-page.component.scss'],
})
export class PianoTurniPageComponent implements OnInit {
    constructor(
        public turniFacade: TurniFacade,
        private dialog: MatDialog
    ) {}

    ngOnInit(): void {
        this.turniFacade.init();
    }

    openLongShiftDialog(event: { day: DaySchedule; assignment: AssignedShift }): void {
        const candidates = this.turniFacade.getLongShiftCandidates(event.day, event.assignment);

        const dialogRef = this.dialog.open<LongShiftDialogComponent, {
            date: string;
            shift: AssignedShift['shift'];
            leavingAssignment: AssignedShift;
            candidates: AssignedShift[];
        }, LongShiftDialogResult>(LongShiftDialogComponent, {
            width: '560px',
            data: {
                date: event.day.date,
                shift: event.assignment.shift,
                leavingAssignment: event.assignment,
                candidates,
            },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (!result) return;
            this.turniFacade.applyLongShift({
                date: event.day.date,
                shift: event.assignment.shift,
                leavingWorkerId: event.assignment.workerId,
                longWorkerId: result.longWorkerId,
                leaveTime: result.leaveTime,
                reason: result.reason,
                note: result.note,
            });
        });
    }

    openWorkerStatsDetail(assignment: AssignedShift): void {
        this.turniFacade.selectWorker(assignment.workerId);
        this.turniFacade.setStatsFilter('ALL');
        this.turniFacade.setWarningFilter('ALL');

        setTimeout(() => {
            this.scrollToSection('selected-worker-stat-card');
        });
    }

    openWorkerWarningsDetail(assignment: AssignedShift): void {
        this.turniFacade.selectWorker(assignment.workerId);
        this.turniFacade.setWarningFilter('ALL');
        this.turniFacade.setStatsFilter('ALL');

        setTimeout(() => {
            this.scrollToSection('section-avvisi');
        });
    }

    clearInlineWorkerDetail(): void {
        this.turniFacade.selectWorker(null);
        this.turniFacade.setStatsFilter('ALL');
        this.turniFacade.setWarningFilter('ALL');
    }

    scrollToSection(sectionId: string): void {
        const element = document.getElementById(sectionId);

        if (!element) {
            return;
        }

        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    }
}
