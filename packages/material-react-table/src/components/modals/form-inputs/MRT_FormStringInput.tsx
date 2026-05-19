import { Controller, useFormContext } from 'react-hook-form';
import TextField from '@mui/material/TextField';
import {
  type MRT_ColumnDef,
  type MRT_FormFieldConfig,
  type MRT_RowData,
} from '../../../types';
const DEFAULT_FIELD_SIZE = 'small';

export interface MRT_FormStringInputProps<TData extends MRT_RowData> {
  name: string;
  columnDef: MRT_ColumnDef<TData>;
  fieldConfig: MRT_FormFieldConfig<TData, string> | null;
}

export const MRT_FormStringInput = <TData extends MRT_RowData>({
  name,
  columnDef,
  fieldConfig,
}: MRT_FormStringInputProps<TData>) => {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      rules={fieldConfig?.rules}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          error={!!fieldState.error}
          fullWidth
          disabled={fieldConfig?.disabled}
          helperText={fieldState.error?.message ?? fieldConfig?.helperText}
          label={fieldConfig?.label ?? columnDef.header}
          placeholder={fieldConfig?.placeholder}
          size={fieldConfig?.size ?? DEFAULT_FIELD_SIZE}
          slotProps={{
            inputLabel: {
              shrink:
                field.value !== undefined &&
                field.value !== null &&
                field.value !== ''
                  ? true
                  : undefined,
            },
          }}
          onChange={(e) => {
            const transformed = fieldConfig?.onChange?.(e.target.value, name);
            field.onChange(transformed ?? e.target.value);
          }}
        />
      )}
    />
  );
};
