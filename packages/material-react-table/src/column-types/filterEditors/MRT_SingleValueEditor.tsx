import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import {
  type DropdownOption,
  type MRT_FilterOperatorEditComponentProps,
  type MRT_RowData,
} from '../../types';
import { getValueAndLabel } from '../../utils/utils';
import { getSharedTextFieldProps } from './pickerHelpers';

// Props extend the base filter editor props with optional display customisation
export type MRT_SingleValueEditorProps<TData extends MRT_RowData> =
  MRT_FilterOperatorEditComponentProps<TData> & {
    // HTML input type — controls the keyboard hint on mobile and browser validation
    inputType?: 'date' | 'datetime-local' | 'number' | 'text';
    // When provided, renders a <select> instead of a free-text input
    options?: DropdownOption[];
    // Converts the raw string from the input to the domain value (e.g. string → number)
    transformValue?: (value: string) => unknown;
    // Converts the stored domain value back to a display string for the input
    valueFormatter?: (value: unknown) => string;
  };

// Generic single-value filter editor.
// Renders either a free-text / number input or a select, depending on `options`.
export const MRT_SingleValueEditor = <TData extends MRT_RowData>({
  column,
  inputType = 'text',
  onChange,
  options,
  rule,
  table,
  transformValue,
  valueFormatter,
}: MRT_SingleValueEditorProps<TData>) => {
  // Merge table-level and column-level TextField overrides
  const textFieldProps = getSharedTextFieldProps({
    column,
    onChange,
    rule,
    table,
  });

  // Convert stored value to a string suitable for controlled input
  const displayValue = valueFormatter
    ? valueFormatter(rule.value)
    : (rule.value ?? '');

  return (
    <TextField
      fullWidth
      margin="none"
      onChange={(event) => {
        const rawValue = event.target.value;
        // Apply optional domain transformation (e.g. cast to number)
        const transformedValue = transformValue
          ? transformValue(rawValue)
          : rawValue;
        onChange(transformedValue as Parameters<typeof onChange>[0]);
      }}
      // Render as <select> only when options are provided
      select={!!options?.length}
      type={options?.length ? undefined : inputType}
      value={displayValue}
      {...textFieldProps}
      size="small"
      variant="outlined"
    >
      {options?.map((option) => {
        const { label, value } = getValueAndLabel(option);
        return (
          <MenuItem key={value} value={value}>
            {label}
          </MenuItem>
        );
      })}
    </TextField>
  );
};
