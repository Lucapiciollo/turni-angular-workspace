import moment from 'moment';
moment.locale('it');
export class MomentDateUtils {
  static readonly DATE_FORMAT = 'YYYY-MM-DD';
  static readonly DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm';
  static now(): moment.Moment { return moment(); }
  static nowIso(): string { return moment().toISOString(); }
  static uniqueId(prefix: string): string { return `${prefix}_${moment().format('YYYYMMDDHHmmssSSS')}_${Math.random().toString(36).slice(2)}`; }
  static parseDate(value: string): moment.Moment { return moment(value, this.DATE_FORMAT, true); }
  static parseDateTime(date: string, time: string): moment.Moment { return moment(`${date} ${time}`, this.DATE_TIME_FORMAT, true); }
  static formatDate(value: moment.Moment): string { return value.format(this.DATE_FORMAT); }
  static isWeekend(date: string): boolean { return this.parseDate(date).isoWeekday() >= 6; }
  static sameIsoWeek(a: string, b: string): boolean { const ma = this.parseDate(a); const mb = this.parseDate(b); return ma.isoWeek() === mb.isoWeek() && ma.isoWeekYear() === mb.isoWeekYear(); }
  static sameMonth(a: string, b: string): boolean { return this.parseDate(a).isSame(this.parseDate(b), 'month'); }
  static weekKey(date: string): string { return this.parseDate(date).format('GGGG-[W]WW'); }
  static monthKey(date: string): string { return this.parseDate(date).format('YYYY-MM'); }
  static crossesMidnight(start: string, end: string): boolean { return end <= start; }
  static shiftStart(date: string, start: string): moment.Moment { return this.parseDateTime(date, start); }
  static shiftEnd(date: string, start: string, end: string): moment.Moment { const s = this.shiftStart(date, start); const e = this.parseDateTime(date, end); return e.isSameOrBefore(s) ? e.add(1, 'day') : e; }
  static hoursBetween(a: moment.Moment, b: moment.Moment): number { return b.diff(a, 'hours', true); }
  static isBetweenDays(date: string, startDate: string, endDate: string): boolean { const d = this.parseDate(date); return d.isSameOrAfter(this.parseDate(startDate), 'day') && d.isSameOrBefore(this.parseDate(endDate), 'day'); }
  static capitalize(value: string): string { return value.charAt(0).toUpperCase() + value.slice(1); }
}
