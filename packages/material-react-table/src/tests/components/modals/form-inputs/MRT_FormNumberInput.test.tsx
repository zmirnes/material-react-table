import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { MRT_FormNumberInput } from '../../../../components/modals/form-inputs/MRT_FormNumberInput';
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

// Minimal column definition used across tests.
const DEFAULT_COLUMN_DEF: MRT_ColumnDef<Record<string, unknown>> = {
  accessorKey: 'quantity',
  header: 'Quantity',
  type: 'number',
};

interface FormWrapperProps {
  children: React.ReactNode;
  // Initial form values used to pre-populate controlled fields.
  defaultValues?: Record<string, unknown>;
  // RHF validation mode — 'onBlur' is used for error trigger tests.
  mode?: 'onChange' | 'onBlur' | 'onSubmit';
}

// Provides RHF context and MUI theme for rendering MRT_FormNumberInput in isolation.
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
    number | null
  > | null;
  defaultValues?: Record<string, unknown>;
  mode?: 'onChange' | 'onBlur' | 'onSubmit';
}

// Renders MRT_FormNumberInput wrapped in FormWrapper so useFormContext() resolves correctly.
const renderNumberInput = ({
  name = 'quantity',
  columnDef = DEFAULT_COLUMN_DEF,
  fieldConfig = null,
  defaultValues = { quantity: null },
  mode = 'onBlur',
}: RenderOptions = {}) =>
  render(
    <FormWrapper defaultValues={defaultValues} mode={mode}>
      <MRT_FormNumberInput
        name={name}
        columnDef={columnDef}
        fieldConfig={fieldConfig}
      />
    </FormWrapper>,
  );

describe('MRT_FormNumberInput', () => {
  describe('label', () => {
    it('uses columnDef.header as label when fieldConfig has no label', () => {
      renderNumberInput({ fieldConfig: null });

      expect(screen.getByLabelText('Quantity')).toBeInTheDocument();
    });

    it('uses fieldConfig.label override when provided', () => {
      renderNumberInput({ fieldConfig: { label: 'Item Count' } });

      // Override label is used; original column header is not rendered as a label.
      expect(screen.getByLabelText('Item Count')).toBeInTheDocument();
      expect(screen.queryByLabelText('Quantity')).not.toBeInTheDocument();
    });
  });

  describe('basic field props', () => {
    it('renders without crashing when fieldConfig is null', () => {
      renderNumberInput({ fieldConfig: null });

      expect(screen.getByLabelText('Quantity')).toBeInTheDocument();
    });

    it('renders an input with type number', () => {
      renderNumberInput({ fieldConfig: null });

      expect(screen.getByLabelText('Quantity')).toHaveAttribute(
        'type',
        'number',
      );
    });

    it('renders a disabled input when fieldConfig.disabled is true', () => {
      renderNumberInput({ fieldConfig: { disabled: true } });

      expect(screen.getByLabelText('Quantity')).toBeDisabled();
    });

    it('renders placeholder text when fieldConfig.placeholder is provided', () => {
      renderNumberInput({ fieldConfig: { placeholder: 'Enter quantity' } });

      expect(screen.getByPlaceholderText('Enter quantity')).toBeInTheDocument();
    });

    it('renders helperText from fieldConfig when there is no validation error', () => {
      renderNumberInput({
        fieldConfig: { helperText: 'Must be a positive number' },
      });

      expect(screen.getByText('Must be a positive number')).toBeInTheDocument();
    });

    it('applies small size by default when fieldConfig.size is not specified', () => {
      renderNumberInput({ fieldConfig: null });

      // MUI v6 applies size="small" as MuiInputBase-sizeSmall on the InputBase wrapper.
      const inputWrapper = screen
        .getByLabelText('Quantity')
        .closest('.MuiInputBase-root');
      expect(inputWrapper).toHaveClass('MuiInputBase-sizeSmall');
    });

    it('applies medium size when fieldConfig.size is medium', () => {
      renderNumberInput({ fieldConfig: { size: 'medium' } });

      // Medium size does not carry the sizeSmall class.
      const inputWrapper = screen
        .getByLabelText('Quantity')
        .closest('.MuiInputBase-root');
      expect(inputWrapper).not.toHaveClass('MuiInputBase-sizeSmall');
    });
  });

  describe('pre-populated value (edit mode)', () => {
    it('displays the default numeric value passed via RHF defaultValues', () => {
      renderNumberInput({ defaultValues: { quantity: 42 } });

      expect(screen.getByDisplayValue('42')).toBeInTheDocument();
    });

    it('displays an empty input when the default value is null', () => {
      renderNumberInput({ defaultValues: { quantity: null } });

      expect(screen.getByLabelText('Quantity')).toHaveValue(null);
    });
  });

  describe('validation', () => {
    it('shows a required error message when the field is blurred empty', async () => {
      renderNumberInput({
        fieldConfig: { rules: { required: 'Quantity is required' } },
        mode: 'onBlur',
      });

      const input = screen.getByLabelText('Quantity');

      await act(async () => {
        fireEvent.focus(input);
        fireEvent.blur(input);
      });

      await waitFor(() => {
        expect(screen.getByText('Quantity is required')).toBeInTheDocument();
      });
    });

    it('replaces helperText with the error message when validation fails', async () => {
      renderNumberInput({
        fieldConfig: {
          helperText: 'Must be a positive number',
          rules: { required: 'Quantity is required' },
        },
        mode: 'onBlur',
      });

      const input = screen.getByLabelText('Quantity');

      await act(async () => {
        fireEvent.focus(input);
        fireEvent.blur(input);
      });

      await waitFor(() => {
        // Error message replaces the static helper text while validation fails.
        expect(screen.getByText('Quantity is required')).toBeInTheDocument();
        expect(
          screen.queryByText('Must be a positive number'),
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('onChange', () => {
    it('stores the typed number value into RHF state', async () => {
      renderNumberInput({ fieldConfig: null });

      await act(async () => {
        fireEvent.change(screen.getByLabelText('Quantity'), {
          target: { value: '10' },
        });
      });

      expect(screen.getByDisplayValue('10')).toBeInTheDocument();
    });

    it('stores null when the field is cleared', async () => {
      renderNumberInput({ defaultValues: { quantity: 5 } });

      await act(async () => {
        fireEvent.change(screen.getByLabelText('Quantity'), {
          target: { value: '' },
        });
      });

      // Null is displayed as an empty input.
      expect(screen.getByLabelText('Quantity')).toHaveValue(null);
    });

    it('applies the transform returned by fieldConfig.onChange', async () => {
      renderNumberInput({
        // Double the entered value as transformation.
        fieldConfig: {
          onChange: (value) => (value !== null ? value * 2 : null),
        },
      });

      await act(async () => {
        fireEvent.change(screen.getByLabelText('Quantity'), {
          target: { value: '5' },
        });
      });

      // The controlled input reflects the transformed (doubled) value stored in RHF state.
      expect(screen.getByDisplayValue('10')).toBeInTheDocument();
    });

    it('keeps the raw value when fieldConfig.onChange returns void', async () => {
      // onChange returns void — acts as a side-effect only, no transformation.
      const onChangeSpy =
        vi.fn<(value: number | null, fieldName: string) => void>();

      renderNumberInput({ fieldConfig: { onChange: onChangeSpy } });

      await act(async () => {
        fireEvent.change(screen.getByLabelText('Quantity'), {
          target: { value: '7' },
        });
      });

      expect(screen.getByDisplayValue('7')).toBeInTheDocument();
      expect(onChangeSpy).toHaveBeenCalledWith(7, 'quantity');
    });

    it('stores null when fieldConfig.onChange explicitly returns null', async () => {
      // null is a valid TValue — onChange returning null must not be skipped by the ?? operator.
      renderNumberInput({ fieldConfig: { onChange: () => null } });

      await act(async () => {
        fireEvent.change(screen.getByLabelText('Quantity'), {
          target: { value: '99' },
        });
      });

      // Null stored — input displays as empty, not as 99.
      expect(screen.getByLabelText('Quantity')).toHaveValue(null);
    });
  });
});
