import { type DateRangeFilterValue } from './pickerHelpers';
import dayjs from 'dayjs';

// Computes the date range for relative date filter operators.
// The range is computed at rule creation time and stored as Unix ms timestamps.
const compute = (
  start: dayjs.Dayjs,
  end: dayjs.Dayjs,
): DateRangeFilterValue => ({
  from: start.valueOf(),
  to: end.valueOf(),
});

export const computeRelativeDateValue = (
  operatorId: string,
): DateRangeFilterValue | number | null => {
  const now = dayjs();

  switch (operatorId) {
    // ─── Range operators ──────────────────────────────────────────────────────
    // Both kebab-case (dateTime column type) and camelCase (date column type)
    // ids are handled since the two resolvers use different naming conventions.

    case 'current-week':
    case 'currentWeek':
      return compute(
        now.startOf('week').startOf('day'),
        now.endOf('week').endOf('day'),
      );

    case 'current-month':
    case 'currentMonth':
      return compute(
        now.startOf('month').startOf('day'),
        now.endOf('month').endOf('day'),
      );

    case 'last-7-days':
    case 'last7Days':
      return compute(now.subtract(6, 'day').startOf('day'), now.endOf('day'));

    case 'last-week':
    case 'lastWeek':
      return compute(
        now.subtract(1, 'week').startOf('week').startOf('day'),
        now.subtract(1, 'week').endOf('week').endOf('day'),
      );

    case 'last-month':
    case 'lastMonth':
      return compute(
        now.subtract(1, 'month').startOf('month').startOf('day'),
        now.subtract(1, 'month').endOf('month').endOf('day'),
      );

    // ─── Single-boundary operators ────────────────────────────────────────────

    case 'from-today':
    case 'fromToday':
      // All records on or after the start of today
      return now.startOf('day').valueOf();

    case 'to-today':
    case 'toToday':
      // All records on or before the end of today
      return now.endOf('day').valueOf();

    default:
      return null;
  }
};

// Convenience wrappers used by getInitialValue in the column resolvers

export const computeRelativeDateRange = (
  operatorId: string,
): DateRangeFilterValue =>
  computeRelativeDateValue(operatorId) as DateRangeFilterValue;

export const computeRelativeDateSingle = (operatorId: string): number =>
  computeRelativeDateValue(operatorId) as number;
