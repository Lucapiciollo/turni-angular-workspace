import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AssignedShift, DaySchedule, ShiftDefinition, TurniFacade, Worker } from '@turni/data-access';
import { LongShiftDialogComponent, LongShiftDialogResult } from '../../components/long-shift-dialog/long-shift-dialog.component';
import {
    ManualAssignmentDialogComponent,
    ManualAssignmentDialogResult,
} from '../../components/manual-assignment-dialog/manual-assignment-dialog.component';
import {
    ShiftChangeDialogComponent,
    ShiftChangeDialogResult,
} from '../../components/shift-change-dialog/shift-change-dialog.component';

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
        this.turniFacade.ensureInitialized();
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

    openShiftChangeDialog(event: { day: DaySchedule; assignment: AssignedShift }): void {
        const dialogRef = this.dialog.open<ShiftChangeDialogComponent, {
            date: string;
            assignment: AssignedShift;
            shifts: ShiftDefinition[];
            dayAssignments: AssignedShift[];
            days: DaySchedule[];
        }, ShiftChangeDialogResult>(ShiftChangeDialogComponent, {
            width: '520px',
            data: {
                date: event.day.date,
                assignment: event.assignment,
                shifts: this.turniFacade.shifts(),
                dayAssignments: event.day.assignments,
                days: this.turniFacade.days(),
            },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (!result) {
                return;
            }

            this.turniFacade.changeShift({
                mode: result.mode,
                sourceDate: event.day.date,
                sourceShift: event.assignment.shift,
                sourceWorkerId: event.assignment.workerId,
                targetDate: result.targetDate,
                targetShift: result.targetShift,
                targetWorkerId: result.targetWorkerId,
                note: result.note,
            });
        });
    }

    openManualAssignmentDialog(event: { day: DaySchedule; shift: ShiftDefinition }): void {
        const assignedWorkerIds = event.day.assignments
            .filter((assignment) => {
                return assignment.shift === event.shift.type
                    && assignment.isFigurative !== true;
            })
            .map((assignment) => assignment.workerId);

        const dialogRef = this.dialog.open<ManualAssignmentDialogComponent, {
            date: string;
            shift: ShiftDefinition;
            assignedWorkerIds: string[];
            workers: Worker[];
        }, ManualAssignmentDialogResult>(ManualAssignmentDialogComponent, {
            width: '520px',
            data: {
                date: event.day.date,
                shift: event.shift,
                assignedWorkerIds,
                workers: this.turniFacade.workers(),
            },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (!result) {
                return;
            }

            this.turniFacade.addManualAssignment({
                date: event.day.date,
                shift: event.shift.type,
                workerId: result.workerId,
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
