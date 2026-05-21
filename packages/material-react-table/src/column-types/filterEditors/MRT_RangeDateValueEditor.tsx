import { type PickerValidDate } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { type DateRangeFilterValue, getPickerLocale } from './pickerHelpers';
import {
  type MRT_FilterOperatorEditComponentProps,
  type MRT_RowData,
} from '../../types';
import {
  DateRangePicker,
  DateTimeRangePicker,
  type DateRangeValue,
} from '@dooherceg/mui-date-range-picker';
import dayjs from 'dayjs';

export type MRT_RangeDateValueEditorProps<TData extends MRT_RowData> =
  MRT_FilterOperatorEditComponentProps<TData> & {
    // When true, the picker is non-interactive (used for relative date operators)
    disabled?: boolean;
    pickerType: 'date' | 'datetime';
  };

// Converts a Unix millisecond timestamp to a PickerValidDate (Dayjs), or null.
const timestampToPickerDate = (
  timestamp: number | null,
): PickerValidDate | null => {
  if (timestamp === null) return null;
  const parsed = dayjs(timestamp);
  return parsed.isValid() ? parsed : null;
};

// Converts the internal {from, to} shape to the library's {start, end} shape.
const toLibraryValue = (value: DateRangeFilterValue): DateRangeValue => ({
  start: timestampToPickerDate(value.from),
  end: timestampToPickerDate(value.to),
});

// Converts the library's {start, end} shape back to the internal {from, to} shape.
const fromLibraryValue = (value: DateRangeValue): DateRangeFilterValue => ({
  from: value.start ? dayjs(value.start).valueOf() : null,
  to: value.end ? dayjs(value.end).valueOf() : null,
});

export const MRT_RangeDateValueEditor = <TData extends MRT_RowData>({
  disabled,
  pickerType,
  ...props
}: MRT_RangeDateValueEditorProps<TData>) => {
  const { onChange, rule, table } = props;
  const {
    options: { localization },
  } = table;

  const pickerLocale = getPickerLocale(localization.language);

  // Normalise stored value to the DateRangeFilterValue {from, to} shape
  const currentRangeValue: DateRangeFilterValue =
    rule.value !== null &&
    typeof rule.value === 'object' &&
    !Array.isArray(rule.value) &&
    'from' in (rule.value as object)
      ? (rule.value as DateRangeFilterValue)
      : { from: null, to: null };

  const libraryValue = toLibraryValue(currentRangeValue);

  const handleChange = (value: DateRangeValue) => {
    onChange(fromLibraryValue(value));
  };

  // Pass MRT localization strings for the from/to labels;
  // prev/next/selecting fall back to the library's English defaults.
  const dateTimeTranslations = {
    from: localization.filterFrom,
    to: localization.filterTo,
  };

  return (
    <LocalizationProvider
      adapterLocale={pickerLocale}
      dateAdapter={AdapterDayjs}
    >
      {pickerType === 'date' ? (
        <DateRangePicker
          disabled={disabled}
          onChange={handleChange}
          size="small"
          value={libraryValue}
          variant="outlined"
          sx={{
            width: '100%',
          }}
        />
      ) : (
        <DateTimeRangePicker
          disabled={disabled}
          onChange={handleChange}
          size="small"
          translations={dateTimeTranslations}
          value={libraryValue}
          variant="outlined"
        />
      )}
    </LocalizationProvider>
  );
};
