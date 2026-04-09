import { ColumnTypeResolver } from '../types';
import { formatApiDateTime } from '../utils/date';
import { Date } from './date';

export const DateTimeColumnResolver: ColumnTypeResolver = {
  createColumnDef: (column) => {
    return {
      ...column,
      Cell: ({ cell }) => {
        const value = cell.getValue<Date | null>();
        if (!value) return null;

        return formatApiDateTime(value);
      },
    };
  },
  getFilterOperators: () => [],
};
