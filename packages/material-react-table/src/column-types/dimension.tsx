import Typography from '@mui/material/Typography';
import {
  MRT_FormDimensionInput,
  type DimensionFormValue,
} from '../components/modals/form-inputs/MRT_FormDimensionInput';
import DimensionActiveFilterItem from './activeFiltersRenderers/DimensionActiveFilterItem';
import {
  type DimensionFilterValue,
  MRT_DimensionFilterEditor,
} from './filterEditors';
import {
  type MRT_FilterOperatorDefinition,
  type ColumnTypeResolver,
  type MRT_RowData,
  type MRT_FormFieldRenderProps,
  type MRT_FormFieldConfig,
  type MRT_TableInstance,
  type MRT_ColumnDef,
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
  getFormFieldRenderer: <TData extends MRT_RowData>(
    column: MRT_ColumnDef<TData>,
    table: MRT_TableInstance<TData>,
  ) => {
    // Cast TValue to DimensionFormValue — this resolver is only called for dimension-typed columns.
    const fieldConfig =
      (column.formField as
        | MRT_FormFieldConfig<TData, DimensionFormValue>
        | undefined) ?? null;
    // Build label map from flat localization keys for the five standard dimension field names
    const { localization } = table.options;
    const fieldLabels: Record<string, string> = {
      length: localization.length,
      width: localization.width,
      height: localization.height,
      depth: localization.depth,
      tolerance: localization.tolerance,
    };
    return ({ name, columnDef }: MRT_FormFieldRenderProps<TData>) => (
      <MRT_FormDimensionInput
        columnDef={columnDef}
        fieldConfig={fieldConfig}
        fieldLabels={fieldLabels}
        name={name}
      />
    );
  },
  activeFilterRenderer: DimensionActiveFilterItem,
};
