import { Typography } from '@mui/material';
import { ColumnTypeResolver } from '../types';

export const DimensionColumnResolver: ColumnTypeResolver = {
  createColumnDef: (column) => ({
    ...column,
    Cell: ({ cell }) => {
      const value = cell.getValue<string>();
      return <Typography>{value}</Typography>;
    },
    enableAggregation: false,
  }),
  getFilterOperators: () => [],
};
