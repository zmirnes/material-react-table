import { Typography } from '@mui/material';
import {
  MRT_FilterOperatorDefinition,
  type ColumnTypeResolver,
  type MRT_ColumnDef,
  type MRT_FilterOperatorEditComponentProps,
  type MRT_RowData,
} from '../types';
import { MRT_MultiValueEditor } from './filterEditors/MRT_MultiValueEditor';
import { MRT_SingleValueEditor } from './filterEditors/MRT_SingleValueEditor';

// Shape of an enum cell value — resolved label is shown in the cell
export type EnumValue = {
  value: string;
  label: string;
};

// Resolver for enum column type.
// Renders only the human-readable label and provides select/multi-select filters.
export const EnumColumnResolver: ColumnTypeResolver = {
  createColumnDef: (column) => ({
    ...column,
    Cell: ({ cell }) => {
      const value = cell.getValue<EnumValue>();
      if (!value) return null;
      // Display the label, not the raw value
      return <Typography>{value.label}</Typography>;
    },
    enableAggregation: false,
  }),
  getFilterOperators: <TData extends MRT_RowData, TValue = unknown>(
    column: MRT_ColumnDef<TData, TValue>,
  ) => {
    // Resolve enum options from column meta — defined by the consuming application
    const enumOptions = column.meta?.enumValues ?? [];

    // Without options no meaningful filter can be built
    if (!enumOptions.length) {
      return [];
    }

    // Shared single-select editor factory — used by 'equals' and 'notEquals'
    const createSingleSelectEditor = (
      props: MRT_FilterOperatorEditComponentProps<TData>,
    ) =>
      MRT_SingleValueEditor({
        ...(props as MRT_FilterOperatorEditComponentProps<TData>),
        options: enumOptions,
      });

    // Multi-select editor factory — used by 'inArray'
    const createMultiSelectEditor = (
      props: MRT_FilterOperatorEditComponentProps<TData>,
    ) =>
      MRT_MultiValueEditor({
        ...(props as MRT_FilterOperatorEditComponentProps<TData>),
        options: enumOptions,
      });

    return [
      {
        // 'Je' — single value must match exactly
        editComponent: createSingleSelectEditor,
        getInitialValue: () => '' as TValue,
        id: 'equals',
        isValueEmpty: (value: unknown) => value === '' || value === null,
        label: 'Equals',
      },
      {
        // 'Nije' — single value must not match
        editComponent: createSingleSelectEditor,
        getInitialValue: () => '' as TValue,
        id: 'notEquals',
        isValueEmpty: (value: unknown) => value === '' || value === null,
        label: 'Not Equals',
      },
      {
        // 'Je bilo koje od' — value must be one of the selected options
        editComponent: createMultiSelectEditor,
        getInitialValue: () => [] as unknown as TValue,
        id: 'inArray',
        // Empty when no options are selected
        isValueEmpty: (value: unknown) =>
          !Array.isArray(value) || value.length === 0,
        label: 'Is any of',
      },
    ] as MRT_FilterOperatorDefinition<TData, TValue>[];
  },
};
