import {
  MRT_FilterOperatorDefinition,
  type ColumnTypeResolver,
  type MRT_RowData,
} from '../types';
import { MRT_FilterRuleBooleanEditor } from './filterEditors';

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
      },
    ] as MRT_FilterOperatorDefinition<TData, TValue>[],
};
