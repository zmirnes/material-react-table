import { Controller, useFormContext } from 'react-hook-form';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
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

// Format used when serialising the selected date back to form state.
const DATE_SERIALISE_FORMAT = 'YYYY-MM-DD';
const DEFAULT_FIELD_SIZE = 'small';

export interface MRT_FormDateInputProps<TData extends MRT_RowData> {
  name: string;
  columnDef: MRT_ColumnDef<TData>;
  fieldConfig: MRT_FormFieldConfig<TData, string | null> | null;
  // BCP-47 language tag from the table's localization — used to set the picker locale.
  locale: string;
}

export const MRT_FormDateInput = <TData extends MRT_RowData>({
  name,
  columnDef,
  fieldConfig,
  locale,
}: MRT_FormDateInputProps<TData>) => {
  const { control } = useFormContext();

  // Resolve dayjs locale from the table's active language setting
  const pickerLocale = getPickerLocale(locale);

  return (
    <Controller
      control={control}
      name={name}
      rules={fieldConfig?.rules}
      render={({ field, fieldState }) => {
        // Convert the stored string/API value to a Dayjs instance for the picker
        const pickerValue = getPickerValue(field.value);

        const handleChange = (value: Dayjs | null) => {
          // Serialise the selected date to YYYY-MM-DD; null when the field is cleared
          const serialised = value?.isValid()
            ? value.format(DATE_SERIALISE_FORMAT)
            : null;
          const transformed = fieldConfig?.onChange?.(serialised, name);
          // Use undefined check — null is a valid transformed value and must not be skipped
          field.onChange(transformed !== undefined ? transformed : serialised);
        };

        return (
          <LocalizationProvider
            adapterLocale={pickerLocale}
            dateAdapter={AdapterDayjs}
          >
            <DatePicker<Dayjs>
              disabled={fieldConfig?.disabled}
              label={fieldConfig?.label ?? columnDef.header}
              onChange={handleChange}
              value={pickerValue}
              slotProps={{
                field: {
                  clearable: true,
                },
                // MUI Modal has z-index 1300 — popper must render above it
                popper: {
                  sx: { zIndex: 1400 },
                },
                textField: {
                  error: !!fieldState.error,
                  fullWidth: true,
                  helperText:
                    fieldState.error?.message ?? fieldConfig?.helperText,
                  // onBlur must be forwarded so RHF registers the touch and triggers validation
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
