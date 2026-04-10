import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { type Dayjs } from 'dayjs';
import 'dayjs/locale/de';
import 'dayjs/locale/fr';
import 'dayjs/locale/hr';
import 'dayjs/locale/nl';
import { useMemo, useState } from 'react';
import {
  type DropdownOption,
  type MRT_FilterOperatorEditComponentProps,
  type MRT_RowData,
} from '../types';
import { getValueAndLabel, parseFromValuesOrFunc } from '../utils/utils';

const getSharedTextFieldProps = <TData extends MRT_RowData>({
  column,
  table,
}: MRT_FilterOperatorEditComponentProps<TData>) => ({
  ...parseFromValuesOrFunc(table.options.muiFilterTextFieldProps, {
    column,
    table,
  }),
  ...parseFromValuesOrFunc(column.columnDef.muiFilterTextFieldProps, {
    column,
    table,
  }),
});

const getPickerLocale = (language: string): string => {
  const normalizedLanguage = language.toLowerCase();

  if (normalizedLanguage.startsWith('de')) {
    return 'de';
  }

  if (normalizedLanguage.startsWith('fr')) {
    return 'fr';
  }

  if (normalizedLanguage.startsWith('hr')) {
    return 'hr';
  }

  if (normalizedLanguage.startsWith('nl')) {
    return 'nl';
  }

  return 'en';
};

const getPickerValue = (value: unknown): Dayjs | null => {
  if (!value) {
    return null;
  }

  if (dayjs.isDayjs(value)) {
    return value;
  }

  if (value instanceof Date) {
    const parsedDate = dayjs(value);
    return parsedDate.isValid() ? parsedDate : null;
  }

  if (
    typeof value === 'object' &&
    value !== null &&
    'date' in value &&
    typeof (value as { date: unknown }).date === 'string'
  ) {
    const parsedDate = dayjs((value as { date: string }).date);
    return parsedDate.isValid() ? parsedDate : null;
  }

  const parsedDate = dayjs(value as string | number);
  return parsedDate.isValid() ? parsedDate : null;
};

const formatPickerValue = (
  value: Dayjs | null,
  pickerType: 'date' | 'datetime',
): string => {
  if (!value) {
    return '';
  }

  return value.format(
    pickerType === 'date' ? 'YYYY-MM-DD' : 'YYYY-MM-DDTHH:mm',
  );
};

const formatRangeDisplayValue = (
  value: unknown,
  language: string,
  pickerType: 'date' | 'datetime',
): string => {
  const currentValue = Array.isArray(value) ? value : ['', ''];

  const formatSingleValue = (item: unknown) => {
    const parsedValue = getPickerValue(item);

    if (!parsedValue) {
      return '';
    }

    return pickerType === 'date'
      ? parsedValue.toDate().toLocaleDateString(language)
      : parsedValue.toDate().toLocaleString(language);
  };

  const startValue = formatSingleValue(currentValue[0]);
  const endValue = formatSingleValue(currentValue[1]);

  if (!startValue && !endValue) {
    return '';
  }

  return `${startValue} - ${endValue}`.trim();
};

const getPickerTextFieldProps = <TData extends MRT_RowData>(
  props: MRT_FilterOperatorEditComponentProps<TData>,
) => ({
  ...getSharedTextFieldProps(props),
  fullWidth: true,
  margin: 'none' as const,
  size: 'small' as const,
  variant: 'outlined' as const,
});

const getDatePickerProps = <TData extends MRT_RowData>(
  props: MRT_FilterOperatorEditComponentProps<TData>,
) => ({
  ...parseFromValuesOrFunc(props.table.options.muiFilterDatePickerProps, {
    column: props.column,
    table: props.table,
  }),
  ...parseFromValuesOrFunc(props.column.columnDef.muiFilterDatePickerProps, {
    column: props.column,
    table: props.table,
  }),
});

const getDateTimePickerProps = <TData extends MRT_RowData>(
  props: MRT_FilterOperatorEditComponentProps<TData>,
) => ({
  ...parseFromValuesOrFunc(props.table.options.muiFilterDateTimePickerProps, {
    column: props.column,
    table: props.table,
  }),
  ...parseFromValuesOrFunc(
    props.column.columnDef.muiFilterDateTimePickerProps,
    {
      column: props.column,
      table: props.table,
    },
  ),
});

type MRT_SingleValueEditorProps<TData extends MRT_RowData> =
  MRT_FilterOperatorEditComponentProps<TData> & {
    inputType?: 'date' | 'datetime-local' | 'number' | 'text';
    options?: DropdownOption[];
    transformValue?: (value: string) => unknown;
    valueFormatter?: (value: unknown) => string;
  };

const MRT_SingleValueEditor = <TData extends MRT_RowData>({
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

  const value = valueFormatter
    ? valueFormatter(rule.value)
    : ((rule.value as string | number | undefined) ?? '');

  return (
    <TextField
      fullWidth
      margin="none"
      onChange={(event) =>
        onChange(
          (transformValue?.(event.target.value) ?? event.target.value) as never,
        )
      }
      select={!!options?.length}
      type={options?.length ? undefined : inputType}
      value={value}
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

type MRT_RangeValueEditorProps<TData extends MRT_RowData> =
  MRT_FilterOperatorEditComponentProps<TData> & {
    inputType?: 'date' | 'datetime-local' | 'number' | 'text';
    transformValue?: (value: string) => unknown;
    valueFormatter?: (value: unknown) => string;
  };

const MRT_RangeValueEditor = <TData extends MRT_RowData>({
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

  const handleRangeChange = (index: 0 | 1, value: string) => {
    const nextValue = [...currentValue] as [unknown, unknown];
    nextValue[index] = transformValue?.(value) ?? value;
    onChange(nextValue as never);
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
      {[0, 1].map((index) => (
        <TextField
          fullWidth
          key={index}
          margin="none"
          onChange={(event) =>
            handleRangeChange(index as 0 | 1, event.target.value)
          }
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

type MRT_SingleDateValueEditorProps<TData extends MRT_RowData> =
  MRT_FilterOperatorEditComponentProps<TData> & {
    pickerType: 'date' | 'datetime';
  };

const MRT_SingleDateValueEditor = <TData extends MRT_RowData>({
  pickerType,
  ...props
}: MRT_SingleDateValueEditorProps<TData>) => {
  const pickerLocale = getPickerLocale(
    props.table.options.localization.language,
  );
  const pickerProps =
    pickerType === 'date'
      ? getDatePickerProps(props)
      : getDateTimePickerProps(props);
  const pickerTextFieldProps = getPickerTextFieldProps(props);
  const sharedPickerProps = {
    onChange: (value: Dayjs | null) => {
      props.onChange(formatPickerValue(value, pickerType) as never);
    },
    value: getPickerValue(props.rule.value),
  };

  return (
    <LocalizationProvider
      adapterLocale={pickerLocale}
      dateAdapter={AdapterDayjs}
    >
      {pickerType === 'date' ? (
        <DatePicker
          {...sharedPickerProps}
          {...pickerProps}
          slotProps={{
            ...pickerProps?.slotProps,
            field: {
              clearable: true,
              ...pickerProps?.slotProps?.field,
            },
            textField: {
              ...pickerTextFieldProps,
              ...pickerProps?.slotProps?.textField,
              size: 'small',
              variant: 'outlined',
            },
          }}
        />
      ) : (
        <DateTimePicker
          {...sharedPickerProps}
          {...pickerProps}
          slotProps={{
            ...pickerProps?.slotProps,
            field: {
              clearable: true,
              ...pickerProps?.slotProps?.field,
            },
            textField: {
              ...pickerTextFieldProps,
              ...pickerProps?.slotProps?.textField,
              size: 'small',
              variant: 'outlined',
            },
          }}
        />
      )}
    </LocalizationProvider>
  );
};

type MRT_RangeDateValueEditorProps<TData extends MRT_RowData> =
  MRT_FilterOperatorEditComponentProps<TData> & {
    pickerType: 'date' | 'datetime';
  };

const MRT_RangeDateValueEditor = <TData extends MRT_RowData>({
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
    props.onChange(nextValue as never);
  };

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClear = (event?: React.MouseEvent<HTMLElement>) => {
    event?.stopPropagation();
    props.onChange(['', ''] as never);
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
              {[0, 1].map((index) => (
                <PickerComponent
                  {...pickerProps}
                  key={index}
                  onChange={(value) => handleRangeChange(index as 0 | 1, value)}
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

export const MRT_FilterRuleTextEditor = <TData extends MRT_RowData>(
  props: MRT_FilterOperatorEditComponentProps<TData>,
) => <MRT_SingleValueEditor {...props} inputType="text" />;

export const MRT_FilterRuleNumberEditor = <TData extends MRT_RowData>(
  props: MRT_FilterOperatorEditComponentProps<TData>,
) => (
  <MRT_SingleValueEditor
    {...props}
    inputType="number"
    transformValue={(value) => (value === '' ? '' : Number(value))}
    valueFormatter={(value) =>
      value === undefined || value === null || value === '' ? '' : String(value)
    }
  />
);

export const MRT_FilterRuleBooleanEditor = <TData extends MRT_RowData>(
  props: MRT_FilterOperatorEditComponentProps<TData>,
) => (
  <MRT_SingleValueEditor
    {...props}
    options={[
      { label: props.table.options.localization.booleanTrue, value: 'true' },
      { label: props.table.options.localization.booleanFalse, value: 'false' },
    ]}
    transformValue={(value) =>
      value === 'true' ? true : value === 'false' ? false : ''
    }
    valueFormatter={(value) =>
      value === true ? 'true' : value === false ? 'false' : ''
    }
  />
);

export const MRT_FilterRuleDateEditor = <TData extends MRT_RowData>(
  props: MRT_FilterOperatorEditComponentProps<TData>,
) => <MRT_SingleDateValueEditor {...props} pickerType="date" />;

export const MRT_FilterRuleDateTimeEditor = <TData extends MRT_RowData>(
  props: MRT_FilterOperatorEditComponentProps<TData>,
) => <MRT_SingleDateValueEditor {...props} pickerType="datetime" />;

export const MRT_FilterRuleRangeTextEditor = <TData extends MRT_RowData>(
  props: MRT_FilterOperatorEditComponentProps<TData>,
) => <MRT_RangeValueEditor {...props} inputType="text" />;

export const MRT_FilterRuleRangeNumberEditor = <TData extends MRT_RowData>(
  props: MRT_FilterOperatorEditComponentProps<TData>,
) => (
  <MRT_RangeValueEditor
    {...props}
    inputType="number"
    transformValue={(value) => (value === '' ? '' : Number(value))}
    valueFormatter={(value) =>
      value === undefined || value === null || value === '' ? '' : String(value)
    }
  />
);

export const MRT_FilterRuleRangeDateEditor = <TData extends MRT_RowData>(
  props: MRT_FilterOperatorEditComponentProps<TData>,
) => <MRT_RangeDateValueEditor {...props} pickerType="date" />;

export const MRT_FilterRuleRangeDateTimeEditor = <TData extends MRT_RowData>(
  props: MRT_FilterOperatorEditComponentProps<TData>,
) => <MRT_RangeDateValueEditor {...props} pickerType="datetime" />;

export const MRT_FilterRuleSelectEditor = <TData extends MRT_RowData>(
  props: MRT_FilterOperatorEditComponentProps<TData> & {
    options: DropdownOption[];
  },
) => <MRT_SingleValueEditor {...props} options={props.options} />;
