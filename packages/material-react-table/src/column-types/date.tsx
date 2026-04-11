import {
  MRT_FilterOperatorDefinition,
  type ColumnTypeResolver,
  type MRT_RowData,
} from '../types';
import { formatApiDate } from '../utils/date';
import {
  MRT_FilterRuleDateEditor,
  MRT_FilterRuleRangeDateEditor,
} from './filterEditors';

// Shape returned by the API for date fields
export interface Date {
  date: string;
  timezone: string;
  timezone_type: number;
}

// Resolver for date-only column type.
// Supports point-in-time operators and date range operators.
export const DateColumnResolver: ColumnTypeResolver = {
  createColumnDef: (column) => {
    return {
      ...column,
      Cell: ({ cell }) => {
        const value = cell.getValue<Date | null>();
        if (!value) return null;

        // Based on the date and timezone return date-fns formatted string in format 'DD.MM.YYYY';
        return formatApiDate(value);
      },
    };
  },
  getFilterOperators: <TData extends MRT_RowData, TValue = unknown>() =>
    [
      {
        editComponent: MRT_FilterRuleDateEditor,
        getInitialValue: () => '',
        id: 'equals',
        // Any falsy value (empty string, null, undefined) means no date selected
        isValueEmpty: (value: unknown) => !value,
        label: 'Equals',
      },
      {
        editComponent: MRT_FilterRuleDateEditor,
        getInitialValue: () => '',
        id: 'greaterThan',
        isValueEmpty: (value: unknown) => !value,
        label: 'After',
      },
      {
        editComponent: MRT_FilterRuleDateEditor,
        getInitialValue: () => '',
        id: 'greaterThanOrEqualTo',
        isValueEmpty: (value: unknown) => !value,
        label: 'On Or After',
      },
      {
        editComponent: MRT_FilterRuleDateEditor,
        getInitialValue: () => '',
        id: 'lessThan',
        isValueEmpty: (value: unknown) => !value,
        label: 'Before',
      },
      {
        editComponent: MRT_FilterRuleDateEditor,
        getInitialValue: () => '',
        id: 'lessThanOrEqualTo',
        isValueEmpty: (value: unknown) => !value,
        label: 'On Or Before',
      },
      {
        // Range value is stored as [startDate, endDate] — both must be filled
        editComponent: MRT_FilterRuleRangeDateEditor,
        getInitialValue: () => ['', ''],
        id: 'between',
        isValueEmpty: (value: unknown) =>
          !Array.isArray(value) || value.some((item) => !item),
        label: 'Between',
      },
      {
        editComponent: MRT_FilterRuleRangeDateEditor,
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
