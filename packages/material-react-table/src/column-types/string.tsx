import {
  MRT_FilterOperatorDefinition,
  type ColumnTypeResolver,
  type MRT_RowData,
} from '../types';
import { MRT_FilterRuleTextEditor } from './filterEditors';

export const StringColumnResolver: ColumnTypeResolver = {
  createColumnDef: (column) => column,
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
      {
        editComponent: MRT_FilterRuleTextEditor,
        getInitialValue: () => '',
        id: 'startsWith',
        isValueEmpty: (value: unknown) => !`${value ?? ''}`.trim(),
        label: 'Starts With',
      },
      {
        editComponent: MRT_FilterRuleTextEditor,
        getInitialValue: () => '',
        id: 'endsWith',
        isValueEmpty: (value: unknown) => !`${value ?? ''}`.trim(),
        label: 'Ends With',
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
