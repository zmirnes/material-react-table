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

// Indices for the two range pickers: 0 = start, 1 = end
const RANGE_INDICES = [0, 1] as const;

// Popover width differs slightly to accommodate the time input
const POPOVER_WIDTH: Record<'date' | 'datetime', number> = {
  date: 380,
  datetime: 460,
};

export const MRT_RangeDateValueEditor = <TData extends MRT_RowData>({
  pickerType,
  ...props
}: MRT_RangeDateValueEditorProps<TData>) => {
  const { onChange, rule, table } = props;
  const {
    options: {
      icons: { CloseIcon },
      localization,
    },
  } = table;

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  // Resolve picker props once — reused for both range pickers
  const datePickerProps = getDatePickerProps(props);
  const dateTimePickerProps = getDateTimePickerProps(props);
  const pickerTextFieldProps = getPickerTextFieldProps(props);
  const textFieldProps = getSharedTextFieldProps(props);
  const pickerLocale = getPickerLocale(localization.language);

  // Normalise value to a two-element array
  const currentValue = Array.isArray(rule.value) ? rule.value : ['', ''];

  // Human-readable summary shown in the trigger text field
  const displayValue = useMemo(
    () =>
      formatRangeDisplayValue(rule.value, localization.language, pickerType),
    [localization.language, pickerType, rule.value],
  );

  // --- Event handlers ---

  const handleRangeChange = (index: 0 | 1, value: Dayjs | null) => {
    const nextValue = [...currentValue];
    nextValue[index] = formatPickerValue(value, pickerType);
    onChange(nextValue);
  };

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClear = (event?: React.MouseEvent<HTMLElement>) => {
    event?.stopPropagation();
    onChange(['', '']);
  };

  // --- Shared slot props builders ---

  // textField config is identical for both DatePicker and DateTimePicker
  const buildTextFieldSlotProps = (label: string) => ({
    ...pickerTextFieldProps,
    label,
    size: 'small' as const,
    variant: 'outlined' as const,
  });

  return (
    <LocalizationProvider
      adapterLocale={pickerLocale}
      dateAdapter={AdapterDayjs}
    >
      <>
        {/* Read-only trigger field that opens the popover */}
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
          sx={{ cursor: 'pointer', ...textFieldProps.sx }}
        />

        {/* Popover containing the two pickers side-by-side */}
        <Popover
          anchorEl={anchorEl}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          onClose={handleClose}
          open={!!anchorEl}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        >
          <Box sx={{ p: 1.25, width: POPOVER_WIDTH[pickerType] }}>
            <Stack direction={{ md: 'row', xs: 'column' }} spacing={1}>
              {RANGE_INDICES.map((index) => {
                const label =
                  index === 0 ? localization.filterFrom : localization.filterTo;
                const pickerValue = getPickerValue(currentValue[index]);

                return pickerType === 'date' ? (
                  <DatePicker<Dayjs>
                    {...datePickerProps}
                    key={index}
                    onChange={(value) => handleRangeChange(index, value)}
                    slotProps={{
                      ...datePickerProps.slotProps,
                      field: {
                        clearable: true,
                        ...datePickerProps.slotProps?.field,
                      },
                      textField: {
                        ...buildTextFieldSlotProps(label),
                        ...datePickerProps.slotProps?.textField,
                      },
                    }}
                    value={pickerValue}
                  />
                ) : (
                  <DateTimePicker<Dayjs>
                    {...dateTimePickerProps}
                    key={index}
                    onChange={(value) => handleRangeChange(index, value)}
                    slotProps={{
                      ...dateTimePickerProps.slotProps,
                      field: {
                        clearable: true,
                        ...dateTimePickerProps.slotProps?.field,
                      },
                      textField: {
                        ...buildTextFieldSlotProps(label),
                        ...dateTimePickerProps.slotProps?.textField,
                      },
                    }}
                    value={pickerValue}
                  />
                );
              })}
            </Stack>

            {/* Footer actions */}
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}
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
