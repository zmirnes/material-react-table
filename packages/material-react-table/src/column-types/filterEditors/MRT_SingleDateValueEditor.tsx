import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {
  getDatePickerProps,
  getDateTimePickerProps,
  getPickerLocale,
  getPickerValue,
} from './pickerHelpers';
import {
  type MRT_FilterOperatorEditComponentProps,
  type MRT_RowData,
} from '../../types';
import { parseFromValuesOrFunc } from '../../utils/utils';
import { type Dayjs } from 'dayjs';

export type MRT_SingleDateValueEditorProps<TData extends MRT_RowData> =
  MRT_FilterOperatorEditComponentProps<TData> & {
    // When true, the picker is non-interactive (used for relative date operators)
    disabled?: boolean;
    // 'date' renders a DatePicker; 'datetime' renders a DateTimePicker
    pickerType: 'date' | 'datetime';
  };

// Single-value date/datetime filter editor.
// Renders either a DatePicker or DateTimePicker based on pickerType.
export const MRT_SingleDateValueEditor = <TData extends MRT_RowData>({
  disabled,
  pickerType,
  ...props
}: MRT_SingleDateValueEditorProps<TData>) => {
  // Resolve dayjs locale from the table's active language setting
  const pickerLocale = getPickerLocale(
    props.table.options.localization.language,
  );

  // Serialise the selected Dayjs value to a Unix ms timestamp for the filter rule
  const handleChange = (value: Dayjs | null) => {
    props.onChange(value ? value.valueOf() : null);
  };

  // Convert the stored string/API value to a Dayjs instance for the picker
  const pickerValue = getPickerValue(props.rule.value);

  const pickerTextFieldProps = parseFromValuesOrFunc(
    props.column.columnDef.muiFilterTextFieldProps,
    props,
  );

  return (
    <LocalizationProvider
      adapterLocale={pickerLocale}
      dateAdapter={AdapterDayjs}
    >
      {pickerType === 'date' ? (
        <DatePicker
          disabled={disabled}
          {...getDatePickerProps(props)}
          onChange={handleChange}
          value={pickerValue}
          slotProps={{
            ...getDatePickerProps(props)?.slotProps,
            field: {
              // Allow the user to clear the selected date via the built-in X button
              clearable: true,
              ...getDatePickerProps(props)?.slotProps?.field,
            },
            textField: {
              ...pickerTextFieldProps,
              size: 'small',
              variant: 'outlined',
              fullWidth: true,
            },
          }}
        />
      ) : (
        <DateTimePicker
          disabled={disabled}
          {...getDateTimePickerProps(props)}
          onChange={handleChange}
          value={pickerValue}
          slotProps={{
            ...getDateTimePickerProps(props)?.slotProps,
            field: {
              clearable: true,
              ...getDateTimePickerProps(props)?.slotProps?.field,
            },
            textField: {
              ...pickerTextFieldProps,
              size: 'small',
              variant: 'outlined',
              fullWidth: true,
            },
          }}
        />
      )}
    </LocalizationProvider>
  );
};
