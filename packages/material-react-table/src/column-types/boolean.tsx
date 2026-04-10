import { ColumnTypeResolver } from '../types';

export const BooleanColumnResolver: ColumnTypeResolver = {
  createColumnDef: (column) => ({
    ...column,
    enableAggregation: false,
  }),
  getFilterOperators: () => [],
};
