import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';

import {
    AssignedShift,
    DateRange,
    SchedulePlan,
    ShiftType,
    Worker,
} from '../models/turni.models';

interface ExportColumn {
    date: string;
    dayNumber: string;
    shift: ShiftType;
    isWeekend: boolean;
}

interface ExportBlock {
    dates: string[];
    columns: ExportColumn[];
    title: string;
    subtitle: string;
}

type PdfMarker = 'X' | 'F' | 'M' | 'P' | 'R' | '';

@Injectable({
    providedIn: 'root',
})
export class SchedulePdfExportService {
    private readonly daysPerMonthPage = 15;

    private readonly shiftOrder: ShiftType[] = [
        'MATTINA',
        'POMERIGGIO',
        'NOTTE',
    ];

    exportPlan(params: {
        plan: SchedulePlan;
        workers: Worker[];
        fileName?: string;
    }): void {
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4',
        });

        const blocks = this.createExportBlocks(params.plan.range);
        const workers = this.getWorkersInPlan(params);

        blocks.forEach((block, blockIndex) => {
            if (blockIndex > 0) {
                doc.addPage();
            }

            this.drawBlock({
                doc,
                block,
                plan: params.plan,
                workers,
            });
        });

        doc.save(params.fileName ?? this.createFileName(params.plan.range));
    }

    private drawBlock(params: {
        doc: jsPDF;
        block: ExportBlock;
        plan: SchedulePlan;
        workers: Worker[];
    }): void {
        const {
            doc,
            block,
            plan,
            workers,
        } = params;

        const page = {
            width: doc.internal.pageSize.getWidth(),
            height: doc.internal.pageSize.getHeight(),
            marginLeft: 8,
            marginRight: 8,
            marginTop: 8,
            marginBottom: 8,
        };

        const availableWidth = page.width - page.marginLeft - page.marginRight;
        const operatorWidth = 22;
        const gridWidth = availableWidth - operatorWidth;
        const nominalColumnCount = this.getNominalColumnCount(params.plan.range);
        const cellWidth = gridWidth / nominalColumnCount;
        const tableWidth = operatorWidth + block.columns.length * cellWidth;

        const titleHeight = 9;
        const dayHeaderHeight = 7;
        const shiftHeaderHeight = 7;
        const rowHeight = 6.8;

        let y = page.marginTop;

        this.drawTitle({
            doc,
            title: block.title,
            subtitle: block.subtitle,
            x: page.marginLeft,
            y,
            width: tableWidth,
            height: titleHeight,
        });

        y += titleHeight;

        this.drawHeader({
            doc,
            columns: block.columns,
            x: page.marginLeft,
            y,
            operatorWidth,
            cellWidth,
            dayHeaderHeight,
            shiftHeaderHeight,
        });

        y += dayHeaderHeight + shiftHeaderHeight;

        const tableStartY = page.marginTop + titleHeight;
        const tableBodyStartY = y;

        workers.forEach((worker, rowIndex) => {
            if (y + rowHeight > page.height - page.marginBottom) {
                this.drawDayGroupSeparators({
                    doc,
                    columns: block.columns,
                    x: page.marginLeft,
                    y: tableStartY,
                    operatorWidth,
                    cellWidth,
                    height: y - tableStartY,
                });

                doc.addPage();
                y = page.marginTop;

                this.drawTitle({
                    doc,
                    title: block.title,
                    subtitle: block.subtitle,
                    x: page.marginLeft,
                    y,
                    width: tableWidth,
                    height: titleHeight,
                });

                y += titleHeight;

                this.drawHeader({
                    doc,
                    columns: block.columns,
                    x: page.marginLeft,
                    y,
                    operatorWidth,
                    cellWidth,
                    dayHeaderHeight,
                    shiftHeaderHeight,
                });

                y += dayHeaderHeight + shiftHeaderHeight;
            }

            this.drawWorkerRow({
                doc,
                plan,
                worker,
                rowIndex,
                columns: block.columns,
                x: page.marginLeft,
                y,
                operatorWidth,
                cellWidth,
                rowHeight,
            });

            y += rowHeight;
        });

        this.drawDayGroupSeparators({
            doc,
            columns: block.columns,
            x: page.marginLeft,
            y: tableStartY,
            operatorWidth,
            cellWidth,
            height: y - tableStartY,
        });

        this.drawLegend({
            doc,
            x: page.marginLeft,
            y: Math.max(y + 3, tableBodyStartY),
            maxY: page.height - page.marginBottom - 3,
        });

        this.drawFooter({
            doc,
            block,
            pageWidth: page.width,
            pageHeight: page.height,
            marginBottom: page.marginBottom,
        });
    }

    private getNominalColumnCount(range: DateRange): number {
        if (range.mode === 'WEEK') {
            return 7 * this.shiftOrder.length;
        }

        return this.daysPerMonthPage * this.shiftOrder.length;
    }

    private drawTitle(params: {
        doc: jsPDF;
        title: string;
        subtitle: string;
        x: number;
        y: number;
        width: number;
        height: number;
    }): void {
        const {
            doc,
            title,
            subtitle,
            x,
            y,
            width,
            height,
        } = params;

        doc.setDrawColor(210, 218, 232);
        doc.setFillColor(238, 244, 255);
        doc.roundedRect(x, y, width, height, 1.6, 1.6, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(31, 41, 55);
        doc.text(
            title,
            x + width / 2,
            y + 4.2,
            {
                align: 'center',
            }
        );

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.4);
        doc.setTextColor(100, 116, 139);
        doc.text(
            subtitle,
            x + width / 2,
            y + 7.1,
            {
                align: 'center',
            }
        );
    }

    private drawHeader(params: {
        doc: jsPDF;
        columns: ExportColumn[];
        x: number;
        y: number;
        operatorWidth: number;
        cellWidth: number;
        dayHeaderHeight: number;
        shiftHeaderHeight: number;
    }): void {
        const {
            doc,
            columns,
            x,
            y,
            operatorWidth,
            cellWidth,
            dayHeaderHeight,
            shiftHeaderHeight,
        } = params;

        doc.setDrawColor(196, 206, 220);
        doc.setLineWidth(0.18);
        doc.setFillColor(247, 249, 252);
        doc.rect(x, y, operatorWidth, dayHeaderHeight + shiftHeaderHeight, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.5);
        doc.setTextColor(31, 41, 55);
        doc.text('Operatori', x + 1.3, y + dayHeaderHeight + 4.6);

        const groupedDates = this.groupColumnsByDate(columns);

        groupedDates.forEach((group) => {
            const groupX = x + operatorWidth + group.startIndex * cellWidth;
            const groupWidth = group.count * cellWidth;

            doc.setDrawColor(190, 201, 218);
            doc.setLineWidth(0.28);
            doc.setFillColor(
                group.isWeekend ? 246 : 255,
                group.isWeekend ? 248 : 255,
                group.isWeekend ? 252 : 255
            );
            doc.rect(groupX, y, groupWidth, dayHeaderHeight, 'FD');

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(6.6);
            doc.setTextColor(group.isWeekend ? 79 : 31, group.isWeekend ? 124 : 41, group.isWeekend ? 255 : 55);
            doc.text(
                group.dayNumber,
                groupX + groupWidth / 2,
                y + 4.8,
                {
                    align: 'center',
                }
            );
        });

        columns.forEach((column, index) => {
            const cellX = x + operatorWidth + index * cellWidth;
            const isWeekend = column.isWeekend;

            doc.setDrawColor(224, 230, 238);
            doc.setLineWidth(0.12);
            doc.setFillColor(
                isWeekend ? 248 : 250,
                isWeekend ? 251 : 251,
                isWeekend ? 255 : 253
            );
            doc.rect(cellX, y + dayHeaderHeight, cellWidth, shiftHeaderHeight, 'FD');

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(6.1);
            doc.setTextColor(isWeekend ? 79 : 51, isWeekend ? 124 : 65, isWeekend ? 255 : 85);
            doc.text(
                this.toShortShift(column.shift),
                cellX + cellWidth / 2,
                y + dayHeaderHeight + 4.8,
                {
                    align: 'center',
                }
            );
        });

        doc.setLineWidth(0.2);
    }

    private drawWorkerRow(params: {
        doc: jsPDF;
        plan: SchedulePlan;
        worker: Worker;
        rowIndex: number;
        columns: ExportColumn[];
        x: number;
        y: number;
        operatorWidth: number;
        cellWidth: number;
        rowHeight: number;
    }): void {
        const {
            doc,
            plan,
            worker,
            rowIndex,
            columns,
            x,
            y,
            operatorWidth,
            cellWidth,
            rowHeight,
        } = params;

        const isAlternate = rowIndex % 2 === 1;
        const rowFill = isAlternate ? 252 : 255;

        doc.setDrawColor(230, 235, 243);
        doc.setLineWidth(0.12);
        doc.setFillColor(rowFill, rowFill, rowFill);
        doc.rect(x, y, operatorWidth, rowHeight, 'FD');

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(5.8);
        doc.setTextColor(31, 41, 55);
        doc.text(
            this.formatWorkerName(worker.name),
            x + 1.2,
            y + 4.55,
            {
                maxWidth: operatorWidth - 2,
            }
        );

        columns.forEach((column, index) => {
            const cellX = x + operatorWidth + index * cellWidth;
            const isWeekend = column.isWeekend;

            if (isWeekend) {
                doc.setFillColor(248, 251, 255);
            } else {
                doc.setFillColor(rowFill, rowFill, rowFill);
            }

            doc.setDrawColor(230, 235, 243);
            doc.setLineWidth(0.12);
            doc.rect(cellX, y, cellWidth, rowHeight, 'FD');

            const marker = this.getCellMarker(plan, worker.id, column.date, column.shift);

            if (marker) {
                const markerColor = this.getMarkerColor(marker);

                doc.setFillColor(markerColor.background[0], markerColor.background[1], markerColor.background[2]);
                doc.roundedRect(
                    cellX + Math.max(0.35, cellWidth * 0.18),
                    y + 1.2,
                    Math.max(2.2, cellWidth * 0.64),
                    rowHeight - 2.4,
                    0.8,
                    0.8,
                    'F'
                );

                doc.setFont('helvetica', 'bold');
                doc.setFontSize(6.9);
                doc.setTextColor(markerColor.text[0], markerColor.text[1], markerColor.text[2]);
                doc.text(
                    marker,
                    cellX + cellWidth / 2,
                    y + 4.55,
                    {
                        align: 'center',
                    }
                );
            }
        });
    }

    private drawDayGroupSeparators(params: {
        doc: jsPDF;
        columns: ExportColumn[];
        x: number;
        y: number;
        operatorWidth: number;
        cellWidth: number;
        height: number;
    }): void {
        const {
            doc,
            columns,
            x,
            y,
            operatorWidth,
            cellWidth,
            height,
        } = params;

        const groups = this.groupColumnsByDate(columns);

        doc.setDrawColor(158, 171, 190);
        doc.setLineWidth(0.35);

        groups.forEach((group) => {
            const startX = x + operatorWidth + group.startIndex * cellWidth;
            doc.line(startX, y, startX, y + height);
        });

        const endX = x + operatorWidth + columns.length * cellWidth;
        doc.line(endX, y, endX, y + height);

        doc.setLineWidth(0.12);
    }

    private drawLegend(params: {
        doc: jsPDF;
        x: number;
        y: number;
        maxY: number;
    }): void {
        if (params.y > params.maxY) {
            return;
        }

        params.doc.setFont('helvetica', 'normal');
        params.doc.setFontSize(5.8);
        params.doc.setTextColor(100, 116, 139);
        params.doc.text(
            'Legenda: X turno · F ferie · M malattia · P permesso · R riposo',
            params.x,
            params.y
        );
    }

    private drawFooter(params: {
        doc: jsPDF;
        block: ExportBlock;
        pageWidth: number;
        pageHeight: number;
        marginBottom: number;
    }): void {
        params.doc.setFont('helvetica', 'normal');
        params.doc.setFontSize(6);
        params.doc.setTextColor(148, 163, 184);
        params.doc.text(
            params.block.subtitle,
            params.pageWidth / 2,
            params.pageHeight - params.marginBottom + 2,
            {
                align: 'center',
            }
        );
    }

    private createExportBlocks(range: DateRange): ExportBlock[] {
        const dates = this.createExportDates(range);

        if (range.mode === 'WEEK') {
            return [
                this.createBlock({
                    range,
                    dates,
                    index: 0,
                    total: 1,
                }),
            ];
        }

        const chunks = this.chunkDates(
            dates,
            this.daysPerMonthPage
        );

        return chunks.map((chunk, index) => {
            return this.createBlock({
                range,
                dates: chunk,
                index,
                total: chunks.length,
            });
        });
    }

    private createBlock(params: {
        range: DateRange;
        dates: string[];
        index: number;
        total: number;
    }): ExportBlock {
        const columns = params.dates.flatMap((date) => {
            const dateObject = new Date(`${date}T00:00:00`);

            return this.shiftOrder.map((shift) => {
                return {
                    date,
                    dayNumber: String(dateObject.getDate()),
                    shift,
                    isWeekend: this.isWeekend(dateObject),
                };
            });
        });

        const firstDay = new Date(`${params.dates[0]}T00:00:00`).getDate();
        const lastDay = new Date(`${params.dates[params.dates.length - 1]}T00:00:00`).getDate();

        return {
            dates: params.dates,
            columns,
            title: this.createTitle(params.range),
            subtitle: params.range.mode === 'MONTH'
                ? `Giorni ${firstDay}-${lastDay} · pagina ${params.index + 1}/${params.total}`
                : `Settimana ${this.formatDate(params.range.startDate)} - ${this.formatDate(params.range.endDate)}`,
        };
    }

    private createExportDates(range: DateRange): string[] {
        if (range.mode === 'WEEK') {
            return this.createDateList(
                range.startDate,
                range.endDate
            );
        }

        const reference = new Date(`${range.referenceDate}T00:00:00`);
        const year = reference.getFullYear();
        const month = reference.getMonth();

        const start = new Date(year, month, 1);
        const end = new Date(year, month + 1, 0);

        return this.createDateListFromDateObjects(
            start,
            end
        );
    }

    private createDateList(
        startDate: string,
        endDate: string
    ): string[] {
        return this.createDateListFromDateObjects(
            new Date(`${startDate}T00:00:00`),
            new Date(`${endDate}T00:00:00`)
        );
    }

    private createDateListFromDateObjects(
        startDate: Date,
        endDate: Date
    ): string[] {
        const result: string[] = [];
        const current = new Date(startDate);

        while (current.getTime() <= endDate.getTime()) {
            result.push(this.toIsoDate(current));
            current.setDate(current.getDate() + 1);
        }

        return result;
    }

    private chunkDates(
        dates: string[],
        size: number
    ): string[][] {
        const chunks: string[][] = [];

        for (let index = 0; index < dates.length; index += size) {
            chunks.push(dates.slice(index, index + size));
        }

        return chunks;
    }

    private getWorkersInPlan(params: {
        plan: SchedulePlan;
        workers: Worker[];
    }): Worker[] {
        const ids = new Set<string>();

        params.plan.days.forEach((day) => {
            day.assignments.forEach((assignment) => {
                if (assignment.workerId) {
                    ids.add(assignment.workerId);
                }
            });
        });

        const workers = params.workers.filter((worker) => {
            return ids.has(worker.id);
        });

        return workers.length > 0
            ? workers
            : params.workers;
    }

    private getCellMarker(
        plan: SchedulePlan,
        workerId: string,
        date: string,
        shift: ShiftType
    ): PdfMarker {
        const day = plan.days.find((item) => {
            return item.date === date;
        });

        if (!day) {
            return '';
        }

        const assignment = day.assignments.find((item: AssignedShift) => {
            return item.workerId === workerId
                && item.date === date
                && item.shift === shift;
        });

        if (!assignment) {
            return '';
        }

        if (assignment.isFigurative === true) {
            return this.getAbsenceMarker(assignment.absenceType);
        }

        if (
            assignment.hasEarlyLeave ||
            assignment.leaveReason === 'PERMESSO' ||
            assignment.leaveReason === 'USCITA_ANTICIPATA'
        ) {
            return 'P';
        }

        return 'X';
    }

    private getAbsenceMarker(
        absenceType: AssignedShift['absenceType']
    ): PdfMarker {
        if (absenceType === 'FERIE') {
            return 'F';
        }

        if (absenceType === 'MALATTIA') {
            return 'M';
        }

        if (
            absenceType === 'PERMESSO'
        ) {
            return 'P';
        }

        if (absenceType === 'RIPOSO') {
            return 'R';
        }

        return '';
    }

    private getMarkerColor(marker: PdfMarker): {
        background: [number, number, number];
        text: [number, number, number];
    } {
        if (marker === 'F') {
            return {
                background: [237, 249, 242],
                text: [4, 120, 87],
            };
        }

        if (marker === 'M') {
            return {
                background: [255, 241, 242],
                text: [180, 35, 66],
            };
        }

        if (marker === 'P') {
            return {
                background: [255, 247, 237],
                text: [154, 52, 18],
            };
        }

        if (marker === 'R') {
            return {
                background: [241, 245, 249],
                text: [71, 85, 105],
            };
        }

        return {
            background: [238, 244, 255],
            text: [31, 41, 55],
        };
    }

    private groupColumnsByDate(columns: ExportColumn[]): Array<{
        date: string;
        dayNumber: string;
        startIndex: number;
        count: number;
        isWeekend: boolean;
    }> {
        const groups: Array<{
            date: string;
            dayNumber: string;
            startIndex: number;
            count: number;
            isWeekend: boolean;
        }> = [];

        columns.forEach((column, index) => {
            const last = groups[groups.length - 1];

            if (last && last.date === column.date) {
                last.count += 1;
                return;
            }

            groups.push({
                date: column.date,
                dayNumber: column.dayNumber,
                startIndex: index,
                count: 1,
                isWeekend: column.isWeekend,
            });
        });

        return groups;
    }

    private createTitle(range: DateRange): string {
        const reference = range.mode === 'MONTH'
            ? new Date(`${range.referenceDate}T00:00:00`)
            : new Date(`${range.startDate}T00:00:00`);

        const month = reference.toLocaleDateString('it-IT', {
            month: 'short',
        }).replace('.', '');

        const year = String(reference.getFullYear()).slice(-2);

        return `${month}-${year}`;
    }

    private createFileName(range: DateRange): string {
        if (range.mode === 'MONTH') {
            const reference = new Date(`${range.referenceDate}T00:00:00`);
            const month = String(reference.getMonth() + 1).padStart(2, '0');

            return `turni-${reference.getFullYear()}-${month}.pdf`;
        }

        return `turni-${range.startDate}-${range.endDate}.pdf`;
    }

    private formatDate(date: string): string {
        return new Date(`${date}T00:00:00`).toLocaleDateString('it-IT', {
            day: '2-digit',
            month: '2-digit',
        });
    }

    private formatWorkerName(fullName: string): string {
        const normalized = fullName
            .trim()
            .replace(/\s+/g, ' ');

        const parts = normalized.split(' ');

        if (parts.length <= 1) {
            return normalized.length > 16
                ? `${normalized.slice(0, 15)}.`
                : normalized;
        }

        const firstName = parts[0];
        const lastName = parts.slice(1).join(' ');
        const formatted = `${lastName} ${firstName.charAt(0).toUpperCase()}.`;

        return formatted.length > 18
            ? `${formatted.slice(0, 17)}.`
            : formatted;
    }

    private isWeekend(date: Date): boolean {
        const day = date.getDay();

        return day === 0 || day === 6;
    }

    private toIsoDate(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    }

    private toShortShift(shift: ShiftType): string {
        if (shift === 'MATTINA') {
            return 'M';
        }

        if (shift === 'POMERIGGIO') {
            return 'P';
        }

        return 'N';
    }
}
