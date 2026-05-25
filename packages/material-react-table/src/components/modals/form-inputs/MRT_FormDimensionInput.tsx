import { Controller, useFormContext } from 'react-hook-form';
import Box from '@mui/material/Box';
import FormHelperText from '@mui/material/FormHelperText';
import TextField from '@mui/material/TextField';
import {
  type MRT_ColumnDef,
  type MRT_FormFieldConfig,
  type MRT_RowData,
} from '../../../types';

// Form value shape for a dimension field — each dimension key maps to a number or null (null = empty).
export type DimensionFormValue = Record<string, number | null>;

const DEFAULT_FIELD_SIZE = 'small';

export interface MRT_FormDimensionInputProps<TData extends MRT_RowData> {
  name: string;
  columnDef: MRT_ColumnDef<TData>;
  fieldConfig: MRT_FormFieldConfig<TData, DimensionFormValue> | null;
  // Localized labels for dimension field keys — falls back to the raw field key when a key is not present.
  fieldLabels?: Record<string, string>;
  // Number of columns in the internal sub-field grid.
  // When set, sub-fields are arranged in a CSS Grid instead of a vertical Stack.
  columns?: number;
}

// Dimension form input — renders each dimension field as a separate, independent-looking TextField.
// All values are stored together under a single RHF field name as Record<string, number | null>.
export const MRT_FormDimensionInput = <TData extends MRT_RowData>({
  name,
  columnDef,
  fieldConfig,
  fieldLabels,
  columns,
}: MRT_FormDimensionInputProps<TData>) => {
  const { control } = useFormContext();

  // Dimension field names come from column metadata (e.g. ['width', 'height', 'depth'])
  const dimensionFields: string[] = columnDef.meta?.dimensions?.fields ?? [];

  // Without fields config the input cannot render anything meaningful
  if (!dimensionFields.length) return null;

  return (
    <Controller
      control={control}
      name={name}
      rules={fieldConfig?.rules}
      render={({ field, fieldState }) => {
        // Current stored object — defaults to empty object when not yet initialised
        const currentValue: DimensionFormValue =
          field.value && typeof field.value === 'object' ? field.value : {};

        // Updates a single dimension key inside the stored object and notifies RHF
        const handleFieldChange = (fieldKey: string, rawInput: string) => {
          const parsed = rawInput === '' ? null : Number(rawInput);

          const updatedValue: DimensionFormValue = {
            ...currentValue,
            [fieldKey]: parsed,
          };

          const transformed = fieldConfig?.onChange?.(updatedValue, name);
          field.onChange(
            transformed !== undefined ? transformed : updatedValue,
          );
        };

        return (
          <Box onBlur={field.onBlur}>
            <Box
              sx={{
                display: 'grid',
                gap: 2,
                gridTemplateColumns: `repeat(${columns ?? 1}, 1fr)`,
              }}
            >
              {dimensionFields.map((fieldKey) => (
                <TextField
                  key={fieldKey}
                  disabled={fieldConfig?.disabled}
                  error={!!fieldState.error}
                  fullWidth
                  label={fieldLabels?.[fieldKey] ?? fieldKey}
                  onChange={(e) => handleFieldChange(fieldKey, e.target.value)}
                  size={fieldConfig?.size ?? DEFAULT_FIELD_SIZE}
                  type="number"
                  value={currentValue[fieldKey] ?? ''}
                />
              ))}
            </Box>

            {/* Render helper text or validation error below the last input */}
            {(fieldState.error?.message || fieldConfig?.helperText) && (
              <FormHelperText error={!!fieldState.error}>
                {fieldState.error?.message ?? fieldConfig?.helperText}
              </FormHelperText>
            )}
          </Box>
        );
      }}
    />
  );
};
