import { Controller, useFormContext } from 'react-hook-form';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {
  getPickerLocale,
  getPickerValue,
} from '../../../column-types/filterEditors/pickerHelpers';
import {
  type MRT_ColumnDef,
  type MRT_FormFieldConfig,
  type MRT_RowData,
} from '../../../types';
import { type Dayjs } from 'dayjs';

const DATETIME_SERIALISE_FORMAT = 'YYYY-MM-DDTHH:mm';
const DEFAULT_FIELD_SIZE = 'small';

export interface MRT_FormDateTimeInputProps<TData extends MRT_RowData> {
  name: string;
  columnDef: MRT_ColumnDef<TData>;
  fieldConfig: MRT_FormFieldConfig<TData, string | null> | null;
  locale: string;
}

export const MRT_FormDateTimeInput = <TData extends MRT_RowData>({
  name,
  columnDef,
  fieldConfig,
  locale,
}: MRT_FormDateTimeInputProps<TData>) => {
  const { control } = useFormContext();

  const pickerLocale = getPickerLocale(locale);

  return (
    <Controller
      control={control}
      name={name}
      rules={fieldConfig?.rules}
      render={({ field, fieldState }) => {
        const pickerValue = getPickerValue(field.value);

        const handleChange = (value: Dayjs | null) => {
          const serialised = value?.isValid()
            ? value.format(DATETIME_SERIALISE_FORMAT)
            : null;
          const transformed = fieldConfig?.onChange?.(serialised, name);
          field.onChange(transformed !== undefined ? transformed : serialised);
        };

        return (
          <LocalizationProvider
            adapterLocale={pickerLocale}
            dateAdapter={AdapterDayjs}
          >
            <DateTimePicker<Dayjs>
              ampm={false}
              disabled={fieldConfig?.disabled}
              label={fieldConfig?.label ?? columnDef.header}
              onChange={handleChange}
              value={pickerValue}
              slotProps={{
                field: {
                  clearable: true,
                },
                popper: {
                  sx: { zIndex: 1400 },
                },
                textField: {
                  error: !!fieldState.error,
                  fullWidth: true,
                  helperText:
                    fieldState.error?.message ?? fieldConfig?.helperText,
                  onBlur: field.onBlur,
                  placeholder: fieldConfig?.placeholder,
                  size: fieldConfig?.size ?? DEFAULT_FIELD_SIZE,
                  variant: 'outlined',
                },
              }}
            />
          </LocalizationProvider>
        );
      }}
    />
  );
};
