import {
  MRT_FilterOperatorDefinition,
  type ColumnTypeResolver,
  type MRT_RowData,
} from '../types';
import {
  MRT_FilterRuleNumberEditor,
  MRT_FilterRuleRangeNumberEditor,
} from './filterEditors';

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
      },
      {
        editComponent: MRT_FilterRuleNumberEditor,
        getInitialValue: () => '',
        id: 'greaterThan',
        isValueEmpty: (value: unknown) => value === '' || value === null,
        label: 'Greater Than',
      },
      {
        editComponent: MRT_FilterRuleNumberEditor,
        getInitialValue: () => '',
        id: 'greaterThanOrEqualTo',
        isValueEmpty: (value: unknown) => value === '' || value === null,
        label: 'Greater Than Or Equal To',
      },
      {
        editComponent: MRT_FilterRuleNumberEditor,
        getInitialValue: () => '',
        id: 'lessThan',
        isValueEmpty: (value: unknown) => value === '' || value === null,
        label: 'Less Than',
      },
      {
        editComponent: MRT_FilterRuleNumberEditor,
        getInitialValue: () => '',
        id: 'lessThanOrEqualTo',
        isValueEmpty: (value: unknown) => value === '' || value === null,
        label: 'Less Than Or Equal To',
      },
      {
        editComponent: MRT_FilterRuleRangeNumberEditor,
        getInitialValue: () => ['', ''],
        id: 'between',
        isValueEmpty: (value: unknown) =>
          !Array.isArray(value) ||
          value.some((item) => item === '' || item === null),
        label: 'Between',
      },
      {
        editComponent: MRT_FilterRuleRangeNumberEditor,
        getInitialValue: () => ['', ''],
        id: 'between-inclusive',
        isValueEmpty: (value: unknown) =>
          !Array.isArray(value) ||
          value.some((item) => item === '' || item === null),
        label: 'Between Inclusive',
      },
      {
        editComponent: () => null,
        getInitialValue: () => null,
        id: 'isEmpty',
        isValueEmpty: () => false,
        label: 'Is Empty',
      },
      {
        editComponent: () => null,
        getInitialValue: () => null,
        id: 'isNotEmpty',
        isValueEmpty: () => false,
        label: 'Is Not Empty',
      },
    ] as MRT_FilterOperatorDefinition<TData, TValue>[],
};
