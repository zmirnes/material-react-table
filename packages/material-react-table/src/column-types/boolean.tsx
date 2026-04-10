import {
  MRT_FilterOperatorDefinition,
  type ColumnTypeResolver,
  type MRT_RowData,
} from '../types';
import { MRT_FilterRuleBooleanEditor } from './filterEditors';

export const BooleanColumnResolver: ColumnTypeResolver = {
  createColumnDef: (column) => ({
    ...column,
    enableAggregation: false,
  }),
  getFilterOperators: <TData extends MRT_RowData, TValue = unknown>() =>
    [
      {
        editComponent: MRT_FilterRuleBooleanEditor,
        getInitialValue: () => '',
        id: 'equals',
        isValueEmpty: (value: unknown) => value !== true && value !== false,
        label: 'Equals',
      },
    ] as MRT_FilterOperatorDefinition<TData, TValue>[],
};
