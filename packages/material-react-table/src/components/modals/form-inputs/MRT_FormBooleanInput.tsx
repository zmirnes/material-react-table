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

// Internal Select option value strings — converted to/from actual boolean in RHF state.
const BOOLEAN_OPTION_TRUE = 'true';
const BOOLEAN_OPTION_FALSE = 'false';
// Empty string represents the unselected (null) state inside the Select.
const BOOLEAN_OPTION_EMPTY = '';

const DEFAULT_FIELD_SIZE = 'small';

export interface MRT_FormBooleanInputProps<TData extends MRT_RowData> {
  name: string;
  columnDef: MRT_ColumnDef<TData>;
  fieldConfig: MRT_FormFieldConfig<TData, boolean | null> | null;
  // Localized labels for the true/false options — sourced from table localization.
  trueLabel: string;
  falseLabel: string;
}

// Converts the stored RHF boolean value to the Select option string key.
const toSelectValue = (value: unknown): string => {
  if (value === true) return BOOLEAN_OPTION_TRUE;
  if (value === false) return BOOLEAN_OPTION_FALSE;
  return BOOLEAN_OPTION_EMPTY;
};

// Converts the Select option string key back to the boolean value stored in RHF.
// Returns null for the empty option so RHF distinguishes "not selected" from false.
const fromSelectValue = (selectValue: string): boolean | null => {
  if (selectValue === BOOLEAN_OPTION_TRUE) return true;
  if (selectValue === BOOLEAN_OPTION_FALSE) return false;
  return null;
};

// Boolean form input — a two-option Select that stores true/false/null in RHF.
// Option labels are sourced from table localization so they adapt to the active language.
export const MRT_FormBooleanInput = <TData extends MRT_RowData>({
  name,
  columnDef,
  fieldConfig,
  trueLabel,
  falseLabel,
}: MRT_FormBooleanInputProps<TData>) => {
  const { control } = useFormContext();

  // Prefer explicit label override; fall back to the column header string.
  const label =
    fieldConfig?.label ??
    (typeof columnDef.header === 'string' ? columnDef.header : name);

  return (
    <Controller
      control={control}
      name={name}
      rules={fieldConfig?.rules}
      render={({ field, fieldState }) => {
        const selectValue = toSelectValue(field.value);

        const handleChange = (rawSelectValue: string) => {
          const booleanValue = fromSelectValue(rawSelectValue);
          const transformed = fieldConfig?.onChange?.(booleanValue, name);
          // Use undefined check — null is a valid transformed value and must not be skipped.
          field.onChange(
            transformed !== undefined ? transformed : booleanValue,
          );
        };

        // Renders the human-readable label of the selected boolean option inside the collapsed trigger.
        const renderSelectedValue = (value: string) => {
          if (value === BOOLEAN_OPTION_TRUE) return trueLabel;
          if (value === BOOLEAN_OPTION_FALSE) return falseLabel;
          // Return undefined (not null) so MUI shows the placeholder when nothing is selected.
          return undefined;
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
              value={selectValue}
            >
              {/* Empty option allows the user to deselect (stores null) */}
              <MenuItem value={BOOLEAN_OPTION_EMPTY}>
                <em>&nbsp;</em>
              </MenuItem>
              <MenuItem value={BOOLEAN_OPTION_TRUE}>{trueLabel}</MenuItem>
              <MenuItem value={BOOLEAN_OPTION_FALSE}>{falseLabel}</MenuItem>
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
