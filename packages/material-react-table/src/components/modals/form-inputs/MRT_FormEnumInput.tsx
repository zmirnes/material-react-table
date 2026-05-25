import { Controller, useFormContext } from 'react-hook-form';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import {
  type MRT_ColumnDef,
  type MRT_FormFieldConfig,
  type MRT_RowData,
} from '../../../types';

// Option shape from column.meta.enumValues — value is stored in form, label is displayed.
interface EnumOption {
  value: string;
  label: string;
}

const DEFAULT_FIELD_SIZE = 'small';

export interface MRT_FormEnumInputProps<TData extends MRT_RowData> {
  name: string;
  columnDef: MRT_ColumnDef<TData>;
  fieldConfig: MRT_FormFieldConfig<TData, string | null> | null;
}

export const MRT_FormEnumInput = <TData extends MRT_RowData>({
  name,
  columnDef,
  fieldConfig,
}: MRT_FormEnumInputProps<TData>) => {
  const { control } = useFormContext();

  // Enum options provided via column metadata — list of selectable value/label pairs.
  const enumOptions: EnumOption[] = columnDef.meta?.enumValues ?? [];

  // Prefer string headers for the Select label; fall back to field name if header is a render function.
  const label =
    fieldConfig?.label ??
    (typeof columnDef.header === 'string' ? columnDef.header : name);

  return (
    <Controller
      control={control}
      name={name}
      rules={fieldConfig?.rules}
      render={({ field, fieldState }) => {
        // The form stores the raw enum value string — consistent with the filter editor value shape.
        const currentValue = typeof field.value === 'string' ? field.value : '';

        const handleChange = (enumValue: string) => {
          const transformed = fieldConfig?.onChange?.(enumValue, name);
          // Use undefined check — null is a valid transformed value and must not be skipped.
          field.onChange(transformed !== undefined ? transformed : enumValue);
        };

        // Renders the human-readable label of the selected option inside the collapsed trigger.
        const renderSelectedValue = (value: string) => {
          const option = enumOptions.find((opt) => opt.value === value);
          // Return undefined (not null) so MUI shows the placeholder when no match is found.
          return option?.label;
        };

        return (
          <FormControl
            disabled={fieldConfig?.disabled}
            error={!!fieldState.error}
            fullWidth
            size={fieldConfig?.size ?? DEFAULT_FIELD_SIZE}
          >
            <InputLabel sx={{ '&.Mui-focused': { color: 'text.primary' } }}>
              {label}
            </InputLabel>
            <Select
              label={label}
              MenuProps={{
                anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                transformOrigin: { vertical: 'top', horizontal: 'left' },
                sx: { zIndex: 1400 },
              }}
              onBlur={field.onBlur}
              onChange={(e) => handleChange(e.target.value as string)}
              renderValue={renderSelectedValue}
              value={currentValue}
            >
              {enumOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {(fieldState.error?.message || fieldConfig?.helperText) && (
              <FormHelperText>
                {fieldState.error?.message ?? fieldConfig?.helperText}
              </FormHelperText>
            )}
          </FormControl>
        );
      }}
    />
  );
};
