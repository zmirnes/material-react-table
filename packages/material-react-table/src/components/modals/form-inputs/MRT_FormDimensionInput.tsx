import { Controller, useFormContext } from 'react-hook-form';
import FormHelperText from '@mui/material/FormHelperText';
import Stack from '@mui/material/Stack';
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
}

// Computes MUI outline border styles for a "grouped" (connected) input sequence.
// Removes shared inner borders and rounds only the outer-most corners.
const getGroupedInputBorderStyle = (index: number, total: number) => {
  // Single input — no adjustments needed
  if (total === 1) return {};

  if (index === 0) {
    // First input: remove right-side rounding so it connects flush to the next input
    return { borderTopRightRadius: 0, borderBottomRightRadius: 0 };
  }

  if (index === total - 1) {
    // Last input: remove left-side rounding and shared border to avoid double border
    return {
      borderBottomLeftRadius: 0,
      borderLeft: 'none',
      borderTopLeftRadius: 0,
    };
  }

  // Middle inputs: fully square corners, no left border
  return { borderLeft: 'none', borderRadius: 0 };
};

// Dimension form input — renders a row of grouped number inputs, one per dimension field.
// The whole object is stored under a single RHF field name as Record<string, number | null>.
export const MRT_FormDimensionInput = <TData extends MRT_RowData>({
  name,
  columnDef,
  fieldConfig,
  fieldLabels,
}: MRT_FormDimensionInputProps<TData>) => {
  const { control } = useFormContext();

  // Dimension field names come from column metadata (e.g. ['width', 'height', 'depth'])
  const dimensionFields = columnDef.meta?.dimensions?.fields ?? [];

  // Without fields config the input cannot render anything meaningful
  if (!dimensionFields.length) return null;

  const toleranceDef = columnDef.meta?.dimensions?.tolerance;

  // All fields rendered by this component: dimension fields + optional tolerance field
  const allFieldKeys: string[] = toleranceDef
    ? [...dimensionFields, 'tolerance']
    : dimensionFields;

  return (
    <Controller
      control={control}
      name={name}
      rules={fieldConfig?.rules}
      render={({ field, fieldState }) => {
        // Current stored object — defaults to empty object when not yet initialised
        const currentValue: DimensionFormValue =
          field.value && typeof field.value === 'object' ? field.value : {};

        // Updates a single dimension key inside the stored object
        const handleFieldChange = (fieldKey: string, rawInput: string) => {
          // Enforce tolerance upper bound — discard input that exceeds the configured max
          if (
            fieldKey === 'tolerance' &&
            toleranceDef &&
            Number(rawInput) > toleranceDef.max
          ) {
            return;
          }

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
          <Stack gap={0.5}>
            <Stack direction="row" onBlur={field.onBlur}>
              {allFieldKeys.map((fieldKey, index) => (
                <TextField
                  key={fieldKey}
                  disabled={fieldConfig?.disabled}
                  error={!!fieldState.error}
                  fullWidth
                  // Use localized label when available — fall back to the raw field key
                  label={fieldLabels?.[fieldKey] ?? fieldKey}
                  onChange={(e) => handleFieldChange(fieldKey, e.target.value)}
                  size={fieldConfig?.size ?? DEFAULT_FIELD_SIZE}
                  // Apply tolerance numeric limits when rendering the tolerance field
                  slotProps={
                    fieldKey === 'tolerance' && toleranceDef
                      ? {
                          htmlInput: {
                            max: toleranceDef.max,
                            min: toleranceDef.min,
                          },
                        }
                      : undefined
                  }
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline':
                      getGroupedInputBorderStyle(index, allFieldKeys.length),
                    '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(145, 158, 171, 0.8)',
                      borderWidth: '1px',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(145, 158, 171, 0.8)',
                      borderWidth: '1px',
                    },
                  }}
                  type="number"
                  value={currentValue[fieldKey] ?? ''}
                />
              ))}
            </Stack>

            {/* Render helper text or validation error below the grouped input row */}
            {(fieldState.error?.message || fieldConfig?.helperText) && (
              <FormHelperText error={!!fieldState.error}>
                {fieldState.error?.message ?? fieldConfig?.helperText}
              </FormHelperText>
            )}
          </Stack>
        );
      }}
    />
  );
};
