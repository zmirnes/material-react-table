import { Typography } from '@mui/material';
import {
  MRT_FilterOperatorDefinition,
  type ColumnTypeResolver,
  type MRT_ColumnDef,
  type MRT_FilterOperatorEditComponentProps,
  type MRT_RowData,
} from '../types';
import { MRT_SingleValueEditor } from './filterEditors/MRT_SingleValueEditor';

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
  getFilterOperators: <TData extends MRT_RowData, TValue = unknown>(
    column: MRT_ColumnDef<TData, TValue>,
  ) => {
    const selectOptions = Array.isArray(column.filterSelectOptions)
      ? column.filterSelectOptions
      : Array.isArray(column.editSelectOptions)
        ? column.editSelectOptions
        : [];

    if (!selectOptions.length) {
      return [];
    }

    return [
      {
        // MRT_SingleValueEditor is TValue-agnostic for select rendering;
        // widening TValue → unknown is safe here.
        editComponent: (props) =>
          MRT_SingleValueEditor({
            ...(props as MRT_FilterOperatorEditComponentProps<TData>),
            options: selectOptions,
          }),
        getInitialValue: () => '' as TValue,
        id: 'equals',
        isValueEmpty: (value: unknown) => value === '' || value === null,
        label: 'Equals',
      },
    ] as MRT_FilterOperatorDefinition<TData, TValue>[];
  },
};
