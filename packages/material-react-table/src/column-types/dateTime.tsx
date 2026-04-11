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

// Resolver for date-time column type.
// Mirrors DateColumnResolver but uses datetime pickers and formatting.
export const DateTimeColumnResolver: ColumnTypeResolver = {
  createColumnDef: (column) => {
    return {
      ...column,
      Cell: ({ cell }) => {
        const value = cell.getValue<Date | null>();
        if (!value) return null;

        // Format to localised date+time string (e.g. 'DD.MM.YYYY HH:mm')
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
        // Any falsy value (empty string, null, undefined) means no datetime selected
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
        // Range value is stored as [startDatetime, endDatetime] — both must be filled
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
        // No input needed — the operator itself carries the full meaning
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
