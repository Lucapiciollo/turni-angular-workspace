import { Injectable } from '@angular/core';
import moment from 'moment';
import 'moment/locale/it';

import { DateRange, RangeMode } from '../models/turni.models';

moment.locale('it');

@Injectable({
    providedIn: 'root',
})
export class DateRangeService {
    constructor() {
        moment.locale('it');
    }

    createCurrentRange(mode: RangeMode): DateRange {
        const today = moment();

        if (mode === 'WEEK') {
            return this.createWeekRange(today.format('YYYY-MM-DD'));
        }

        return this.createMonthRange(today.format('YYYY-MM-DD'));
    }

    createNextRange(range: DateRange): DateRange {
        const referenceDate = moment(range.referenceDate, 'YYYY-MM-DD');

        if (range.mode === 'WEEK') {
            return this.createWeekRange(
                referenceDate
                    .add(1, 'week')
                    .format('YYYY-MM-DD')
            );
        }

        return this.createMonthRange(
            referenceDate
                .add(1, 'month')
                .startOf('month')
                .format('YYYY-MM-DD')
        );
    }

    createPreviousRange(range: DateRange): DateRange {
        const referenceDate = moment(range.referenceDate, 'YYYY-MM-DD');

        if (range.mode === 'WEEK') {
            return this.createWeekRange(
                referenceDate
                    .subtract(1, 'week')
                    .format('YYYY-MM-DD')
            );
        }

        return this.createMonthRange(
            referenceDate
                .subtract(1, 'month')
                .startOf('month')
                .format('YYYY-MM-DD')
        );
    }

    createRangeFromMode(mode: RangeMode, currentRange?: DateRange): DateRange {
        const baseDate = currentRange?.referenceDate ?? moment().format('YYYY-MM-DD');

        if (mode === 'WEEK') {
            return this.createWeekRange(baseDate);
        }

        return this.createMonthRange(baseDate);
    }

    createRangeKey(range: DateRange): string {
        return `${range.mode}_${range.startDate}_${range.endDate}`;
    }

    getDatesBetween(startDate: string, endDate: string): string[] {
        const dates: string[] = [];

        const current = moment(startDate, 'YYYY-MM-DD');
        const end = moment(endDate, 'YYYY-MM-DD');

        while (current.isSameOrBefore(end, 'day')) {
            dates.push(current.format('YYYY-MM-DD'));
            current.add(1, 'day');
        }

        return dates;
    }

    isWeekend(date: string): boolean {
        const day = moment(date, 'YYYY-MM-DD').isoWeekday();

        return day === 6 || day === 7;
    }

    getDayLabel(date: string): string {
        return moment(date, 'YYYY-MM-DD')
            .locale('it')
            .format('ddd DD/MM');
    }


    isSameIsoWeek(
        firstDate: string,
        secondDate: string
    ): boolean {
        const first = moment(firstDate, 'YYYY-MM-DD');
        const second = moment(secondDate, 'YYYY-MM-DD');

        return first.isoWeekYear() === second.isoWeekYear()
            && first.isoWeek() === second.isoWeek();
    }


    formatItalianDate(date: string): string {
        return moment(date, 'YYYY-MM-DD')
            .locale('it')
            .format('dddd D MMMM YYYY');
    }

    formatItalianMonth(date: string): string {
        return moment(date, 'YYYY-MM-DD')
            .locale('it')
            .format('MMMM YYYY');
    }

    getWeekendKey(date: string): string {
        const current = moment(date, 'YYYY-MM-DD');
        const saturday = current.clone().startOf('isoWeek').add(5, 'days');
        const sunday = current.clone().startOf('isoWeek').add(6, 'days');

        return `${saturday.format('YYYY-MM-DD')}_${sunday.format('YYYY-MM-DD')}`;
    }

    isPastRange(range: DateRange): boolean {
        const today = moment().startOf('day');
        const endDate = moment(range.endDate, 'YYYY-MM-DD').endOf('day');

        return endDate.isBefore(today, 'day');
    }

    isCurrentOrFutureRange(range: DateRange): boolean {
        return !this.isPastRange(range);
    }

    nowIso(): string {
        return moment().toISOString();
    }

    private createWeekRange(date: string): DateRange {
        const reference = moment(date, 'YYYY-MM-DD');
        const start = reference.clone().startOf('isoWeek');
        const end = reference.clone().endOf('isoWeek');

        return {
            mode: 'WEEK',
            referenceDate: reference.format('YYYY-MM-DD'),
            startDate: start.format('YYYY-MM-DD'),
            endDate: end.format('YYYY-MM-DD'),
            label: `${start.format('DD/MM/YYYY')} - ${end.format('DD/MM/YYYY')}`,
        };
    }

    private createMonthRange(date: string): DateRange {
        const reference = moment(date, 'YYYY-MM-DD').startOf('month');
        const start = reference.clone().startOf('month');
        const end = reference.clone().endOf('month');

        return {
            mode: 'MONTH',
            referenceDate: reference.format('YYYY-MM-DD'),
            startDate: start.format('YYYY-MM-DD'),
            endDate: end.format('YYYY-MM-DD'),
            label: reference.format('MMMM YYYY'),
        };
    }
}
