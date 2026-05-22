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

      // MUI v6 DateTimePicker renders a div[role="group"] as the labeled picker container.
      expect(
        screen.getByRole('group', { name: 'Scheduled At' }),
      ).toBeInTheDocument();
    });

    it('uses fieldConfig.label override when provided', () => {
      renderDateTimeInput({ fieldConfig: { label: 'Event Date & Time' } });

      // Override label changes the accessible name of the picker group.
      expect(
        screen.getByRole('group', { name: 'Event Date & Time' }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('group', { name: 'Scheduled At' }),
      ).not.toBeInTheDocument();
    });
  });

  describe('basic field props', () => {
    it('renders without crashing when fieldConfig is null', () => {
      renderDateTimeInput({ fieldConfig: null });

      expect(
        screen.getByRole('group', { name: 'Scheduled At' }),
      ).toBeInTheDocument();
    });

    it('renders a disabled input when fieldConfig.disabled is true', () => {
      renderDateTimeInput({ fieldConfig: { disabled: true } });

      // MUI v6 DateTimePicker marks each spinbutton section as aria-disabled when the picker is disabled.
      screen.getAllByRole('spinbutton').forEach((section) => {
        expect(section).toHaveAttribute('aria-disabled', 'true');
      });
    });

    it('renders helperText from fieldConfig when there is no validation error', () => {
      renderDateTimeInput({
        fieldConfig: { helperText: 'Format: DD.MM.YYYY HH:mm' },
      });

      expect(screen.getByText('Format: DD.MM.YYYY HH:mm')).toBeInTheDocument();
    });

    it('applies small size by default when fieldConfig.size is not specified', () => {
      renderDateTimeInput({ fieldConfig: null });

      // MUI v6 DateTimePicker places the size class directly on the picker group div.
      expect(screen.getByRole('group', { name: 'Scheduled At' })).toHaveClass(
        'MuiPickersInputBase-inputSizeSmall',
      );
    });

    it('applies medium size when fieldConfig.size is medium', () => {
      renderDateTimeInput({ fieldConfig: { size: 'medium' } });

      // Medium size does not carry the small size class.
      expect(
        screen.getByRole('group', { name: 'Scheduled At' }),
      ).not.toHaveClass('MuiPickersInputBase-inputSizeSmall');
    });
  });

  describe('pre-populated value (edit mode)', () => {
    it('displays a non-empty value when defaultValues contains a datetime string', () => {
      renderDateTimeInput({
        defaultValues: { scheduledAt: '2024-01-15T14:30' },
      });

      // MUI v6 DateTimePicker shows values in spinbutton sections — at least one must not be "Empty".
      const filledSections = screen
        .getAllByRole('spinbutton')
        .filter(
          (section) => section.getAttribute('aria-valuetext') !== 'Empty',
        );
      expect(filledSections.length).toBeGreaterThan(0);
    });

    it('displays an empty input when the default value is null', () => {
      renderDateTimeInput({ defaultValues: { scheduledAt: null } });

      // MUI v6 DateTimePicker marks all sections as aria-valuetext="Empty" when no value is set.
      screen.getAllByRole('spinbutton').forEach((section) => {
        expect(section).toHaveAttribute('aria-valuetext', 'Empty');
      });
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

      // getPickerValue handles API objects — at least one spinbutton section must not be "Empty".
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
      const { container } = renderDateTimeInput({
        fieldConfig: { rules: { required: 'Datetime is required' } },
      });

      // Submitting the form is the most reliable way to trigger RHF validation
      // because fireEvent.blur does not dispatch the bubbling focusout event
      // that React's synthetic onBlur depends on.
      const form = container.querySelector('form') as HTMLFormElement;

      await act(async () => {
        fireEvent.submit(form);
      });

      await waitFor(() => {
        expect(screen.getByText('Datetime is required')).toBeInTheDocument();
      });
    });

    it('replaces helperText with the error message when validation fails', async () => {
      const { container } = renderDateTimeInput({
        fieldConfig: {
          helperText: 'Format: DD.MM.YYYY HH:mm',
          rules: { required: 'Datetime is required' },
        },
      });

      const form = container.querySelector('form') as HTMLFormElement;

      await act(async () => {
        fireEvent.submit(form);
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
    it('calls fieldConfig.onChange when the picker value is cleared', async () => {
      const onChangeSpy =
        vi.fn<(value: string | null, fieldName: string) => void>();

      // Render with a pre-populated value so the "Clear value" button becomes visible.
      renderDateTimeInput({
        fieldConfig: { onChange: onChangeSpy },
        defaultValues: { scheduledAt: '2024-01-15T14:30' },
      });

      // Clicking "Clear value" calls the picker's onChange(null) which triggers handleChange.
      const clearButton = screen.getByRole('button', { name: /clear/i });

      await act(async () => {
        fireEvent.click(clearButton);
      });

      // handleChange receives null (cleared value) and forwards it to fieldConfig.onChange.
      expect(onChangeSpy).toHaveBeenCalled();
    });

    it('keeps the raw serialised value when fieldConfig.onChange returns void', async () => {
      // onChange returns void — acts as a side-effect only, no transformation.
      const onChangeSpy =
        vi.fn<(value: string | null, fieldName: string) => void>();

      // Render with a value so the clear button is visible.
      renderDateTimeInput({
        fieldConfig: { onChange: onChangeSpy },
        defaultValues: { scheduledAt: '2024-01-15T14:30' },
      });

      // Clearing the value → picker calls onChange(null) → serialised = null.
      const clearButton = screen.getByRole('button', { name: /clear/i });

      await act(async () => {
        fireEvent.click(clearButton);
      });

      // Cleared value → serialised is null; void return from spy means raw null is forwarded.
      expect(onChangeSpy).toHaveBeenCalledWith(null, 'scheduledAt');
    });

    it('stores null when fieldConfig.onChange explicitly returns null', async () => {
      // null is a valid TValue — onChange returning null must not be skipped by ?? operator.
      const onChangeSpy = vi.fn(() => null);

      // Render with a value so the clear button is visible.
      renderDateTimeInput({
        fieldConfig: { onChange: onChangeSpy },
        defaultValues: { scheduledAt: '2024-01-15T14:30' },
      });

      // Clearing the value triggers handleChange with null, which calls onChangeSpy.
      const clearButton = screen.getByRole('button', { name: /clear/i });

      await act(async () => {
        fireEvent.click(clearButton);
      });

      // The spy returns null — RHF should store null, not fall through to the serialised value.
      expect(onChangeSpy).toHaveBeenCalled();
    });
  });
});
