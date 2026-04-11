import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { MultiSectionDigitalClock } from '@mui/x-date-pickers/MultiSectionDigitalClock';
import { type Dayjs } from 'dayjs';
import { useMemo, useState } from 'react';
import {
  type MRT_FilterOperatorEditComponentProps,
  type MRT_RowData,
} from '../../types';
import {
  formatPickerValue,
  formatRangeDisplayValue,
  getPickerLocale,
  getPickerValue,
  getSharedTextFieldProps,
} from './pickerHelpers';

export type MRT_RangeDateValueEditorProps<TData extends MRT_RowData> =
  MRT_FilterOperatorEditComponentProps<TData> & {
    pickerType: 'date' | 'datetime';
  };

// Indices for the two range pickers: 0 = start (From), 1 = end (To)
const RANGE_INDICES = [0, 1] as const;

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

  // Merge table-level and column-level TextField overrides for the trigger field
  const textFieldProps = getSharedTextFieldProps(props);
  const pickerLocale = getPickerLocale(localization.language);

  // Normalise stored value to a two-element array
  const currentValue = Array.isArray(rule.value) ? rule.value : ['', ''];

  // Human-readable "start – end" summary shown in the read-only trigger field
  const displayValue = useMemo(
    () =>
      formatRangeDisplayValue(rule.value, localization.language, pickerType),
    [localization.language, pickerType, rule.value],
  );

  // Updates one range endpoint and keeps the other unchanged
  const handleRangeChange = (index: 0 | 1, value: Dayjs | null) => {
    const nextValue = [...currentValue];
    nextValue[index] = formatPickerValue(value, pickerType);
    onChange(nextValue);
  };

  // Calendar date click — in datetime mode preserves the previously stored time
  const handleDateChange = (index: 0 | 1, newDate: Dayjs | null) => {
    if (!newDate) {
      handleRangeChange(index, null);
      return;
    }
    if (pickerType === 'datetime') {
      // Merge newly selected date with the existing time (default to 00:00)
      const existingValue = getPickerValue(currentValue[index]);
      const merged = newDate
        .hour(existingValue?.hour() ?? 0)
        .minute(existingValue?.minute() ?? 0);
      handleRangeChange(index, merged);
    } else {
      handleRangeChange(index, newDate);
    }
  };

  // Clock time change — preserves the existing date, applies the new hour/minute
  const handleTimeChange = (index: 0 | 1, newTime: Dayjs | null) => {
    if (!newTime) return;
    // Fall back to newTime's date when no date has been picked yet
    const existingDate = getPickerValue(currentValue[index]) ?? newTime;
    const merged = existingDate.hour(newTime.hour()).minute(newTime.minute());
    handleRangeChange(index, merged);
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

        {/* Popover with inline calendars — immediately visible, no extra click needed */}
        <Popover
          anchorEl={anchorEl}
          anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
          onClose={handleClose}
          open={!!anchorEl}
          transformOrigin={{ horizontal: 'left', vertical: 'top' }}
        >
          <Box sx={{ p: 1.5 }}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              // Vertical divider between the From and To sections
              divider={<Divider flexItem orientation="vertical" />}
              spacing={1}
            >
              {RANGE_INDICES.map((index) => {
                const sectionLabel =
                  index === 0 ? localization.filterFrom : localization.filterTo;
                const pickerValue = getPickerValue(currentValue[index]);

                return (
                  <Box key={index} sx={{ minWidth: 0 }}>
                    {/* From / To label above the calendar */}
                    <Typography
                      color="text.secondary"
                      sx={{ mb: 0.5, px: 1 }}
                      variant="caption"
                    >
                      {sectionLabel}
                    </Typography>

                    <Box display="flex">
                      {/* Inline calendar — permanently open, no extra click */}
                      <DateCalendar<Dayjs>
                        onChange={(value) => handleDateChange(index, value)}
                        value={pickerValue}
                        sx={{ width: '100%' }}
                      />

                      {/* Digital clock for the time part — only in datetime mode */}
                      {pickerType === 'datetime' && (
                        <MultiSectionDigitalClock<Dayjs>
                          onChange={(value) => handleTimeChange(index, value)}
                          sx={{
                            // Hide scrollbars on each clock column while keeping scroll functionality
                            '& .MuiMultiSectionDigitalClockSection-root': {
                              scrollbarWidth: 'none',
                              '&::-webkit-scrollbar': { display: 'none' },
                            },
                            mt: 1,
                            width: '156px',
                          }}
                          value={pickerValue}
                          views={['hours', 'minutes']}
                          timeSteps={{ hours: 1, minutes: 1 }}
                        />
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Stack>

            {/* Footer actions */}
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}
            >
              <Button onClick={handleClear}>{localization.clear}</Button>
              <Button onClick={handleClose}>{localization.apply}</Button>
            </Box>
          </Box>
        </Popover>
      </>
    </LocalizationProvider>
  );
};
