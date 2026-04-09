import { Typography } from '@mui/material';
import { ColumnTypeResolver } from '../types';

export type EnumValue = {
  value: string;
  label: string;
};

export const EnumColumnResolver: ColumnTypeResolver = {
  createColumnDef: (column) => ({
    ...column,
    Cell: ({ cell }) => {
      const value = cell.getValue<EnumValue>();
      if (!value) return null;
      return <Typography>{value.label}</Typography>;
    },
    enableAggregation: false,
  }),
  getFilterOperators: () => [],
};
