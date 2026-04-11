import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import {
  type MRT_FilterOperatorEditComponentProps,
  type MRT_RowData,
} from '../../types';
import { getSharedTextFieldProps } from './pickerHelpers';

export type MRT_RangeValueEditorProps<TData extends MRT_RowData> =
  MRT_FilterOperatorEditComponentProps<TData> & {
    inputType?: 'date' | 'datetime-local' | 'number' | 'text';
    transformValue?: (value: string) => unknown;
    valueFormatter?: (value: unknown) => string;
  };

export const MRT_RangeValueEditor = <TData extends MRT_RowData>({
  column,
  inputType = 'text',
  onChange,
  rule,
  table,
  transformValue,
  valueFormatter,
}: MRT_RangeValueEditorProps<TData>) => {
  const textFieldProps = getSharedTextFieldProps({
    column,
    onChange,
    rule,
    table,
  });
  const currentValue = Array.isArray(rule.value) ? rule.value : ['', ''];

  const handleRangeChange = (index: 0 | 1, rawValue: string) => {
    const nextValue = [...currentValue] as [unknown, unknown];
    nextValue[index] = transformValue?.(rawValue) ?? rawValue;
    onChange(nextValue as Parameters<typeof onChange>[0]);
  };

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 1,
        gridTemplateColumns: '1fr 1fr',
        width: '100%',
      }}
    >
      {([0, 1] as const).map((index) => (
        <TextField
          fullWidth
          key={index}
          margin="none"
          onChange={(event) => handleRangeChange(index, event.target.value)}
          type={inputType}
          value={
            valueFormatter
              ? valueFormatter(currentValue[index])
              : ((currentValue[index] as string | number | undefined) ?? '')
          }
          {...textFieldProps}
          size="small"
          variant="outlined"
        />
      ))}
    </Box>
  );
};
