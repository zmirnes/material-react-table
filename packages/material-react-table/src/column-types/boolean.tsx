import { MRT_FormBooleanInput } from '../components/modals/form-inputs/MRT_FormBooleanInput';
import BooleanActiveFilterItem from './activeFiltersRenderers/BooleanActiveFilterItem';
import { MRT_FilterRuleBooleanEditor } from './filterEditors';
import {
  type MRT_FilterOperatorDefinition,
  type ColumnTypeResolver,
  type MRT_ColumnDef,
  type MRT_FormFieldConfig,
  type MRT_FormFieldRenderProps,
  type MRT_RowData,
  type MRT_TableInstance,
} from '../types';

// Resolver for boolean column type.
// Disables aggregation since booleans can't be meaningfully aggregated.
export const BooleanColumnResolver: ColumnTypeResolver = {
  createColumnDef: (column) => ({
    ...column,
    enableAggregation: false,
  }),
  getFilterOperators: <TData extends MRT_RowData, TValue = unknown>() =>
    [
      {
        // A boolean filter only makes sense as equality — true or false
        editComponent: MRT_FilterRuleBooleanEditor,
        getInitialValue: () => '',
        id: 'equals',
        // Empty unless the user has explicitly picked true or false
        isValueEmpty: (value: unknown) => value !== true && value !== false,
        label: 'Equals',
        valueShape: 'single',
      },
    ] as MRT_FilterOperatorDefinition<TData, TValue>[],
  getFormFieldRenderer: <TData extends MRT_RowData>(
    column: MRT_ColumnDef<TData>,
    table: MRT_TableInstance<TData>,
  ) => {
    // Cast TValue to boolean | null — this resolver is only called for boolean-typed columns.
    const fieldConfig =
      (column.formField as
        | MRT_FormFieldConfig<TData, boolean | null>
        | undefined) ?? null;
    // Resolve localized true/false labels from the table localization config
    const trueLabel = table.options.localization.booleanTrue;
    const falseLabel = table.options.localization.booleanFalse;
    return ({ name, columnDef }: MRT_FormFieldRenderProps<TData>) => (
      <MRT_FormBooleanInput
        columnDef={columnDef}
        falseLabel={falseLabel}
        fieldConfig={fieldConfig}
        name={name}
        trueLabel={trueLabel}
      />
    );
  },
  activeFilterRenderer: BooleanActiveFilterItem,
};
