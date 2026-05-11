import {
  MRT_FilterRuleDateEditor,
  MRT_FilterRuleDisabledDateEditor,
  MRT_FilterRuleDisabledRangeDateEditor,
  MRT_FilterRuleRangeDateEditor,
} from './filterEditors';
import {
  computeRelativeDateRange,
  computeRelativeDateSingle,
} from './filterEditors/relativeDateRanges';
import {
  type MRT_FilterOperatorDefinition,
  type ColumnTypeResolver,
  type MRT_RowData,
} from '../types';
import { formatApiDate } from '../utils/date';

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
        getInitialValue: () => null,
        id: 'lessThan',
        // null means no date selected
        isValueEmpty: (value: unknown) => !value,
        label: 'Before',
        valueShape: 'single',
      },
      {
        editComponent: MRT_FilterRuleDateEditor,
        getInitialValue: () => null,
        id: 'greaterThan',
        isValueEmpty: (value: unknown) => !value,
        label: 'After',
        valueShape: 'single',
      },
      {
        // Range value is stored as {from, to} Unix ms timestamps
        editComponent: MRT_FilterRuleRangeDateEditor,
        getInitialValue: () => ({ from: null, to: null }),
        id: 'between',
        isValueEmpty: (value: unknown) => {
          const v = value as {
            from?: number | null;
            to?: number | null;
          } | null;
          return !v || !v.from || !v.to;
        },
        label: 'Range',
        valueShape: 'range',
      },
      {
        // Relative operators: value is computed at rule-creation time and stored as an ISO string.
        // The editor is rendered disabled so the user knows the value is implicit.
        editComponent: MRT_FilterRuleDisabledDateEditor,
        getInitialValue: () => computeRelativeDateSingle('from-today'),
        id: 'from-today',
        isValueEmpty: () => false,
        label: 'From Today',
        valueShape: 'computed',
      },
      {
        editComponent: MRT_FilterRuleDisabledDateEditor,
        getInitialValue: () => computeRelativeDateSingle('to-today'),
        id: 'to-today',
        isValueEmpty: () => false,
        label: 'To Today',
        valueShape: 'computed',
      },
      {
        editComponent: MRT_FilterRuleDisabledRangeDateEditor,
        getInitialValue: () => computeRelativeDateRange('current-week'),
        id: 'current-week',
        isValueEmpty: () => false,
        label: 'Current Week',
        valueShape: 'computed',
      },
      {
        editComponent: MRT_FilterRuleDisabledRangeDateEditor,
        getInitialValue: () => computeRelativeDateRange('current-month'),
        id: 'current-month',
        isValueEmpty: () => false,
        label: 'Current Month',
        valueShape: 'computed',
      },
      {
        editComponent: MRT_FilterRuleDisabledRangeDateEditor,
        getInitialValue: () => computeRelativeDateRange('last-7-days'),
        id: 'last-7-days',
        isValueEmpty: () => false,
        label: 'Last 7 Days',
        valueShape: 'computed',
      },
      {
        editComponent: MRT_FilterRuleDisabledRangeDateEditor,
        getInitialValue: () => computeRelativeDateRange('last-week'),
        id: 'last-week',
        isValueEmpty: () => false,
        label: 'Last Week',
        valueShape: 'computed',
      },
      {
        editComponent: MRT_FilterRuleDisabledRangeDateEditor,
        getInitialValue: () => computeRelativeDateRange('last-month'),
        id: 'last-month',
        isValueEmpty: () => false,
        label: 'Last Month',
        valueShape: 'computed',
      },
    ] as MRT_FilterOperatorDefinition<TData, TValue>[],
};
