import { MRT_FormStringInput } from '../components/modals/form-inputs/MRT_FormStringInput';
import {
  type ColumnTypeResolver,
  type MRT_ColumnDef,
  type MRT_FilterOperatorDefinition,
  type MRT_FormFieldConfig,
  type MRT_FormFieldRenderProps,
  type MRT_RowData,
  type MRT_TableInstance,
} from '../types';
import {
  MRT_FilterRuleMultiTextEditor,
  MRT_FilterRuleTextEditor,
} from './filterEditors';

// Resolver for plain string column type.
// Supports text-based operators plus empty/not-empty checks.
export const StringColumnResolver: ColumnTypeResolver = {
  createColumnDef: (column) => column,
  getFilterOperators: <TData extends MRT_RowData, TValue = unknown>() =>
    [
      {
        editComponent: MRT_FilterRuleTextEditor,
        getInitialValue: () => '',
        id: 'contains',
        // Treat blank or whitespace-only input as empty
        isValueEmpty: (value: unknown) => !`${value ?? ''}`.trim(),
        label: 'Contains',
        triggerMode: 'commit',
        valueShape: 'single',
      },
      {
        editComponent: MRT_FilterRuleTextEditor,
        getInitialValue: () => '',
        id: 'equals',
        isValueEmpty: (value: unknown) => !`${value ?? ''}`.trim(),
        label: 'Equals',
        triggerMode: 'commit',
        valueShape: 'single',
      },
      {
        // Mirrors MUI doesNotEqual — text must not match the cell value exactly
        editComponent: MRT_FilterRuleTextEditor,
        getInitialValue: () => '',
        id: 'notEquals',
        isValueEmpty: (value: unknown) => !`${value ?? ''}`.trim(),
        label: 'Does Not Equal',
        triggerMode: 'commit',
        valueShape: 'single',
      },
      {
        editComponent: MRT_FilterRuleTextEditor,
        getInitialValue: () => '',
        id: 'startsWith',
        isValueEmpty: (value: unknown) => !`${value ?? ''}`.trim(),
        label: 'Starts With',
        triggerMode: 'commit',
        valueShape: 'single',
      },
      {
        editComponent: MRT_FilterRuleTextEditor,
        getInitialValue: () => '',
        id: 'endsWith',
        isValueEmpty: (value: unknown) => !`${value ?? ''}`.trim(),
        label: 'Ends With',
        triggerMode: 'commit',
        valueShape: 'single',
      },
      {
        // Mirrors MUI doesNotContain — cell value must not include the typed substring
        editComponent: MRT_FilterRuleTextEditor,
        getInitialValue: () => '',
        id: 'notContains',
        isValueEmpty: (value: unknown) => !`${value ?? ''}`.trim(),
        label: 'Does Not Contain',
        triggerMode: 'commit',
        valueShape: 'single',
      },
      {
        // No input needed — the operator itself carries the full meaning
        editComponent: () => null,
        getInitialValue: () => null,
        id: 'isEmpty',
        isValueEmpty: () => false,
        label: 'Is Empty',
        valueShape: 'none',
      },
      {
        editComponent: () => null,
        getInitialValue: () => null,
        id: 'isNotEmpty',
        isValueEmpty: () => false,
        label: 'Is Not Empty',
        valueShape: 'none',
      },
      {
        // Mirrors MUI isAnyOf — cell value must match one of the user-supplied entries
        editComponent: MRT_FilterRuleMultiTextEditor,
        getInitialValue: () => [],
        id: 'inArray',
        isValueEmpty: (value: unknown) =>
          !Array.isArray(value) || value.length === 0,
        label: 'Is Any Of',
        triggerMode: 'commit',
        valueShape: 'multi',
      },
    ] as MRT_FilterOperatorDefinition<TData, TValue>[],
  getFormFieldRenderer: <TData extends MRT_RowData>(
    column: MRT_ColumnDef<TData>,
    // table is part of the resolver interface — not needed for the string input
    _table: MRT_TableInstance<TData>,
  ) => {
    // Extract the object-shaped fieldConfig from the column definition.
    // Function-shaped formField is handled by FormFieldControl before the resolver is called.
    const fieldConfig =
      typeof column.formField !== 'function'
        ? ((column.formField as
            | MRT_FormFieldConfig<TData, string>
            | undefined) ?? null)
        : null;
    return ({ name, columnDef }: MRT_FormFieldRenderProps<TData>) => (
      <MRT_FormStringInput
        columnDef={columnDef}
        fieldConfig={fieldConfig}
        name={name}
      />
    );
  },
};
