import moment from 'moment';
import { RangeMode, ScheduleRange } from '../models/turni.models';
import { MomentDateUtils } from './moment-date.utils';
moment.locale('it');
export class DateRangeUtils {
  static readonly FORMAT = MomentDateUtils.DATE_FORMAT;
  static currentRange(mode: RangeMode, date: moment.Moment = moment()): ScheduleRange { return mode === 'MONTH' ? this.monthRange(date) : this.weekRange(date); }
  static rangeFromKey(key: string): ScheduleRange { const [mode, value] = key.split(':') as [RangeMode, string]; return mode === 'MONTH' ? this.monthRange(moment(value + '-01', this.FORMAT)) : this.weekRange(moment(value, this.FORMAT)); }
  static nextRange(range: ScheduleRange): ScheduleRange { const base = moment(range.anchorDate ?? range.startDate, this.FORMAT); return range.mode === 'MONTH' ? this.monthRange(base.add(1, 'month')) : this.weekRange(base.add(1, 'week')); }
  static previousRange(range: ScheduleRange): ScheduleRange { const base = moment(range.anchorDate ?? range.startDate, this.FORMAT); return range.mode === 'MONTH' ? this.monthRange(base.subtract(1, 'month')) : this.weekRange(base.subtract(1, 'week')); }
  static switchMode(current: ScheduleRange, mode: RangeMode): ScheduleRange { const base = moment(current.anchorDate ?? current.startDate, this.FORMAT); return mode === 'MONTH' ? this.monthRange(base) : this.weekRange(base); }
  static monthRange(date: moment.Moment): ScheduleRange {
    const monthStart = date.clone().startOf('month'); const monthEnd = date.clone().endOf('month'); const start = monthStart.clone().startOf('isoWeek'); const end = monthEnd.clone().endOf('isoWeek');
    return { key: `MONTH:${monthStart.format('YYYY-MM')}`, mode: 'MONTH', label: MomentDateUtils.capitalize(monthStart.format('MMMM YYYY')), startDate: start.format(this.FORMAT), endDate: end.format(this.FORMAT), visibleDays: end.diff(start, 'days') + 1, anchorDate: monthStart.format(this.FORMAT) };
  }
  static weekRange(date: moment.Moment): ScheduleRange { const start = date.clone().startOf('isoWeek'); const end = date.clone().endOf('isoWeek'); return { key: `WEEK:${start.format(this.FORMAT)}`, mode: 'WEEK', label: `${start.format('DD MMM')} - ${end.format('DD MMM YYYY')}`, startDate: start.format(this.FORMAT), endDate: end.format(this.FORMAT), visibleDays: 7, anchorDate: start.format(this.FORMAT) }; }
  static daysBetween(startDate: string, endDate: string): string[] { const days: string[] = []; const current = moment(startDate, this.FORMAT); const end = moment(endDate, this.FORMAT); while (current.isSameOrBefore(end, 'day')) { days.push(current.format(this.FORMAT)); current.add(1, 'day'); } return days; }
  static dayLabels(date: string, holidays: {date:string; name:string}[] = []): { weekday: string; dayNumber: string; monthLabel: string; badges: string[] } { const m = moment(date, this.FORMAT); const badges: string[] = []; if (m.isoWeekday() >= 6) badges.push('Weekend'); const holiday = holidays.find(h => h.date === date); if (holiday) badges.push(holiday.name); return { weekday: MomentDateUtils.capitalize(m.format('ddd')), dayNumber: m.format('DD'), monthLabel: MomentDateUtils.capitalize(m.format('MMM YYYY')), badges }; }
}
