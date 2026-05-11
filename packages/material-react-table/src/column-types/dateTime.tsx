import { type Date } from './date';
import {
  MRT_FilterRuleDateTimeEditor,
  MRT_FilterRuleDisabledDateTimeEditor,
  MRT_FilterRuleDisabledRangeDateTimeEditor,
  MRT_FilterRuleRangeDateTimeEditor,
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
import { formatApiDateTime } from '../utils/date';

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
        getInitialValue: () => null,
        id: 'lessThan',
        // null means no datetime selected
        isValueEmpty: (value: unknown) => !value,
        label: 'Before',
        valueShape: 'single',
      },
      {
        editComponent: MRT_FilterRuleDateTimeEditor,
        getInitialValue: () => null,
        id: 'greaterThan',
        isValueEmpty: (value: unknown) => !value,
        label: 'After',
        valueShape: 'single',
      },
      {
        // Range value is stored as {from, to} Unix ms timestamps
        editComponent: MRT_FilterRuleRangeDateTimeEditor,
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
        // Relative operators: value is computed at rule-creation time and stored as a datetime string.
        // The editor is rendered disabled so the user knows the value is implicit.
        editComponent: MRT_FilterRuleDisabledDateTimeEditor,
        getInitialValue: () => computeRelativeDateSingle('from-today'),
        id: 'from-today',
        isValueEmpty: () => false,
        label: 'From Today',
        valueShape: 'computed',
      },
      {
        editComponent: MRT_FilterRuleDisabledDateTimeEditor,
        getInitialValue: () => computeRelativeDateSingle('to-today'),
        id: 'to-today',
        isValueEmpty: () => false,
        label: 'To Today',
        valueShape: 'computed',
      },
      {
        editComponent: MRT_FilterRuleDisabledRangeDateTimeEditor,
        getInitialValue: () => computeRelativeDateRange('current-week'),
        id: 'current-week',
        isValueEmpty: () => false,
        label: 'Current Week',
        valueShape: 'computed',
      },
      {
        editComponent: MRT_FilterRuleDisabledRangeDateTimeEditor,
        getInitialValue: () => computeRelativeDateRange('current-month'),
        id: 'current-month',
        isValueEmpty: () => false,
        label: 'Current Month',
        valueShape: 'computed',
      },
      {
        editComponent: MRT_FilterRuleDisabledRangeDateTimeEditor,
        getInitialValue: () => computeRelativeDateRange('last-7-days'),
        id: 'last-7-days',
        isValueEmpty: () => false,
        label: 'Last 7 Days',
        valueShape: 'computed',
      },
      {
        editComponent: MRT_FilterRuleDisabledRangeDateTimeEditor,
        getInitialValue: () => computeRelativeDateRange('last-week'),
        id: 'last-week',
        isValueEmpty: () => false,
        label: 'Last Week',
        valueShape: 'computed',
      },
      {
        editComponent: MRT_FilterRuleDisabledRangeDateTimeEditor,
        getInitialValue: () => computeRelativeDateRange('last-month'),
        id: 'last-month',
        isValueEmpty: () => false,
        label: 'Last Month',
        valueShape: 'computed',
      },
    ] as MRT_FilterOperatorDefinition<TData, TValue>[],
};
