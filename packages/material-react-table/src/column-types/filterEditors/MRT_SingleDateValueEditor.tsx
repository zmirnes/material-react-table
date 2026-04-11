import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { type Dayjs } from 'dayjs';
import {
  type MRT_FilterOperatorEditComponentProps,
  type MRT_RowData,
} from '../../types';
import {
  formatPickerValue,
  getDatePickerProps,
  getDateTimePickerProps,
  getPickerLocale,
  getPickerTextFieldProps,
  getPickerValue,
} from './pickerHelpers';

export type MRT_SingleDateValueEditorProps<TData extends MRT_RowData> =
  MRT_FilterOperatorEditComponentProps<TData> & {
    pickerType: 'date' | 'datetime';
  };

export const MRT_SingleDateValueEditor = <TData extends MRT_RowData>({
  pickerType,
  ...props
}: MRT_SingleDateValueEditorProps<TData>) => {
  const pickerLocale = getPickerLocale(
    props.table.options.localization.language,
  );
  const pickerTextFieldProps = getPickerTextFieldProps(props);

  const onChange = (value: Dayjs | null) => {
    props.onChange(
      formatPickerValue(value, pickerType) as Parameters<
        typeof props.onChange
      >[0],
    );
  };

  const pickerValue = getPickerValue(props.rule.value);

  return (
    <LocalizationProvider
      adapterLocale={pickerLocale}
      dateAdapter={AdapterDayjs}
    >
      {pickerType === 'date' ? (
        <DatePicker<Dayjs>
          {...getDatePickerProps(props)}
          onChange={onChange}
          value={pickerValue}
          slotProps={{
            ...getDatePickerProps(props)?.slotProps,
            field: {
              clearable: true,
              ...getDatePickerProps(props)?.slotProps?.field,
            },
            textField: {
              ...pickerTextFieldProps,
              ...getDatePickerProps(props)?.slotProps?.textField,
              size: 'small',
              variant: 'outlined',
            },
          }}
        />
      ) : (
        <DateTimePicker<Dayjs>
          {...getDateTimePickerProps(props)}
          onChange={onChange}
          value={pickerValue}
          slotProps={{
            ...getDateTimePickerProps(props)?.slotProps,
            field: {
              clearable: true,
              ...getDateTimePickerProps(props)?.slotProps?.field,
            },
            textField: {
              ...pickerTextFieldProps,
              ...getDateTimePickerProps(props)?.slotProps?.textField,
              size: 'small',
              variant: 'outlined',
            },
          }}
        />
      )}
    </LocalizationProvider>
  );
};
