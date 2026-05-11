import {
  MRT_FilterRuleMultiNumberEditor,
  MRT_FilterRuleNumberEditor,
} from './filterEditors';
import {
  type MRT_FilterOperatorDefinition,
  type ColumnTypeResolver,
  type MRT_RowData,
} from '../types';

// Resolver for numeric column type.
// Supports comparison operators plus empty/not-empty checks.
// Range operators (between) are intentionally omitted — only date columns support ranges.
export const NumberColumnResolver: ColumnTypeResolver = {
  createColumnDef: (column) => column,
  getFilterOperators: <TData extends MRT_RowData, TValue = unknown>() =>
    [
      {
        editComponent: MRT_FilterRuleNumberEditor,
        getInitialValue: () => '',
        id: 'equals',
        isValueEmpty: (value: unknown) => value === '' || value === null,
        label: 'Equals',
        triggerMode: 'commit',
        valueShape: 'single',
      },
      {
        // Mirrors MUI != operator — cell value must not equal the entered number
        editComponent: MRT_FilterRuleNumberEditor,
        getInitialValue: () => '',
        id: 'notEquals',
        isValueEmpty: (value: unknown) => value === '' || value === null,
        label: 'Not Equals',
        triggerMode: 'commit',
        valueShape: 'single',
      },
      {
        editComponent: MRT_FilterRuleNumberEditor,
        getInitialValue: () => '',
        id: 'greaterThan',
        isValueEmpty: (value: unknown) => value === '' || value === null,
        label: 'Greater Than',
        triggerMode: 'commit',
        valueShape: 'single',
      },
      {
        editComponent: MRT_FilterRuleNumberEditor,
        getInitialValue: () => '',
        id: 'greaterThanOrEqualTo',
        isValueEmpty: (value: unknown) => value === '' || value === null,
        label: 'Greater Than Or Equal To',
        triggerMode: 'commit',
        valueShape: 'single',
      },
      {
        editComponent: MRT_FilterRuleNumberEditor,
        getInitialValue: () => '',
        id: 'lessThan',
        isValueEmpty: (value: unknown) => value === '' || value === null,
        label: 'Less Than',
        triggerMode: 'commit',
        valueShape: 'single',
      },
      {
        editComponent: MRT_FilterRuleNumberEditor,
        getInitialValue: () => '',
        id: 'lessThanOrEqualTo',
        isValueEmpty: (value: unknown) => value === '' || value === null,
        label: 'Less Than Or Equal To',
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
        // Mirrors MUI isAnyOf — cell value must match one of the user-supplied numbers
        editComponent: MRT_FilterRuleMultiNumberEditor,
        getInitialValue: () => [],
        id: 'inArray',
        isValueEmpty: (value: unknown) =>
          !Array.isArray(value) || value.length === 0,
        label: 'Is Any Of',
        triggerMode: 'commit',
        valueShape: 'multi',
      },
    ] as unknown as MRT_FilterOperatorDefinition<TData, TValue>[],
};
