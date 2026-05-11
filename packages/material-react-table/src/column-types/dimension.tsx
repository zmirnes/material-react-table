import Typography from '@mui/material/Typography';
import {
  type DimensionFilterValue,
  MRT_DimensionFilterEditor,
} from './filterEditors';
import {
  type MRT_FilterOperatorDefinition,
  type ColumnTypeResolver,
  type MRT_RowData,
} from '../types';

// Resolver for dimension column type (e.g. "100 m²").
// Renders the raw string value and supports dimension-aware filtering.
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
        editComponent: MRT_DimensionFilterEditor,
        getInitialValue: () => ({}),
        id: 'equals',
        // Value is empty when no dimension field has been filled in (ignoring rotation)
        isValueEmpty: (value: unknown) => {
          const dimensionValue = value as
            | DimensionFilterValue
            | null
            | undefined;
          if (!dimensionValue) return true;

          const fieldKeys = Object.keys(dimensionValue).filter(
            (key) => key !== 'rotation',
          );

          return fieldKeys.every((key) => dimensionValue[key] == null);
        },
        label: 'Equals',
        valueShape: 'single',
      },
    ] as MRT_FilterOperatorDefinition<TData, TValue>[],
};
