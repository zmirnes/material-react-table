import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { MRT_FormBooleanInput } from '../../../../components/modals/form-inputs/MRT_FormBooleanInput';
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

// Localized option labels used across all tests — mirrors what comes from table localization.
const TRUE_LABEL = 'Da';
const FALSE_LABEL = 'Ne';

// Minimal boolean column definition used across tests.
const DEFAULT_COLUMN_DEF: MRT_ColumnDef<Record<string, unknown>> = {
  accessorKey: 'active',
  header: 'Active',
  type: 'boolean',
};

interface FormWrapperProps {
  children: React.ReactNode;
  // Initial form values used to pre-populate controlled fields.
  defaultValues?: Record<string, unknown>;
  // RHF validation mode — 'onSubmit' is used for error trigger tests.
  mode?: 'onChange' | 'onBlur' | 'onSubmit';
}

// Provides RHF context and MUI theme for rendering MRT_FormBooleanInput in isolation.
const FormWrapper = ({
  children,
  defaultValues = {},
  mode = 'onBlur',
}: FormWrapperProps) => {
  const methods = useForm({ defaultValues, mode });
  return (
    <ThemeProvider theme={DEFAULT_THEME}>
      <FormProvider {...methods}>
        <form aria-label="test-form" onSubmit={methods.handleSubmit(() => {})}>
          {children}
        </form>
      </FormProvider>
    </ThemeProvider>
  );
};

interface RenderOptions {
  name?: string;
  columnDef?: MRT_ColumnDef<Record<string, unknown>>;
  fieldConfig?: MRT_FormFieldConfig<
    Record<string, unknown>,
    boolean | null
  > | null;
  trueLabel?: string;
  falseLabel?: string;
  defaultValues?: Record<string, unknown>;
  mode?: 'onChange' | 'onBlur' | 'onSubmit';
}

// Renders MRT_FormBooleanInput wrapped in FormWrapper so useFormContext() resolves correctly.
const renderBooleanInput = ({
  name = 'active',
  columnDef = DEFAULT_COLUMN_DEF,
  fieldConfig = null,
  trueLabel = TRUE_LABEL,
  falseLabel = FALSE_LABEL,
  defaultValues = { active: null },
  mode = 'onBlur',
}: RenderOptions = {}) =>
  render(
    <FormWrapper defaultValues={defaultValues} mode={mode}>
      <MRT_FormBooleanInput
        name={name}
        columnDef={columnDef}
        fieldConfig={fieldConfig}
        trueLabel={trueLabel}
        falseLabel={falseLabel}
      />
    </FormWrapper>,
  );

describe('MRT_FormBooleanInput', () => {
  describe('label', () => {
    it('uses columnDef.header as label when fieldConfig has no label', () => {
      renderBooleanInput({ fieldConfig: null });

      // MUI Select renders the label text twice: in InputLabel (<label>) and in the legend span.
      // Target only the <label> element to avoid "Found multiple elements" error.
      expect(
        screen.getByText(
          (content, el) => content === 'Active' && el?.tagName === 'LABEL',
        ),
      ).toBeInTheDocument();
    });

    it('uses fieldConfig.label override when provided', () => {
      renderBooleanInput({ fieldConfig: { label: 'Aktivan' } });

      expect(
        screen.getByText(
          (content, el) => content === 'Aktivan' && el?.tagName === 'LABEL',
        ),
      ).toBeInTheDocument();
      expect(
        screen.queryByText(
          (content, el) => content === 'Active' && el?.tagName === 'LABEL',
        ),
      ).not.toBeInTheDocument();
    });

    it('falls back to field name when columnDef.header is not a string', () => {
      renderBooleanInput({
        name: 'active',
        columnDef: {
          ...DEFAULT_COLUMN_DEF,
          header: (() => null) as unknown as string,
        },
        fieldConfig: null,
      });

      expect(
        screen.getByText(
          (content, el) => content === 'active' && el?.tagName === 'LABEL',
        ),
      ).toBeInTheDocument();
    });
  });

  describe('rendering', () => {
    it('renders without crashing when fieldConfig is null', () => {
      renderBooleanInput({ fieldConfig: null });

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('renders the true and false options inside the open dropdown', async () => {
      renderBooleanInput();

      await act(async () => {
        fireEvent.mouseDown(screen.getByRole('combobox'));
      });

      expect(screen.getByText(TRUE_LABEL)).toBeInTheDocument();
      expect(screen.getByText(FALSE_LABEL)).toBeInTheDocument();
    });

    it('renders an empty deselect option inside the open dropdown', async () => {
      renderBooleanInput();

      await act(async () => {
        fireEvent.mouseDown(screen.getByRole('combobox'));
      });

      // The empty MenuItem renders a non-breaking space inside <em> — the option value is ''.
      const emptyOption = screen
        .getAllByRole('option')
        .find((opt) => opt.getAttribute('data-value') === '');
      expect(emptyOption).toBeInTheDocument();
    });
  });

  describe('pre-populated value (edit mode)', () => {
    it('displays trueLabel in the trigger when the default value is true', () => {
      renderBooleanInput({ defaultValues: { active: true } });

      // renderValue resolves true → trueLabel inside the collapsed trigger.
      expect(screen.getByText(TRUE_LABEL)).toBeInTheDocument();
    });

    it('displays falseLabel in the trigger when the default value is false', () => {
      renderBooleanInput({ defaultValues: { active: false } });

      expect(screen.getByText(FALSE_LABEL)).toBeInTheDocument();
    });

    it('shows nothing in the trigger when the default value is null', () => {
      renderBooleanInput({ defaultValues: { active: null } });

      // renderValue returns undefined for null — neither label should appear.
      expect(screen.queryByText(TRUE_LABEL)).not.toBeInTheDocument();
      expect(screen.queryByText(FALSE_LABEL)).not.toBeInTheDocument();
    });
  });

  describe('selection', () => {
    it('stores true and displays trueLabel after selecting the true option', async () => {
      renderBooleanInput();

      await act(async () => {
        fireEvent.mouseDown(screen.getByRole('combobox'));
      });

      await act(async () => {
        fireEvent.click(screen.getByText(TRUE_LABEL));
      });

      // Wait for the dropdown to close before asserting on trigger content.
      await waitFor(() => {
        expect(screen.queryByRole('option')).not.toBeInTheDocument();
      });

      expect(screen.getByRole('combobox')).toHaveTextContent(TRUE_LABEL);
    });

    it('stores false and displays falseLabel after selecting the false option', async () => {
      renderBooleanInput();

      await act(async () => {
        fireEvent.mouseDown(screen.getByRole('combobox'));
      });

      await act(async () => {
        fireEvent.click(screen.getByText(FALSE_LABEL));
      });

      // Wait for the dropdown to close before asserting on trigger content.
      await waitFor(() => {
        expect(screen.queryByRole('option')).not.toBeInTheDocument();
      });

      expect(screen.getByRole('combobox')).toHaveTextContent(FALSE_LABEL);
    });

    it('clears the selection when the empty option is picked', async () => {
      renderBooleanInput({ defaultValues: { active: true } });

      await act(async () => {
        fireEvent.mouseDown(screen.getByRole('combobox'));
      });

      // Click the empty MenuItem (data-value="")
      const emptyOption = screen
        .getAllByRole('option')
        .find((opt) => opt.getAttribute('data-value') === '');

      await act(async () => {
        fireEvent.click(emptyOption!);
      });

      // Wait for the dropdown to close before asserting on trigger content.
      // While the menu is open, option <li> elements are still in the DOM.
      await waitFor(() => {
        expect(screen.queryByRole('option')).not.toBeInTheDocument();
      });

      // After the menu closes, the trigger (combobox) should show nothing —
      // renderValue returns undefined for null, so no label is rendered.
      const combobox = screen.getByRole('combobox');
      expect(combobox).not.toHaveTextContent(TRUE_LABEL);
      expect(combobox).not.toHaveTextContent(FALSE_LABEL);
    });

    it('calls fieldConfig.onChange with the boolean value and field name', async () => {
      const onChangeSpy =
        vi.fn<(value: boolean | null, name: string) => void>();

      renderBooleanInput({
        name: 'active',
        fieldConfig: { onChange: onChangeSpy },
      });

      await act(async () => {
        fireEvent.mouseDown(screen.getByRole('combobox'));
      });

      await act(async () => {
        fireEvent.click(screen.getByText(TRUE_LABEL));
      });

      expect(onChangeSpy).toHaveBeenCalledWith(true, 'active');
    });

    it('applies the transform returned by fieldConfig.onChange', async () => {
      // Always force the stored value to false regardless of selection.
      renderBooleanInput({
        fieldConfig: { onChange: () => false },
      });

      await act(async () => {
        fireEvent.mouseDown(screen.getByRole('combobox'));
      });

      await act(async () => {
        fireEvent.click(screen.getByText(TRUE_LABEL));
      });

      // Transform overrides true → false, so falseLabel should appear in the trigger.
      await waitFor(() => {
        expect(screen.getByText(FALSE_LABEL)).toBeInTheDocument();
      });
    });
  });

  describe('fieldConfig props', () => {
    it('renders a disabled select when fieldConfig.disabled is true', () => {
      renderBooleanInput({ fieldConfig: { disabled: true } });

      // MUI marks the combobox as aria-disabled when the FormControl is disabled.
      expect(screen.getByRole('combobox')).toHaveAttribute(
        'aria-disabled',
        'true',
      );
    });

    it('renders helperText when there is no validation error', () => {
      renderBooleanInput({ fieldConfig: { helperText: 'Odaberi vrijednost' } });

      expect(screen.getByText('Odaberi vrijednost')).toBeInTheDocument();
    });

    it('applies small size by default when fieldConfig.size is not specified', () => {
      renderBooleanInput({ fieldConfig: null });

      const selectRoot = screen
        .getByRole('combobox')
        .closest('.MuiInputBase-root');
      expect(selectRoot).toHaveClass('MuiInputBase-sizeSmall');
    });

    it('applies medium size when fieldConfig.size is medium', () => {
      renderBooleanInput({ fieldConfig: { size: 'medium' } });

      const selectRoot = screen
        .getByRole('combobox')
        .closest('.MuiInputBase-root');
      expect(selectRoot).not.toHaveClass('MuiInputBase-sizeSmall');
    });
  });

  describe('validation', () => {
    it('shows a required error message when the form is submitted with null value', async () => {
      renderBooleanInput({
        fieldConfig: { rules: { required: 'Polje je obavezno' } },
        mode: 'onSubmit',
        defaultValues: { active: null },
      });

      await act(async () => {
        fireEvent.submit(screen.getByRole('form'));
      });

      await waitFor(() => {
        expect(screen.getByText('Polje je obavezno')).toBeInTheDocument();
      });
    });

    it('replaces helperText with the error message when validation fails', async () => {
      renderBooleanInput({
        fieldConfig: {
          helperText: 'Odaberi vrijednost',
          rules: { required: 'Polje je obavezno' },
        },
        mode: 'onSubmit',
        defaultValues: { active: null },
      });

      await act(async () => {
        fireEvent.submit(screen.getByRole('form'));
      });

      await waitFor(() => {
        expect(screen.getByText('Polje je obavezno')).toBeInTheDocument();
        expect(
          screen.queryByText('Odaberi vrijednost'),
        ).not.toBeInTheDocument();
      });
    });
  });
});
