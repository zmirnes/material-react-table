import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { type Dayjs } from 'dayjs';
import { useMemo, useState } from 'react';
import {
  type MRT_FilterOperatorEditComponentProps,
  type MRT_RowData,
} from '../../types';
import {
  formatPickerValue,
  formatRangeDisplayValue,
  getDatePickerProps,
  getDateTimePickerProps,
  getPickerLocale,
  getPickerTextFieldProps,
  getPickerValue,
  getSharedTextFieldProps,
} from './pickerHelpers';

export type MRT_RangeDateValueEditorProps<TData extends MRT_RowData> =
  MRT_FilterOperatorEditComponentProps<TData> & {
    pickerType: 'date' | 'datetime';
  };

export const MRT_RangeDateValueEditor = <TData extends MRT_RowData>({
  pickerType,
  ...props
}: MRT_RangeDateValueEditorProps<TData>) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const pickerLocale = getPickerLocale(
    props.table.options.localization.language,
  );
  const {
    options: {
      icons: { CloseIcon },
      localization,
    },
  } = props.table;
  const pickerProps =
    pickerType === 'date'
      ? getDatePickerProps(props)
      : getDateTimePickerProps(props);
  const pickerTextFieldProps = getPickerTextFieldProps(props);
  const textFieldProps = getSharedTextFieldProps(props);
  const currentValue = Array.isArray(props.rule.value)
    ? props.rule.value
    : ['', ''];

  const displayValue = useMemo(
    () =>
      formatRangeDisplayValue(
        props.rule.value,
        localization.language,
        pickerType,
      ),
    [localization.language, pickerType, props.rule.value],
  );

  const handleRangeChange = (index: 0 | 1, value: Dayjs | null) => {
    const nextValue = [...currentValue] as [unknown, unknown];
    nextValue[index] = formatPickerValue(value, pickerType);
    props.onChange(nextValue as Parameters<typeof props.onChange>[0]);
  };

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClear = (event?: React.MouseEvent<HTMLElement>) => {
    event?.stopPropagation();
    props.onChange(['', ''] as Parameters<typeof props.onChange>[0]);
  };

  const PickerComponent = pickerType === 'date' ? DatePicker : DateTimePicker;

  return (
    <LocalizationProvider
      adapterLocale={pickerLocale}
      dateAdapter={AdapterDayjs}
    >
      <>
        <TextField
          fullWidth
          margin="none"
          onClick={handleOpen}
          placeholder={localization.filterBetween}
          size="small"
          value={displayValue}
          variant="outlined"
          {...textFieldProps}
          slotProps={{
            ...textFieldProps.slotProps,
            htmlInput: {
              readOnly: true,
              ...textFieldProps.slotProps?.htmlInput,
            },
            input: {
              ...textFieldProps.slotProps?.input,
              endAdornment: displayValue ? (
                <InputAdornment position="end">
                  <IconButton onClick={handleClear} size="small">
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : undefined,
            },
          }}
          sx={{
            cursor: 'pointer',
            ...textFieldProps.sx,
          }}
        />
        <Popover
          anchorEl={anchorEl}
          anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
          onClose={handleClose}
          open={!!anchorEl}
          transformOrigin={{ horizontal: 'left', vertical: 'top' }}
        >
          <Box sx={{ p: 1.25, width: pickerType === 'date' ? 340 : 420 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
              {([0, 1] as const).map((index) => (
                <PickerComponent
                  {...pickerProps}
                  key={index}
                  onChange={(value) => handleRangeChange(index, value)}
                  slotProps={{
                    ...pickerProps?.slotProps,
                    field: {
                      clearable: true,
                      ...pickerProps?.slotProps?.field,
                    },
                    textField: {
                      ...pickerTextFieldProps,
                      ...pickerProps?.slotProps?.textField,
                      label: index === 0 ? localization.min : localization.max,
                      size: 'small',
                      variant: 'outlined',
                    },
                  }}
                  value={getPickerValue(currentValue[index])}
                />
              ))}
            </Stack>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                mt: 1,
              }}
            >
              <Button onClick={handleClear} size="small">
                {localization.clear}
              </Button>
              <Button onClick={handleClose} size="small">
                {localization.apply}
              </Button>
            </Box>
          </Box>
        </Popover>
      </>
    </LocalizationProvider>
  );
};
