import { ColumnTypeResolver } from '../types';
import { formatApiDate } from '../utils/date';

export interface Date {
  date: string;
  timezone: string;
  timezone_type: number;
}

export const DateColumnResolver: ColumnTypeResolver = {
  createColumnDef: (column) => {
    return {
      ...column,
      Cell: ({ cell }) => {
        const value = cell.getValue<Date | null>();
        if (!value) return null;

        // Based on the date and timezone return date-fns formatted string in format 'DD.MM.YYYY';
        return formatApiDate(value);
      },
    };
  },
  getFilterOperators: () => [],
};
