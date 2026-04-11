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
  const pickerProps =
    pickerType === 'date'
      ? getDatePickerProps(props)
      : getDateTimePickerProps(props);
  const pickerTextFieldProps = getPickerTextFieldProps(props);

  const sharedPickerProps = {
    onChange: (value: Dayjs | null) => {
      props.onChange(
        formatPickerValue(value, pickerType) as Parameters<
          typeof props.onChange
        >[0],
      );
    },
    value: getPickerValue(props.rule.value),
  };

  const sharedSlotProps = {
    ...pickerProps?.slotProps,
    field: {
      clearable: true,
      ...pickerProps?.slotProps?.field,
    },
    textField: {
      ...pickerTextFieldProps,
      ...pickerProps?.slotProps?.textField,
      size: 'small' as const,
      variant: 'outlined' as const,
    },
  };

  return (
    <LocalizationProvider
      adapterLocale={pickerLocale}
      dateAdapter={AdapterDayjs}
    >
      {pickerType === 'date' ? (
        <DatePicker
          {...sharedPickerProps}
          {...pickerProps}
          slotProps={sharedSlotProps}
        />
      ) : (
        <DateTimePicker
          {...sharedPickerProps}
          {...pickerProps}
          slotProps={sharedSlotProps}
        />
      )}
    </LocalizationProvider>
  );
};
