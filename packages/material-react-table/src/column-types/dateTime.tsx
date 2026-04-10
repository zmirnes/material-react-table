import {
  MRT_FilterOperatorDefinition,
  type ColumnTypeResolver,
  type MRT_RowData,
} from '../types';
import { formatApiDateTime } from '../utils/date';
import { Date } from './date';
import {
  MRT_FilterRuleDateTimeEditor,
  MRT_FilterRuleRangeDateTimeEditor,
} from './filterEditors';

export const DateTimeColumnResolver: ColumnTypeResolver = {
  createColumnDef: (column) => {
    return {
      ...column,
      Cell: ({ cell }) => {
        const value = cell.getValue<Date | null>();
        if (!value) return null;

        return formatApiDateTime(value);
      },
    };
  },
  getFilterOperators: <TData extends MRT_RowData, TValue = unknown>() =>
    [
      {
        editComponent: MRT_FilterRuleDateTimeEditor,
        getInitialValue: () => '',
        id: 'equals',
        isValueEmpty: (value: unknown) => !value,
        label: 'Equals',
      },
      {
        editComponent: MRT_FilterRuleDateTimeEditor,
        getInitialValue: () => '',
        id: 'greaterThan',
        isValueEmpty: (value: unknown) => !value,
        label: 'After',
      },
      {
        editComponent: MRT_FilterRuleDateTimeEditor,
        getInitialValue: () => '',
        id: 'greaterThanOrEqualTo',
        isValueEmpty: (value: unknown) => !value,
        label: 'On Or After',
      },
      {
        editComponent: MRT_FilterRuleDateTimeEditor,
        getInitialValue: () => '',
        id: 'lessThan',
        isValueEmpty: (value: unknown) => !value,
        label: 'Before',
      },
      {
        editComponent: MRT_FilterRuleDateTimeEditor,
        getInitialValue: () => '',
        id: 'lessThanOrEqualTo',
        isValueEmpty: (value: unknown) => !value,
        label: 'On Or Before',
      },
      {
        editComponent: MRT_FilterRuleRangeDateTimeEditor,
        getInitialValue: () => ['', ''],
        id: 'between',
        isValueEmpty: (value: unknown) =>
          !Array.isArray(value) || value.some((item) => !item),
        label: 'Between',
      },
      {
        editComponent: MRT_FilterRuleRangeDateTimeEditor,
        getInitialValue: () => ['', ''],
        id: 'between-inclusive',
        isValueEmpty: (value: unknown) =>
          !Array.isArray(value) || value.some((item) => !item),
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
