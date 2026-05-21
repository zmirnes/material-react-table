import { type TextFieldProps } from '@mui/material/TextField';
import { type DatePickerProps } from '@mui/x-date-pickers/DatePicker';
import { type DateTimePickerProps } from '@mui/x-date-pickers/DateTimePicker';
import dayjs, { type Dayjs } from 'dayjs';

// Filter value shape for date range operators.
// Both endpoints are stored as Unix millisecond timestamps.
export type DateRangeFilterValue = {
  from: number | null;
  to: number | null;
};
// Locale bundles — loaded once so dayjs can apply them via adapterLocale
import 'dayjs/locale/de';
import 'dayjs/locale/fr';
import 'dayjs/locale/hr';
import 'dayjs/locale/nl';
import {
  type MRT_FilterOperatorEditComponentProps,
  type MRT_RowData,
} from '../../types';
import { parseFromValuesOrFunc } from '../../utils/utils';

// Maps a BCP-47 language prefix (e.g. "de" from "de-AT") to its dayjs locale.
// Any unsupported language falls back to English.
const SUPPORTED_LOCALES: Record<string, string> = {
  de: 'de',
  fr: 'fr',
  hr: 'hr',
  nl: 'nl',
};

// Extracts the two-letter language prefix and resolves the matching dayjs locale
export const getPickerLocale = (language: string): string => {
  // Take only the first two characters of the BCP-47 tag (e.g. "de" from "de-AT")
  const prefix = language.toLowerCase().slice(0, 2);
  return SUPPORTED_LOCALES[prefix] ?? 'en';
};

// Converts any supported value representation to a Dayjs instance.
// Handles: Dayjs, native Date, API object ({ date: string }), ISO string, timestamp.
export const getPickerValue = (value: unknown): Dayjs | null => {
  if (!value) {
    return null;
  }

  // Already a Dayjs instance — nothing to convert
  if (dayjs.isDayjs(value)) {
    return value;
  }

  // Native JS Date — wrap it with dayjs
  if (value instanceof Date) {
    const parsed = dayjs(value);
    return parsed.isValid() ? parsed : null;
  }

  // API date object shape: { date: '2024-01-01', timezone: '...', timezone_type: 3 }
  if (
    typeof value === 'object' &&
    'date' in value &&
    typeof (value as { date: unknown }).date === 'string'
  ) {
    const parsed = dayjs((value as { date: string }).date);
    return parsed.isValid() ? parsed : null;
  }

  // Fallback: try to parse as ISO string or Unix timestamp
  const parsed = dayjs(value as string | number);
  return parsed.isValid() ? parsed : null;
};

// Serialises a Dayjs value to a Unix millisecond timestamp for use in filter rules.
// Returns null when no value is selected.
export const formatPickerValue = (value: Dayjs | null): number | null => {
  if (!value) return null;
  return value.valueOf();
};

// Builds a human-readable "start – end" summary for the range trigger field.
// Used by MRT_RangeDateValueEditor to populate the read-only display TextField.
export const formatRangeDisplayValue = (
  value: unknown,
  language: string,
  pickerType: 'date' | 'datetime',
): string => {
  // Extract the from/to timestamps from the DateRangeFilterValue shape
  const rangeValue = (value as DateRangeFilterValue | null) ?? null;

  const formatSingle = (timestamp: number | null | undefined): string => {
    const parsed = getPickerValue(timestamp ?? null);
    if (!parsed) return '';
    // Use the browser's locale-aware formatter for human-readable output without any spaces
    return pickerType === 'date'
      ? parsed.toDate().toLocaleDateString(language).replace(/\s/g, '')
      : parsed
          .toDate()
          .toLocaleString(language, {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })
          .replace(/\s/g, '');
  };

  const start = formatSingle(rangeValue?.from);
  const end = formatSingle(rangeValue?.to);

  if (!start && !end) return '';
  return `${start} - ${end}`.trim();
};

// Merges table-level and column-level muiFilterTextFieldProps.
// Column overrides take precedence over table-wide defaults.
export const getSharedTextFieldProps = <TData extends MRT_RowData>({
  column,
  table,
}: MRT_FilterOperatorEditComponentProps<TData>): TextFieldProps => ({
  ...parseFromValuesOrFunc(table.options.muiFilterTextFieldProps, {
    column,
    table,
  }),
  ...parseFromValuesOrFunc(column.columnDef.muiFilterTextFieldProps, {
    column,
    table,
  }),
});

// Same as getSharedTextFieldProps but pre-fills the size/variant defaults
// required by the date picker textField slot.
export const getPickerTextFieldProps = <TData extends MRT_RowData>(
  props: MRT_FilterOperatorEditComponentProps<TData>,
): TextFieldProps => ({
  ...getSharedTextFieldProps(props),
  fullWidth: true,
  margin: 'none' as const,
  size: 'small' as const,
  variant: 'outlined' as const,
});

// Merges table-level and column-level DatePicker props.
// Cast to DatePickerProps<Dayjs> because types.ts defines muiFilterDatePickerProps
// with `never` as TDate — safe because we always work with Dayjs values.
export const getDatePickerProps = <TData extends MRT_RowData>(
  props: MRT_FilterOperatorEditComponentProps<TData>,
): DatePickerProps => ({
  ...(parseFromValuesOrFunc(props.table.options.muiFilterDatePickerProps, {
    column: props.column,
    table: props.table,
  }) as DatePickerProps),
  ...(parseFromValuesOrFunc(props.column.columnDef.muiFilterDatePickerProps, {
    column: props.column,
    table: props.table,
  }) as DatePickerProps),
});

// Same as getDatePickerProps but for DateTimePicker.
export const getDateTimePickerProps = <TData extends MRT_RowData>(
  props: MRT_FilterOperatorEditComponentProps<TData>,
): DateTimePickerProps => ({
  ...(parseFromValuesOrFunc(props.table.options.muiFilterDateTimePickerProps, {
    column: props.column,
    table: props.table,
  }) as DateTimePickerProps),
  ...(parseFromValuesOrFunc(
    props.column.columnDef.muiFilterDateTimePickerProps,
    {
      column: props.column,
      table: props.table,
    },
  ) as DateTimePickerProps),
});
