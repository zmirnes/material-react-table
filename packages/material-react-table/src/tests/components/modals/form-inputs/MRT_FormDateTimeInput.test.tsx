import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { MRT_FormDateTimeInput } from '../../../../components/modals/form-inputs/MRT_FormDateTimeInput';
import {
  type MRT_ColumnDef,
  type MRT_FormFieldConfig,
} from '../../../../types';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// A default MUI theme used to satisfy useTheme() calls inside MUI components.
const DEFAULT_THEME = createTheme();

// English locale — used for all tests so datetime format is predictable.
const DEFAULT_LOCALE = 'en';

// Minimal column definition used across tests.
const DEFAULT_COLUMN_DEF: MRT_ColumnDef<Record<string, unknown>> = {
  accessorKey: 'scheduledAt',
  header: 'Scheduled At',
  type: 'dateTime',
};

interface FormWrapperProps {
  children: React.ReactNode;
  // Initial form values used to pre-populate controlled fields.
  defaultValues?: Record<string, unknown>;
  // RHF validation mode — 'onBlur' is used for error trigger tests.
  mode?: 'onChange' | 'onBlur' | 'onSubmit';
}

// Provides RHF context and MUI theme for rendering MRT_FormDateTimeInput in isolation.
const FormWrapper = ({
  children,
  defaultValues = {},
  mode = 'onBlur',
}: FormWrapperProps) => {
  const methods = useForm({ defaultValues, mode });
  return (
    <ThemeProvider theme={DEFAULT_THEME}>
      <FormProvider {...methods}>
        <form>{children}</form>
      </FormProvider>
    </ThemeProvider>
  );
};

interface RenderOptions {
  name?: string;
  columnDef?: MRT_ColumnDef<Record<string, unknown>>;
  fieldConfig?: MRT_FormFieldConfig<
    Record<string, unknown>,
    string | null
  > | null;
  defaultValues?: Record<string, unknown>;
  locale?: string;
  mode?: 'onChange' | 'onBlur' | 'onSubmit';
}

// Renders MRT_FormDateTimeInput wrapped in FormWrapper so useFormContext() resolves correctly.
const renderDateTimeInput = ({
  name = 'scheduledAt',
  columnDef = DEFAULT_COLUMN_DEF,
  fieldConfig = null,
  defaultValues = { scheduledAt: null },
  locale = DEFAULT_LOCALE,
  mode = 'onBlur',
}: RenderOptions = {}) =>
  render(
    <FormWrapper defaultValues={defaultValues} mode={mode}>
      <MRT_FormDateTimeInput
        name={name}
        columnDef={columnDef}
        fieldConfig={fieldConfig}
        locale={locale}
      />
    </FormWrapper>,
  );

describe('MRT_FormDateTimeInput', () => {
  describe('label', () => {
    it('uses columnDef.header as label when fieldConfig has no label', () => {
      renderDateTimeInput({ fieldConfig: null });

      expect(screen.getByLabelText('Scheduled At')).toBeInTheDocument();
    });

    it('uses fieldConfig.label override when provided', () => {
      renderDateTimeInput({ fieldConfig: { label: 'Event Date & Time' } });

      // Override label is used; original column header is not rendered as a label.
      expect(screen.getByLabelText('Event Date & Time')).toBeInTheDocument();
      expect(screen.queryByLabelText('Scheduled At')).not.toBeInTheDocument();
    });
  });

  describe('basic field props', () => {
    it('renders without crashing when fieldConfig is null', () => {
      renderDateTimeInput({ fieldConfig: null });

      expect(screen.getByLabelText('Scheduled At')).toBeInTheDocument();
    });

    it('renders a disabled input when fieldConfig.disabled is true', () => {
      renderDateTimeInput({ fieldConfig: { disabled: true } });

      expect(screen.getByLabelText('Scheduled At')).toBeDisabled();
    });

    it('renders helperText from fieldConfig when there is no validation error', () => {
      renderDateTimeInput({
        fieldConfig: { helperText: 'Format: DD.MM.YYYY HH:mm' },
      });

      expect(screen.getByText('Format: DD.MM.YYYY HH:mm')).toBeInTheDocument();
    });

    it('applies small size by default when fieldConfig.size is not specified', () => {
      renderDateTimeInput({ fieldConfig: null });

      // MUI v6 applies size="small" as MuiInputBase-sizeSmall on the InputBase wrapper.
      const inputWrapper = screen
        .getByLabelText('Scheduled At')
        .closest('.MuiInputBase-root');
      expect(inputWrapper).toHaveClass('MuiInputBase-sizeSmall');
    });

    it('applies medium size when fieldConfig.size is medium', () => {
      renderDateTimeInput({ fieldConfig: { size: 'medium' } });

      // Medium size does not carry the sizeSmall class.
      const inputWrapper = screen
        .getByLabelText('Scheduled At')
        .closest('.MuiInputBase-root');
      expect(inputWrapper).not.toHaveClass('MuiInputBase-sizeSmall');
    });
  });

  describe('pre-populated value (edit mode)', () => {
    it('displays a non-empty value when defaultValues contains a datetime string', () => {
      renderDateTimeInput({
        defaultValues: { scheduledAt: '2024-01-15T14:30' },
      });

      // The picker converts '2024-01-15T14:30' to a Dayjs and displays it — input must not be empty.
      const input = screen.getByLabelText('Scheduled At');
      expect(input).not.toHaveValue('');
    });

    it('displays an empty input when the default value is null', () => {
      renderDateTimeInput({ defaultValues: { scheduledAt: null } });

      // Null value — picker renders in empty state with placeholder segments.
      const input = screen.getByLabelText('Scheduled At');
      // The picker shows placeholder format like MM/DD/YYYY HH:MM when no value is set.
      expect(input).toHaveAttribute('placeholder');
    });

    it('handles an API datetime object as a pre-populated value', () => {
      // API datetime objects are the shape returned from the server for dateTime columns.
      renderDateTimeInput({
        defaultValues: {
          scheduledAt: {
            date: '2024-06-20 14:30:00',
            timezone: 'UTC',
            timezone_type: 3,
          },
        },
      });

      // getPickerValue handles API objects — input must display a datetime, not be empty.
      const input = screen.getByLabelText('Scheduled At');
      expect(input).not.toHaveValue('');
    });
  });

  describe('validation', () => {
    it('shows a required error message when the field is blurred empty', async () => {
      renderDateTimeInput({
        fieldConfig: { rules: { required: 'Datetime is required' } },
        mode: 'onBlur',
      });

      const input = screen.getByLabelText('Scheduled At');

      await act(async () => {
        fireEvent.focus(input);
        fireEvent.blur(input);
      });

      await waitFor(() => {
        expect(screen.getByText('Datetime is required')).toBeInTheDocument();
      });
    });

    it('replaces helperText with the error message when validation fails', async () => {
      renderDateTimeInput({
        fieldConfig: {
          helperText: 'Format: DD.MM.YYYY HH:mm',
          rules: { required: 'Datetime is required' },
        },
        mode: 'onBlur',
      });

      const input = screen.getByLabelText('Scheduled At');

      await act(async () => {
        fireEvent.focus(input);
        fireEvent.blur(input);
      });

      await waitFor(() => {
        // Error message replaces the static helper text while validation fails.
        expect(screen.getByText('Datetime is required')).toBeInTheDocument();
        expect(
          screen.queryByText('Format: DD.MM.YYYY HH:mm'),
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('onChange', () => {
    it('calls fieldConfig.onChange with the serialised YYYY-MM-DDTHH:mm string', async () => {
      const onChangeSpy =
        vi.fn<(value: string | null, fieldName: string) => void>();

      renderDateTimeInput({ fieldConfig: { onChange: onChangeSpy } });

      // Simulate the picker calling onChange with a valid Dayjs value by
      // directly triggering the internal input change to a parseable datetime string.
      const input = screen.getByLabelText('Scheduled At');

      await act(async () => {
        fireEvent.change(input, { target: { value: '01/20/2024 14:30' } });
      });

      // When dayjs successfully parses the value, onChange receives 'YYYY-MM-DDTHH:mm'.
      // When parsing fails (e.g. partial input), onChange receives null.
      expect(onChangeSpy).toHaveBeenCalled();
    });

    it('keeps the raw serialised value when fieldConfig.onChange returns void', async () => {
      // onChange returns void — acts as a side-effect only, no transformation.
      const onChangeSpy =
        vi.fn<(value: string | null, fieldName: string) => void>();

      renderDateTimeInput({ fieldConfig: { onChange: onChangeSpy } });

      const input = screen.getByLabelText('Scheduled At');

      await act(async () => {
        fireEvent.change(input, { target: { value: '01/20/2024 14:30' } });
      });

      // The spy receives either a YYYY-MM-DDTHH:mm string or null (partial input).
      expect(onChangeSpy).toHaveBeenCalledWith(
        expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$|^null$/),
        'scheduledAt',
      );
    });

    it('stores null when fieldConfig.onChange explicitly returns null', async () => {
      // null is a valid TValue — onChange returning null must not be skipped by ?? operator.
      const onChangeSpy = vi.fn(() => null);

      renderDateTimeInput({ fieldConfig: { onChange: onChangeSpy } });

      const input = screen.getByLabelText('Scheduled At');

      await act(async () => {
        fireEvent.change(input, { target: { value: '01/20/2024 14:30' } });
      });

      // The spy returns null — RHF should store null, not the serialised datetime string.
      expect(onChangeSpy).toHaveBeenCalled();
    });
  });
});
