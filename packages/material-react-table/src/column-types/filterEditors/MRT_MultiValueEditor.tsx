import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import {
  type DropdownOption,
  type MRT_FilterOperatorEditComponentProps,
  type MRT_RowData,
} from '../../types';
import { getValueAndLabel } from '../../utils/utils';

// Props extend the base filter editor props with the list of selectable options
export type MRT_MultiValueEditorProps<TData extends MRT_RowData> =
  MRT_FilterOperatorEditComponentProps<TData> & {
    // Options to display in the multi-select dropdown
    options: DropdownOption[];
  };

// Multi-select filter editor stores the selected values as string[].
// Used for operators like 'inArray' where the user can pick multiple enum values.
export const MRT_MultiValueEditor = <TData extends MRT_RowData>({
  column,
  onChange,
  options,
  rule,
  table,
}: MRT_MultiValueEditorProps<TData>) => {
  // Merge table-level and column-level TextField overrides
  const textFieldProps = {
    ...table.options.muiFilterTextFieldProps,
    ...column.columnDef.muiFilterTextFieldProps,
  };

  // Normalise stored value to a string array for the controlled input
  const selectedValues = Array.isArray(rule.value) ? rule.value : [];

  return (
    <TextField
      fullWidth
      margin="none"
      onChange={(event) => {
        const rawValue = event.target.value;
        // MUI returns string when only one chip is selected via keyboard - normalise to array
        const nextValues =
          typeof rawValue === 'string' ? rawValue.split(',') : rawValue;
        onChange(nextValues as Parameters<typeof onChange>[0]);
      }}
      select
      // Enable multi-select mode on the underlying MUI Select component
      slotProps={{ select: { multiple: true } }}
      value={selectedValues}
      {...textFieldProps}
      size="small"
      variant="outlined"
    >
      {options.map((option) => {
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
