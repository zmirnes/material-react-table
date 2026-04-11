// Public API for all filter rule editor components.
// Each export is a thin wrapper that configures the generic editors
// (MRT_SingleValueEditor, MRT_SingleDateValueEditor, MRT_RangeDateValueEditor)
// with the correct inputType, transformValue, and valueFormatter for its data type.

import {
  type DropdownOption,
  type MRT_FilterOperatorEditComponentProps,
  type MRT_RowData,
} from '../../types';
import { MRT_MultiValueEditor } from './MRT_MultiValueEditor';
import { MRT_RangeDateValueEditor } from './MRT_RangeDateValueEditor';
import { MRT_SingleDateValueEditor } from './MRT_SingleDateValueEditor';
import { MRT_SingleValueEditor } from './MRT_SingleValueEditor';

// Plain text input — no transformation needed
export const MRT_FilterRuleTextEditor = <TData extends MRT_RowData>(
  props: MRT_FilterOperatorEditComponentProps<TData>,
) => <MRT_SingleValueEditor {...props} inputType="text" />;

// Numeric input — converts string input to number; formats stored number back to string for display
export const MRT_FilterRuleNumberEditor = <TData extends MRT_RowData>(
  props: MRT_FilterOperatorEditComponentProps<TData>,
) => (
  <MRT_SingleValueEditor
    {...props}
    inputType="number"
    transformValue={(value) => (value === '' ? '' : Number(value))}
    valueFormatter={(value) =>
      value === undefined || value === null || value === '' ? '' : String(value)
    }
  />
);

// Select input with true/false options — stores actual boolean, displays localised label
export const MRT_FilterRuleBooleanEditor = <TData extends MRT_RowData>(
  props: MRT_FilterOperatorEditComponentProps<TData>,
) => (
  <MRT_SingleValueEditor
    {...props}
    options={[
      { label: props.table.options.localization.booleanTrue, value: 'true' },
      { label: props.table.options.localization.booleanFalse, value: 'false' },
    ]}
    // Convert the option string ('true'/'false') to an actual boolean for the rule value
    transformValue={(value) =>
      value === 'true' ? true : value === 'false' ? false : ''
    }
    // Convert the stored boolean back to the option string key for the select
    valueFormatter={(value) =>
      value === true ? 'true' : value === false ? 'false' : ''
    }
  />
);

// Date-only picker — stores value as YYYY-MM-DD string
export const MRT_FilterRuleDateEditor = <TData extends MRT_RowData>(
  props: MRT_FilterOperatorEditComponentProps<TData>,
) => <MRT_SingleDateValueEditor {...props} pickerType="date" />;

// Date+time picker — stores value as YYYY-MM-DDTHH:mm string
export const MRT_FilterRuleDateTimeEditor = <TData extends MRT_RowData>(
  props: MRT_FilterOperatorEditComponentProps<TData>,
) => <MRT_SingleDateValueEditor {...props} pickerType="datetime" />;

// Date range picker — stores value as [startDate, endDate] (YYYY-MM-DD)
export const MRT_FilterRuleRangeDateEditor = <TData extends MRT_RowData>(
  props: MRT_FilterOperatorEditComponentProps<TData>,
) => <MRT_RangeDateValueEditor {...props} pickerType="date" />;

// Date+time range picker — stores value as [startDatetime, endDatetime]
export const MRT_FilterRuleRangeDateTimeEditor = <TData extends MRT_RowData>(
  props: MRT_FilterOperatorEditComponentProps<TData>,
) => <MRT_RangeDateValueEditor {...props} pickerType="datetime" />;

// Select editor built from externally supplied options — used by EnumColumnResolver
export const MRT_FilterRuleSelectEditor = <TData extends MRT_RowData>(
  props: MRT_FilterOperatorEditComponentProps<TData> & {
    options: DropdownOption[];
  },
) => <MRT_SingleValueEditor {...props} options={props.options} />;

// Multi-select editor — stores value as string[], used for the 'inArray' operator
export const MRT_FilterRuleSelectMultiEditor = <TData extends MRT_RowData>(
  props: MRT_FilterOperatorEditComponentProps<TData> & {
    options: DropdownOption[];
  },
) => <MRT_MultiValueEditor {...props} options={props.options} />;
