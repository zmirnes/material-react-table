import { ColumnTypeResolver } from '../types';

export const NumberColumnResolver: ColumnTypeResolver = {
  createColumnDef: (column) => column,
  getFilterOperators: () => [],
};
