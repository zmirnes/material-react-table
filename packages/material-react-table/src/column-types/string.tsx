import { ColumnTypeResolver } from '../types';

export const StringColumnResolver: ColumnTypeResolver = {
  createColumnDef: (column) => column,
  getFilterOperators: () => [],
};
