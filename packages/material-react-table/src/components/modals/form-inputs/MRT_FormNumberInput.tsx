import { Controller, useFormContext } from 'react-hook-form';
import TextField from '@mui/material/TextField';
import {
  type MRT_ColumnDef,
  type MRT_FormFieldConfig,
  type MRT_RowData,
} from '../../../types';

const DEFAULT_FIELD_SIZE = 'small';

export interface MRT_FormNumberInputProps<TData extends MRT_RowData> {
  name: string;
  columnDef: MRT_ColumnDef<TData>;
  fieldConfig: MRT_FormFieldConfig<TData, number | null> | null;
}

export const MRT_FormNumberInput = <TData extends MRT_RowData>({
  name,
  columnDef,
  fieldConfig,
}: MRT_FormNumberInputProps<TData>) => {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      rules={fieldConfig?.rules}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          // Fallback to empty string to keep the input controlled when value is null
          value={field.value ?? ''}
          error={!!fieldState.error}
          fullWidth
          disabled={fieldConfig?.disabled}
          helperText={fieldState.error?.message ?? fieldConfig?.helperText}
          label={fieldConfig?.label ?? columnDef.header}
          placeholder={fieldConfig?.placeholder}
          size={fieldConfig?.size ?? DEFAULT_FIELD_SIZE}
          type="number"
          slotProps={{
            inputLabel: {
              shrink:
                field.value !== undefined && field.value !== null
                  ? true
                  : undefined,
            },
          }}
          onChange={(e) => {
            const rawValue = (e.target as HTMLInputElement).valueAsNumber;
            // NaN means the field is empty — store null instead
            const value = Number.isNaN(rawValue) ? null : rawValue;
            const transformed = fieldConfig?.onChange?.(value, name);
            field.onChange(transformed !== undefined ? transformed : value);
          }}
        />
      )}
    />
  );
};
