import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import {
  type DropdownOption,
  type MRT_FilterOperatorEditComponentProps,
  type MRT_RowData,
} from '../../types';
import { getValueAndLabel } from '../../utils/utils';
import { getSharedTextFieldProps } from './pickerHelpers';

export type MRT_SingleValueEditorProps<TData extends MRT_RowData> =
  MRT_FilterOperatorEditComponentProps<TData> & {
    inputType?: 'date' | 'datetime-local' | 'number' | 'text';
    options?: DropdownOption[];
    transformValue?: (value: string) => unknown;
    valueFormatter?: (value: unknown) => string;
  };

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
  const textFieldProps = getSharedTextFieldProps({
    column,
    onChange,
    rule,
    table,
  });

  const displayValue = valueFormatter
    ? valueFormatter(rule.value)
    : ((rule.value as string | number | undefined) ?? '');

  return (
    <TextField
      fullWidth
      margin="none"
      onChange={(event) => {
        const rawValue = event.target.value;
        const transformed = transformValue ? transformValue(rawValue) : rawValue;
        onChange(transformed as Parameters<typeof onChange>[0]);
      }}
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
