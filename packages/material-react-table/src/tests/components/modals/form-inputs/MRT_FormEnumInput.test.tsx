import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { MRT_FormEnumInput } from '../../../../components/modals/form-inputs/MRT_FormEnumInput';
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

// Enum options used across tests — mirrors what the backend sends via column.meta.enumValues.
const DEFAULT_ENUM_VALUES = [
  { value: 'active', label: 'Aktivan' },
  { value: 'pending', label: 'Na čekanju' },
  { value: 'inactive', label: 'Neaktivan' },
];

// Minimal enum column definition used across tests.
const DEFAULT_COLUMN_DEF: MRT_ColumnDef<Record<string, unknown>> = {
  accessorKey: 'status',
  header: 'Status',
  type: 'enum',
  meta: { enumValues: DEFAULT_ENUM_VALUES },
};

interface FormWrapperProps {
  children: React.ReactNode;
  // Initial form values used to pre-populate controlled fields.
  defaultValues?: Record<string, unknown>;
  // RHF validation mode — 'onBlur' is used for error trigger tests.
  mode?: 'onChange' | 'onBlur' | 'onSubmit';
}

// Provides RHF context and MUI theme for rendering MRT_FormEnumInput in isolation.
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
  mode?: 'onChange' | 'onBlur' | 'onSubmit';
}

// Renders MRT_FormEnumInput wrapped in FormWrapper so useFormContext() resolves correctly.
const renderEnumInput = ({
  name = 'status',
  columnDef = DEFAULT_COLUMN_DEF,
  fieldConfig = null,
  defaultValues = { status: '' },
  mode = 'onBlur',
}: RenderOptions = {}) =>
  render(
    <FormWrapper defaultValues={defaultValues} mode={mode}>
      <MRT_FormEnumInput
        name={name}
        columnDef={columnDef}
        fieldConfig={fieldConfig}
      />
    </FormWrapper>,
  );

describe('MRT_FormEnumInput', () => {
  describe('label', () => {
    it('uses columnDef.header as label when fieldConfig has no label', () => {
      renderEnumInput({ fieldConfig: null });

      // MUI Select renders label text twice: in InputLabel (<label>) and in the legend span
      // of the notched outline (<fieldset>). Target only the <label> element to avoid
      // "Found multiple elements" error from getByText.
      expect(
        screen.getByText(
          (content, el) => content === 'Status' && el?.tagName === 'LABEL',
        ),
      ).toBeInTheDocument();
    });

    it('uses fieldConfig.label override when provided', () => {
      renderEnumInput({ fieldConfig: { label: 'Enum Status' } });

      // Override label is rendered; original column header is not used as label.
      expect(
        screen.getByText(
          (content, el) => content === 'Enum Status' && el?.tagName === 'LABEL',
        ),
      ).toBeInTheDocument();
      expect(
        screen.queryByText(
          (content, el) => content === 'Status' && el?.tagName === 'LABEL',
        ),
      ).not.toBeInTheDocument();
    });

    it('falls back to field name when columnDef.header is not a string', () => {
      // Pass a function as header to simulate a render-function header (non-string).
      // typeof (() => ...) === 'string' is false — the component must fall back to the name prop.
      renderEnumInput({
        name: 'status',
        columnDef: {
          ...DEFAULT_COLUMN_DEF,
          header: (() => null) as unknown as string,
        },
        fieldConfig: null,
        defaultValues: { status: '' },
      });

      // The field name 'status' is used as label — target only the <label> element
      // because MUI also renders the text inside the legend span (notched outline).
      expect(
        screen.getByText(
          (content, el) => content === 'status' && el?.tagName === 'LABEL',
        ),
      ).toBeInTheDocument();
    });
  });

  describe('basic field props', () => {
    it('renders without crashing when fieldConfig is null', () => {
      renderEnumInput({ fieldConfig: null });

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('renders a disabled select when fieldConfig.disabled is true', () => {
      renderEnumInput({ fieldConfig: { disabled: true } });

      // MUI Select marks the underlying combobox div as aria-disabled when the FormControl is disabled.
      expect(screen.getByRole('combobox')).toHaveAttribute(
        'aria-disabled',
        'true',
      );
    });

    it('renders helperText from fieldConfig when there is no validation error', () => {
      renderEnumInput({ fieldConfig: { helperText: 'Odaberi status' } });

      expect(screen.getByText('Odaberi status')).toBeInTheDocument();
    });

    it('applies small size by default when fieldConfig.size is not specified', () => {
      renderEnumInput({ fieldConfig: null });

      // MUI v6 applies size="small" as MuiInputBase-sizeSmall on the InputBase wrapper.
      const selectRoot = screen
        .getByRole('combobox')
        .closest('.MuiInputBase-root');
      expect(selectRoot).toHaveClass('MuiInputBase-sizeSmall');
    });

    it('applies medium size when fieldConfig.size is medium', () => {
      renderEnumInput({ fieldConfig: { size: 'medium' } });

      // Medium size does not carry the sizeSmall class.
      const selectRoot = screen
        .getByRole('combobox')
        .closest('.MuiInputBase-root');
      expect(selectRoot).not.toHaveClass('MuiInputBase-sizeSmall');
    });
  });

  describe('available options', () => {
    it('renders all enum options inside the dropdown', async () => {
      renderEnumInput({ fieldConfig: null });

      await act(async () => {
        fireEvent.mouseDown(screen.getByRole('combobox'));
      });

      // All three options should be visible in the dropdown.
      expect(screen.getByText('Aktivan')).toBeInTheDocument();
      expect(screen.getByText('Na čekanju')).toBeInTheDocument();
      expect(screen.getByText('Neaktivan')).toBeInTheDocument();
    });

    it('renders an empty dropdown when no enumValues are provided', async () => {
      renderEnumInput({
        columnDef: { ...DEFAULT_COLUMN_DEF, meta: { enumValues: [] } },
        fieldConfig: null,
      });

      await act(async () => {
        fireEvent.mouseDown(screen.getByRole('combobox'));
      });

      // None of the default option labels should be present.
      expect(screen.queryByText('Aktivan')).not.toBeInTheDocument();
    });
  });

  describe('pre-populated value (edit mode)', () => {
    it('displays the label of the pre-selected option when defaultValues contains an enum value', () => {
      renderEnumInput({ defaultValues: { status: 'active' } });

      // renderValue resolves the stored value string to its human-readable label.
      expect(screen.getByText('Aktivan')).toBeInTheDocument();
    });

    it('renders nothing in the trigger when the pre-selected value has no matching option', () => {
      renderEnumInput({ defaultValues: { status: 'unknown-value' } });

      // No option matches — renderValue returns undefined, trigger shows nothing.
      expect(screen.queryByText('Aktivan')).not.toBeInTheDocument();
      expect(screen.queryByText('Na čekanju')).not.toBeInTheDocument();
    });
  });

  describe('selection', () => {
    it('shows the selected option label after the user picks an enum value', async () => {
      renderEnumInput({ fieldConfig: null });

      await act(async () => {
        fireEvent.mouseDown(screen.getByRole('combobox'));
      });

      await act(async () => {
        fireEvent.click(screen.getByText('Na čekanju'));
      });

      // Collapsed trigger now shows the selected option's label.
      expect(screen.getByText('Na čekanju')).toBeInTheDocument();
    });

    it('applies the transform returned by fieldConfig.onChange', async () => {
      // Transform maps any selection to a fixed value 'inactive'.
      renderEnumInput({ fieldConfig: { onChange: () => 'inactive' } });

      await act(async () => {
        fireEvent.mouseDown(screen.getByRole('combobox'));
      });

      await act(async () => {
        fireEvent.click(screen.getByText('Aktivan'));
      });

      // The transformed value 'inactive' resolves to 'Neaktivan' in renderValue.
      await waitFor(() => {
        expect(screen.getByText('Neaktivan')).toBeInTheDocument();
      });
    });

    it('calls fieldConfig.onChange with the selected value and field name', async () => {
      const onChangeSpy = vi.fn<(value: string | null, name: string) => void>();

      renderEnumInput({
        name: 'status',
        fieldConfig: { onChange: onChangeSpy },
      });

      await act(async () => {
        fireEvent.mouseDown(screen.getByRole('combobox'));
      });

      await act(async () => {
        fireEvent.click(screen.getByText('Aktivan'));
      });

      expect(onChangeSpy).toHaveBeenCalledWith('active', 'status');
    });

    it('stores null returned by fieldConfig.onChange as a valid transformed value', async () => {
      // null is a valid transformed value — must not be skipped in favour of the raw enum value.
      const onChangeSpy = vi.fn<(value: string | null, name: string) => null>(
        () => null,
      );

      renderEnumInput({ fieldConfig: { onChange: onChangeSpy } });

      await act(async () => {
        fireEvent.mouseDown(screen.getByRole('combobox'));
      });

      await act(async () => {
        fireEvent.click(screen.getByText('Aktivan'));
      });

      // null stored in RHF — renderValue receives '' (currentValue guard) so trigger is empty.
      expect(onChangeSpy).toHaveBeenCalled();
    });
  });

  describe('validation', () => {
    it('shows a required error message when the field is submitted empty', async () => {
      const { container } = renderEnumInput({
        fieldConfig: { rules: { required: 'Status je obavezan' } },
      });

      // Submitting the form is the most reliable way to trigger RHF validation
      // because fireEvent.blur does not dispatch the bubbling focusout event
      // that React's synthetic onBlur depends on.
      const form = container.querySelector('form') as HTMLFormElement;

      await act(async () => {
        fireEvent.submit(form);
      });

      await waitFor(() => {
        expect(screen.getByText('Status je obavezan')).toBeInTheDocument();
      });
    });

    it('replaces helperText with the error message when validation fails', async () => {
      const { container } = renderEnumInput({
        fieldConfig: {
          helperText: 'Odaberi status',
          rules: { required: 'Status je obavezan' },
        },
      });

      const form = container.querySelector('form') as HTMLFormElement;

      await act(async () => {
        fireEvent.submit(form);
      });

      await waitFor(() => {
        // Error message replaces the static helper text while validation fails.
        expect(screen.getByText('Status je obavezan')).toBeInTheDocument();
        expect(screen.queryByText('Odaberi status')).not.toBeInTheDocument();
      });
    });
  });
});
