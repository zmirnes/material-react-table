import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { MRT_FormDateInput } from '../../../../components/modals/form-inputs/MRT_FormDateInput';
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

// English locale — used for all tests so date format is predictable (MM/DD/YYYY).
const DEFAULT_LOCALE = 'en';

// Minimal column definition used across tests.
const DEFAULT_COLUMN_DEF: MRT_ColumnDef<Record<string, unknown>> = {
  accessorKey: 'birthDate',
  header: 'Birth Date',
  type: 'date',
};

interface FormWrapperProps {
  children: React.ReactNode;
  // Initial form values used to pre-populate controlled fields.
  defaultValues?: Record<string, unknown>;
  // RHF validation mode — 'onBlur' is used for error trigger tests.
  mode?: 'onChange' | 'onBlur' | 'onSubmit';
}

// Provides RHF context and MUI theme for rendering MRT_FormDateInput in isolation.
// useForm must live inside the same React tree as the component to share RHF state.
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

// Renders MRT_FormDateInput wrapped in FormWrapper so useFormContext() resolves correctly.
const renderDateInput = ({
  name = 'birthDate',
  columnDef = DEFAULT_COLUMN_DEF,
  fieldConfig = null,
  defaultValues = { birthDate: null },
  locale = DEFAULT_LOCALE,
  mode = 'onBlur',
}: RenderOptions = {}) =>
  render(
    <FormWrapper defaultValues={defaultValues} mode={mode}>
      <MRT_FormDateInput
        name={name}
        columnDef={columnDef}
        fieldConfig={fieldConfig}
        locale={locale}
      />
    </FormWrapper>,
  );

describe('MRT_FormDateInput', () => {
  describe('label', () => {
    it('uses columnDef.header as label when fieldConfig has no label', () => {
      renderDateInput({ fieldConfig: null });

      expect(screen.getByLabelText('Birth Date')).toBeInTheDocument();
    });

    it('uses fieldConfig.label override when provided', () => {
      renderDateInput({ fieldConfig: { label: 'Date of Birth' } });

      // Override label is used; original column header is not rendered as a label.
      expect(screen.getByLabelText('Date of Birth')).toBeInTheDocument();
      expect(screen.queryByLabelText('Birth Date')).not.toBeInTheDocument();
    });
  });

  describe('basic field props', () => {
    it('renders without crashing when fieldConfig is null', () => {
      renderDateInput({ fieldConfig: null });

      expect(screen.getByLabelText('Birth Date')).toBeInTheDocument();
    });

    it('renders a disabled input when fieldConfig.disabled is true', () => {
      renderDateInput({ fieldConfig: { disabled: true } });

      expect(screen.getByLabelText('Birth Date')).toBeDisabled();
    });

    it('renders helperText from fieldConfig when there is no validation error', () => {
      renderDateInput({ fieldConfig: { helperText: 'Format: DD.MM.YYYY' } });

      expect(screen.getByText('Format: DD.MM.YYYY')).toBeInTheDocument();
    });

    it('applies small size by default when fieldConfig.size is not specified', () => {
      renderDateInput({ fieldConfig: null });

      // MUI v6 applies size="small" as MuiInputBase-sizeSmall on the InputBase wrapper.
      const inputWrapper = screen
        .getByLabelText('Birth Date')
        .closest('.MuiInputBase-root');
      expect(inputWrapper).toHaveClass('MuiInputBase-sizeSmall');
    });

    it('applies medium size when fieldConfig.size is medium', () => {
      renderDateInput({ fieldConfig: { size: 'medium' } });

      // Medium size does not carry the sizeSmall class.
      const inputWrapper = screen
        .getByLabelText('Birth Date')
        .closest('.MuiInputBase-root');
      expect(inputWrapper).not.toHaveClass('MuiInputBase-sizeSmall');
    });
  });

  describe('pre-populated value (edit mode)', () => {
    it('displays a non-empty value when defaultValues contains a date string', () => {
      renderDateInput({ defaultValues: { birthDate: '2024-01-15' } });

      // The picker converts '2024-01-15' to a Dayjs and displays it — input must not be empty.
      const input = screen.getByLabelText('Birth Date');
      expect(input).not.toHaveValue('');
    });

    it('displays an empty input when the default value is null', () => {
      renderDateInput({ defaultValues: { birthDate: null } });

      // Null value — picker renders in empty state with placeholder segments.
      const input = screen.getByLabelText('Birth Date');
      // The picker shows placeholder format like MM/DD/YYYY when no value is set.
      expect(input).toHaveAttribute('placeholder');
    });

    it('handles an API date object as a pre-populated value', () => {
      // API date objects are the shape returned from the server for date columns.
      renderDateInput({
        defaultValues: {
          birthDate: {
            date: '2024-06-20 00:00:00',
            timezone: 'UTC',
            timezone_type: 3,
          },
        },
      });

      // getPickerValue handles API objects — input must display a date, not be empty.
      const input = screen.getByLabelText('Birth Date');
      expect(input).not.toHaveValue('');
    });
  });

  describe('validation', () => {
    it('shows a required error message when the field is blurred empty', async () => {
      renderDateInput({
        fieldConfig: { rules: { required: 'Date is required' } },
        mode: 'onBlur',
      });

      const input = screen.getByLabelText('Birth Date');

      await act(async () => {
        fireEvent.focus(input);
        fireEvent.blur(input);
      });

      await waitFor(() => {
        expect(screen.getByText('Date is required')).toBeInTheDocument();
      });
    });

    it('replaces helperText with the error message when validation fails', async () => {
      renderDateInput({
        fieldConfig: {
          helperText: 'Format: DD.MM.YYYY',
          rules: { required: 'Date is required' },
        },
        mode: 'onBlur',
      });

      const input = screen.getByLabelText('Birth Date');

      await act(async () => {
        fireEvent.focus(input);
        fireEvent.blur(input);
      });

      await waitFor(() => {
        // Error message replaces the static helper text while validation fails.
        expect(screen.getByText('Date is required')).toBeInTheDocument();
        expect(
          screen.queryByText('Format: DD.MM.YYYY'),
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('onChange', () => {
    it('calls fieldConfig.onChange with the serialised YYYY-MM-DD string', async () => {
      const onChangeSpy =
        vi.fn<(value: string | null, fieldName: string) => void>();

      renderDateInput({ fieldConfig: { onChange: onChangeSpy } });

      // Simulate the picker calling onChange with a valid Dayjs value by
      // directly triggering the internal input change to a parseable date string.
      const input = screen.getByLabelText('Birth Date');

      await act(async () => {
        fireEvent.change(input, { target: { value: '01/20/2024' } });
      });

      // When dayjs successfully parses the value, onChange receives 'YYYY-MM-DD'.
      // When parsing fails (e.g. partial input), onChange receives null.
      expect(onChangeSpy).toHaveBeenCalled();
    });

    it('keeps the raw serialised value when fieldConfig.onChange returns void', async () => {
      // onChange returns void — acts as a side-effect only, no transformation.
      const onChangeSpy =
        vi.fn<(value: string | null, fieldName: string) => void>();

      renderDateInput({ fieldConfig: { onChange: onChangeSpy } });

      const input = screen.getByLabelText('Birth Date');

      await act(async () => {
        fireEvent.change(input, { target: { value: '01/20/2024' } });
      });

      expect(onChangeSpy).toHaveBeenCalledWith(
        expect.stringMatching(/^\d{4}-\d{2}-\d{2}$|^null$/),
        'birthDate',
      );
    });

    it('stores null when fieldConfig.onChange explicitly returns null', async () => {
      // null is a valid TValue — onChange returning null must not be skipped by ?? operator.
      const onChangeSpy = vi.fn(() => null);

      renderDateInput({ fieldConfig: { onChange: onChangeSpy } });

      const input = screen.getByLabelText('Birth Date');

      await act(async () => {
        fireEvent.change(input, { target: { value: '01/20/2024' } });
      });

      // The spy returns null — RHF should store null, not the serialised date string.
      expect(onChangeSpy).toHaveBeenCalled();
    });
  });
});
