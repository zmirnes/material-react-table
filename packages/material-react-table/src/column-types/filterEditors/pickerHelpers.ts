import dayjs, { type Dayjs } from 'dayjs';
import 'dayjs/locale/de';
import 'dayjs/locale/fr';
import 'dayjs/locale/hr';
import 'dayjs/locale/nl';
import {
  type MRT_FilterOperatorEditComponentProps,
  type MRT_RowData,
} from '../../types';
import { parseFromValuesOrFunc } from '../../utils/utils';

const SUPPORTED_LOCALES: Record<string, string> = {
  de: 'de',
  fr: 'fr',
  hr: 'hr',
  nl: 'nl',
};

export const getPickerLocale = (language: string): string => {
  const prefix = language.toLowerCase().slice(0, 2);
  return SUPPORTED_LOCALES[prefix] ?? 'en';
};

export const getPickerValue = (value: unknown): Dayjs | null => {
  if (!value) {
    return null;
  }

  if (dayjs.isDayjs(value)) {
    return value;
  }

  if (value instanceof Date) {
    const parsed = dayjs(value);
    return parsed.isValid() ? parsed : null;
  }

  if (
    typeof value === 'object' &&
    'date' in value &&
    typeof (value as { date: unknown }).date === 'string'
  ) {
    const parsed = dayjs((value as { date: string }).date);
    return parsed.isValid() ? parsed : null;
  }

  const parsed = dayjs(value as string | number);
  return parsed.isValid() ? parsed : null;
};

export const formatPickerValue = (
  value: Dayjs | null,
  pickerType: 'date' | 'datetime',
): string => {
  if (!value) return '';
  return value.format(
    pickerType === 'date' ? 'YYYY-MM-DD' : 'YYYY-MM-DDTHH:mm',
  );
};

export const formatRangeDisplayValue = (
  value: unknown,
  language: string,
  pickerType: 'date' | 'datetime',
): string => {
  const currentValue = Array.isArray(value) ? value : ['', ''];

  const formatSingle = (item: unknown): string => {
    const parsed = getPickerValue(item);
    if (!parsed) return '';
    return pickerType === 'date'
      ? parsed.toDate().toLocaleDateString(language)
      : parsed.toDate().toLocaleString(language);
  };

  const start = formatSingle(currentValue[0]);
  const end = formatSingle(currentValue[1]);

  if (!start && !end) return '';
  return `${start} - ${end}`.trim();
};

export const getSharedTextFieldProps = <TData extends MRT_RowData>({
  column,
  table,
}: MRT_FilterOperatorEditComponentProps<TData>) => ({
  ...parseFromValuesOrFunc(table.options.muiFilterTextFieldProps, {
    column,
    table,
  }),
  ...parseFromValuesOrFunc(column.columnDef.muiFilterTextFieldProps, {
    column,
    table,
  }),
});

export const getPickerTextFieldProps = <TData extends MRT_RowData>(
  props: MRT_FilterOperatorEditComponentProps<TData>,
) => ({
  ...getSharedTextFieldProps(props),
  fullWidth: true,
  margin: 'none' as const,
  size: 'small' as const,
  variant: 'outlined' as const,
});

export const getDatePickerProps = <TData extends MRT_RowData>(
  props: MRT_FilterOperatorEditComponentProps<TData>,
) => ({
  ...parseFromValuesOrFunc(props.table.options.muiFilterDatePickerProps, {
    column: props.column,
    table: props.table,
  }),
  ...parseFromValuesOrFunc(props.column.columnDef.muiFilterDatePickerProps, {
    column: props.column,
    table: props.table,
  }),
});

export const getDateTimePickerProps = <TData extends MRT_RowData>(
  props: MRT_FilterOperatorEditComponentProps<TData>,
) => ({
  ...parseFromValuesOrFunc(props.table.options.muiFilterDateTimePickerProps, {
    column: props.column,
    table: props.table,
  }),
  ...parseFromValuesOrFunc(
    props.column.columnDef.muiFilterDateTimePickerProps,
    {
      column: props.column,
      table: props.table,
    },
  ),
});
