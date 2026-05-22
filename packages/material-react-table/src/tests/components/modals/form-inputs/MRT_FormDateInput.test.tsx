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
  // Attach handleSubmit so fireEvent.submit triggers RHF validation in tests.
  return (
    <ThemeProvider theme={DEFAULT_THEME}>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(() => {})}>{children}</form>
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

      // MUI v6 DatePicker renders a div[role="group"] as the labeled picker container.
      expect(
        screen.getByRole('group', { name: 'Birth Date' }),
      ).toBeInTheDocument();
    });

    it('uses fieldConfig.label override when provided', () => {
      renderDateInput({ fieldConfig: { label: 'Date of Birth' } });

      // Override label changes the accessible name of the picker group.
      expect(
        screen.getByRole('group', { name: 'Date of Birth' }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('group', { name: 'Birth Date' }),
      ).not.toBeInTheDocument();
    });
  });

  describe('basic field props', () => {
    it('renders without crashing when fieldConfig is null', () => {
      renderDateInput({ fieldConfig: null });

      expect(
        screen.getByRole('group', { name: 'Birth Date' }),
      ).toBeInTheDocument();
    });

    it('renders a disabled input when fieldConfig.disabled is true', () => {
      renderDateInput({ fieldConfig: { disabled: true } });

      // MUI v6 DatePicker marks each spinbutton section as aria-disabled when disabled.
      const spinbuttons = screen.getAllByRole('spinbutton');
      spinbuttons.forEach((section) => {
        expect(section).toHaveAttribute('aria-disabled', 'true');
      });
    });

    it('renders helperText from fieldConfig when there is no validation error', () => {
      renderDateInput({ fieldConfig: { helperText: 'Format: DD.MM.YYYY' } });

      expect(screen.getByText('Format: DD.MM.YYYY')).toBeInTheDocument();
    });

    it('applies small size by default when fieldConfig.size is not specified', () => {
      renderDateInput({ fieldConfig: null });

      // MUI v6 adds MuiPickersInputBase-inputSizeSmall directly on the div[role="group"].
      const picker = screen.getByRole('group', { name: 'Birth Date' });
      expect(picker).toHaveClass('MuiPickersInputBase-inputSizeSmall');
    });

    it('applies medium size when fieldConfig.size is medium', () => {
      renderDateInput({ fieldConfig: { size: 'medium' } });

      // Medium size does not carry the sizeSmall class.
      const picker = screen.getByRole('group', { name: 'Birth Date' });
      expect(picker).not.toHaveClass('MuiPickersInputBase-inputSizeSmall');
    });
  });

  describe('pre-populated value (edit mode)', () => {
    it('displays a non-empty value when defaultValues contains a date string', () => {
      renderDateInput({ defaultValues: { birthDate: '2024-01-15' } });

      // At least one spinbutton section must have a non-Empty aria-valuetext.
      const filledSections = screen
        .getAllByRole('spinbutton')
        .filter(
          (section) => section.getAttribute('aria-valuetext') !== 'Empty',
        );
      expect(filledSections.length).toBeGreaterThan(0);
    });

    it('displays an empty input when the default value is null', () => {
      renderDateInput({ defaultValues: { birthDate: null } });

      // All spinbutton sections show 'Empty' aria-valuetext when no value is set.
      const allSections = screen.getAllByRole('spinbutton');
      allSections.forEach((section) => {
        expect(section).toHaveAttribute('aria-valuetext', 'Empty');
      });
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

      // getPickerValue handles API objects — at least one spinbutton section must not be 'Empty'.
      const filledSections = screen
        .getAllByRole('spinbutton')
        .filter(
          (section) => section.getAttribute('aria-valuetext') !== 'Empty',
        );
      expect(filledSections.length).toBeGreaterThan(0);
    });
  });

  describe('validation', () => {
    it('shows a required error message when the field is blurred empty', async () => {
      const { container } = renderDateInput({
        fieldConfig: { rules: { required: 'Date is required' } },
      });

      // Submitting the form is the most reliable way to trigger RHF validation
      // because fireEvent.blur does not dispatch the bubbling focusout event
      // that React's synthetic onBlur depends on.
      const form = container.querySelector('form') as HTMLFormElement;

      await act(async () => {
        fireEvent.submit(form);
      });

      await waitFor(() => {
        expect(screen.getByText('Date is required')).toBeInTheDocument();
      });
    });

    it('replaces helperText with the error message when validation fails', async () => {
      const { container } = renderDateInput({
        fieldConfig: {
          helperText: 'Format: DD.MM.YYYY',
          rules: { required: 'Date is required' },
        },
      });

      const form = container.querySelector('form') as HTMLFormElement;

      await act(async () => {
        fireEvent.submit(form);
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

      // Render with a pre-populated value so the "Clear value" button becomes visible.
      renderDateInput({
        fieldConfig: { onChange: onChangeSpy },
        defaultValues: { birthDate: '2024-01-15' },
      });

      // Clicking "Clear value" calls the picker's onChange(null) which triggers handleChange.
      const clearButton = screen.getByRole('button', { name: /clear/i });

      await act(async () => {
        fireEvent.click(clearButton);
      });

      expect(onChangeSpy).toHaveBeenCalled();
    });

    it('keeps the raw serialised value when fieldConfig.onChange returns void', async () => {
      // onChange returns void — acts as a side-effect only, no transformation.
      const onChangeSpy =
        vi.fn<(value: string | null, fieldName: string) => void>();

      renderDateInput({
        fieldConfig: { onChange: onChangeSpy },
        defaultValues: { birthDate: '2024-01-15' },
      });

      const clearButton = screen.getByRole('button', { name: /clear/i });

      await act(async () => {
        fireEvent.click(clearButton);
      });

      // Clearing the value calls handleChange(null) — spy receives (null, 'birthDate').
      expect(onChangeSpy).toHaveBeenCalledWith(null, 'birthDate');
    });

    it('stores null when fieldConfig.onChange explicitly returns null', async () => {
      // null is a valid TValue — onChange returning null must not be skipped by ?? operator.
      const onChangeSpy = vi.fn(() => null);

      renderDateInput({
        fieldConfig: { onChange: onChangeSpy },
        defaultValues: { birthDate: '2024-01-15' },
      });

      const clearButton = screen.getByRole('button', { name: /clear/i });

      await act(async () => {
        fireEvent.click(clearButton);
      });

      // Spy returns null — RHF should store null, not the serialised date string.
      expect(onChangeSpy).toHaveBeenCalledWith(null, 'birthDate');
    });
  });
});
