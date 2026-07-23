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

    case 'current-week':
      return compute(
        now.startOf('week').startOf('day'),
        now.endOf('week').endOf('day'),
      );

    case 'current-month':
      return compute(
        now.startOf('month').startOf('day'),
        now.endOf('month').endOf('day'),
      );

    case 'last-7-days':
      return compute(now.subtract(6, 'day').startOf('day'), now.endOf('day'));

    case 'last-week':
      return compute(
        now.subtract(1, 'week').startOf('week').startOf('day'),
        now.subtract(1, 'week').endOf('week').endOf('day'),
      );

    case 'last-month':
      return compute(
        now.subtract(1, 'month').startOf('month').startOf('day'),
        now.subtract(1, 'month').endOf('month').endOf('day'),
      );

    // ─── Single-boundary operators ────────────────────────────────────────────

    case 'from-today':
      // All records on or after the start of today
      return now.startOf('day').valueOf();

    case 'to-today':
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
