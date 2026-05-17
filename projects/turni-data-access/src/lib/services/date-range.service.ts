import { Injectable } from '@angular/core';
import moment from 'moment';
import { RangeMode, ScheduleRange } from '../models/turni.models';
import { DateRangeUtils } from '../utils/date-range.utils';
@Injectable({ providedIn: 'root' })
export class DateRangeService {
  current(mode: RangeMode, date?: string): ScheduleRange { return DateRangeUtils.currentRange(mode, date ? moment(date, DateRangeUtils.FORMAT) : moment()); }
  previous(range: ScheduleRange): ScheduleRange { return DateRangeUtils.previousRange(range); }
  next(range: ScheduleRange): ScheduleRange { return DateRangeUtils.nextRange(range); }
  switchMode(range: ScheduleRange, mode: RangeMode): ScheduleRange { return DateRangeUtils.switchMode(range, mode); }
  fromKey(key: string): ScheduleRange { return DateRangeUtils.rangeFromKey(key); }
}
