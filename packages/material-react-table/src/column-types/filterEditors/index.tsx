// Public API for all filter rule editor components.
// Each export is a thin wrapper that configures the generic editors
// (MRT_SingleValueEditor, MRT_SingleDateValueEditor, MRT_RangeDateValueEditor)
// with the correct inputType, transformValue, and valueFormatter for its data type.

import {
  type DropdownOption,
  type MRT_FilterOperatorEditComponentProps,
  type MRT_RowData,
} from '../../types';
import { MRT_FreeMultiValueEditor } from './MRT_FreeMultiValueEditor';
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

// Date-only picker — stores value as YYYY-MM-DD string.
// Accepts disabled to render a non-interactive field (used for relative date operators).
export const MRT_FilterRuleDateEditor = <TData extends MRT_RowData>(
  props: MRT_FilterOperatorEditComponentProps<TData> & { disabled?: boolean },
) => <MRT_SingleDateValueEditor {...props} pickerType="date" />;

// Date+time picker — stores value as YYYY-MM-DDTHH:mm string.
// Accepts disabled to render a non-interactive field (used for relative date operators).
export const MRT_FilterRuleDateTimeEditor = <TData extends MRT_RowData>(
  props: MRT_FilterOperatorEditComponentProps<TData> & { disabled?: boolean },
) => <MRT_SingleDateValueEditor {...props} pickerType="datetime" />;

// Date range picker — stores value as [startDate, endDate] (YYYY-MM-DD).
// Accepts disabled to render a non-interactive field (used for relative date operators).
export const MRT_FilterRuleRangeDateEditor = <TData extends MRT_RowData>(
  props: MRT_FilterOperatorEditComponentProps<TData> & { disabled?: boolean },
) => <MRT_RangeDateValueEditor {...props} pickerType="date" />;

// Date+time range picker — stores value as [startDatetime, endDatetime].
// Accepts disabled to render a non-interactive field (used for relative date operators).
export const MRT_FilterRuleRangeDateTimeEditor = <TData extends MRT_RowData>(
  props: MRT_FilterOperatorEditComponentProps<TData> & { disabled?: boolean },
) => <MRT_RangeDateValueEditor {...props} pickerType="datetime" />;

// ─── Disabled variants for relative date operators ────────────────────────────
// These wrappers are typed with the default TValue=unknown so they can be used
// directly as editComponent references without triggering TValue variance errors.

// Non-interactive date picker — used for from-today / to-today operators
export const MRT_FilterRuleDisabledDateEditor = <TData extends MRT_RowData>(
  props: MRT_FilterOperatorEditComponentProps<TData>,
) => <MRT_SingleDateValueEditor {...props} disabled pickerType="date" />;

// Non-interactive datetime picker — used for from-today / to-today on datetime columns
export const MRT_FilterRuleDisabledDateTimeEditor = <TData extends MRT_RowData>(
  props: MRT_FilterOperatorEditComponentProps<TData>,
) => <MRT_SingleDateValueEditor {...props} disabled pickerType="datetime" />;

// Non-interactive date range picker — used for week/month/7-day range operators on date columns
export const MRT_FilterRuleDisabledRangeDateEditor = <
  TData extends MRT_RowData,
>(
  props: MRT_FilterOperatorEditComponentProps<TData>,
) => <MRT_RangeDateValueEditor {...props} disabled pickerType="date" />;

// Non-interactive datetime range picker — used for week/month/7-day range operators on datetime columns
export const MRT_FilterRuleDisabledRangeDateTimeEditor = <
  TData extends MRT_RowData,
>(
  props: MRT_FilterOperatorEditComponentProps<TData>,
) => <MRT_RangeDateValueEditor {...props} disabled pickerType="datetime" />;

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

// Free-text multi-value editor for string columns — stores typed entries as string[]
// Mirrors MUI's isAnyOf operator; used for the 'inArray' operator
export const MRT_FilterRuleMultiTextEditor = <TData extends MRT_RowData>(
  props: MRT_FilterOperatorEditComponentProps<TData>,
) => <MRT_FreeMultiValueEditor {...props} />;

// Free-text multi-value editor for number columns — parses each typed entry to a number
export const MRT_FilterRuleMultiNumberEditor = <TData extends MRT_RowData>(
  props: MRT_FilterOperatorEditComponentProps<TData>,
) => (
  <MRT_FreeMultiValueEditor
    {...props}
    // Convert each string tag to a number before storing in the filter rule value
    transformValues={(rawValues) =>
      rawValues.map(Number).filter((n) => !Number.isNaN(n))
    }
  />
);
