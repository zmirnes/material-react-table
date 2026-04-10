import { Typography } from '@mui/material';
import {
  MRT_FilterOperatorDefinition,
  type ColumnTypeResolver,
  type MRT_RowData,
} from '../types';
import { MRT_FilterRuleTextEditor } from './filterEditors';

export const DimensionColumnResolver: ColumnTypeResolver = {
  createColumnDef: (column) => ({
    ...column,
    Cell: ({ cell }) => {
      const value = cell.getValue<string>();
      return <Typography>{value}</Typography>;
    },
    enableAggregation: false,
  }),
  getFilterOperators: <TData extends MRT_RowData, TValue = unknown>() =>
    [
      {
        editComponent: MRT_FilterRuleTextEditor,
        getInitialValue: () => '',
        id: 'contains',
        isValueEmpty: (value: unknown) => !`${value ?? ''}`.trim(),
        label: 'Contains',
      },
      {
        editComponent: MRT_FilterRuleTextEditor,
        getInitialValue: () => '',
        id: 'equals',
        isValueEmpty: (value: unknown) => !`${value ?? ''}`.trim(),
        label: 'Equals',
      },
    ] as MRT_FilterOperatorDefinition<TData, TValue>[],
};
