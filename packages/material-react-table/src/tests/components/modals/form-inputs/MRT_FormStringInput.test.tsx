import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { MRT_FormStringInput } from '../../../../components/modals/form-inputs/MRT_FormStringInput';
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
  accessorKey: 'name',
  header: 'Name',
  type: 'string',
};

interface FormWrapperProps {
  children: React.ReactNode;
  // Initial form values used to pre-populate controlled fields.
  defaultValues?: Record<string, unknown>;
  // RHF validation mode — 'onBlur' is used for error trigger tests.
  mode?: 'onChange' | 'onBlur' | 'onSubmit';
}

// Provides RHF context and MUI theme for rendering MRT_FormStringInput in isolation.
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
  fieldConfig?: MRT_FormFieldConfig<Record<string, unknown>, string> | null;
  defaultValues?: Record<string, unknown>;
  mode?: 'onChange' | 'onBlur' | 'onSubmit';
}

// Renders MRT_FormStringInput wrapped in FormWrapper so useFormContext() resolves correctly.
const renderStringInput = ({
  name = 'name',
  columnDef = DEFAULT_COLUMN_DEF,
  fieldConfig = null,
  defaultValues = { name: '' },
  mode = 'onBlur',
}: RenderOptions = {}) =>
  render(
    <FormWrapper defaultValues={defaultValues} mode={mode}>
      <MRT_FormStringInput
        name={name}
        columnDef={columnDef}
        fieldConfig={fieldConfig}
      />
    </FormWrapper>,
  );

describe('MRT_FormStringInput', () => {
  describe('label', () => {
    it('uses columnDef.header as label when fieldConfig has no label', () => {
      renderStringInput({ fieldConfig: null });

      expect(screen.getByLabelText('Name')).toBeInTheDocument();
    });

    it('uses fieldConfig.label override when provided', () => {
      renderStringInput({ fieldConfig: { label: 'Full Name' } });

      // Override label is used; original column header is not rendered as a label.
      expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
      expect(screen.queryByLabelText('Name')).not.toBeInTheDocument();
    });
  });

  describe('basic field props', () => {
    it('renders without crashing when fieldConfig is null', () => {
      renderStringInput({ fieldConfig: null });

      expect(screen.getByLabelText('Name')).toBeInTheDocument();
    });

    it('renders a disabled input when fieldConfig.disabled is true', () => {
      renderStringInput({ fieldConfig: { disabled: true } });

      expect(screen.getByLabelText('Name')).toBeDisabled();
    });

    it('renders placeholder text when fieldConfig.placeholder is provided', () => {
      renderStringInput({ fieldConfig: { placeholder: 'Enter your name' } });

      expect(
        screen.getByPlaceholderText('Enter your name'),
      ).toBeInTheDocument();
    });

    it('renders helperText from fieldConfig when there is no validation error', () => {
      renderStringInput({
        fieldConfig: { helperText: 'Your full legal name' },
      });

      expect(screen.getByText('Your full legal name')).toBeInTheDocument();
    });

    it('applies small size by default when fieldConfig.size is not specified', () => {
      renderStringInput({ fieldConfig: null });

      // MUI v6 applies size="small" as MuiInputBase-sizeSmall on the InputBase wrapper.
      const inputWrapper = screen
        .getByLabelText('Name')
        .closest('.MuiInputBase-root');
      expect(inputWrapper).toHaveClass('MuiInputBase-sizeSmall');
    });

    it('applies medium size when fieldConfig.size is medium', () => {
      renderStringInput({ fieldConfig: { size: 'medium' } });

      // Medium size does not carry the sizeSmall class.
      const inputWrapper = screen
        .getByLabelText('Name')
        .closest('.MuiInputBase-root');
      expect(inputWrapper).not.toHaveClass('MuiInputBase-sizeSmall');
    });
  });

  describe('pre-populated value (edit mode)', () => {
    it('displays the default value passed via RHF defaultValues', () => {
      renderStringInput({ defaultValues: { name: 'Alice' } });

      expect(screen.getByDisplayValue('Alice')).toBeInTheDocument();
    });
  });

  describe('validation', () => {
    it('shows a required error message when the field is blurred empty', async () => {
      renderStringInput({
        fieldConfig: { rules: { required: 'Name is required' } },
        mode: 'onBlur',
      });

      const input = screen.getByLabelText('Name');

      await act(async () => {
        fireEvent.focus(input);
        fireEvent.blur(input);
      });

      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument();
      });
    });

    it('replaces helperText with the error message when validation fails', async () => {
      renderStringInput({
        fieldConfig: {
          helperText: 'Your full legal name',
          rules: { required: 'Name is required' },
        },
        mode: 'onBlur',
      });

      const input = screen.getByLabelText('Name');

      await act(async () => {
        fireEvent.focus(input);
        fireEvent.blur(input);
      });

      await waitFor(() => {
        // Error message replaces the static helper text while validation fails.
        expect(screen.getByText('Name is required')).toBeInTheDocument();
        expect(
          screen.queryByText('Your full legal name'),
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('onChange', () => {
    it('writes the typed value into RHF state', async () => {
      renderStringInput({ fieldConfig: null });

      await act(async () => {
        fireEvent.change(screen.getByLabelText('Name'), {
          target: { value: 'hello' },
        });
      });

      expect(screen.getByDisplayValue('hello')).toBeInTheDocument();
    });

    it('applies the transform returned by fieldConfig.onChange', async () => {
      renderStringInput({
        fieldConfig: { onChange: (value) => value.toUpperCase() },
      });

      await act(async () => {
        fireEvent.change(screen.getByLabelText('Name'), {
          target: { value: 'abc' },
        });
      });

      // The controlled input reflects the transformed (uppercased) value stored in RHF state.
      expect(screen.getByDisplayValue('ABC')).toBeInTheDocument();
    });

    it('keeps the raw value when fieldConfig.onChange returns void', async () => {
      // onChange returns void — acts as a side-effect only, no transformation.
      const onChangeSpy = vi.fn<(value: string, fieldName: string) => void>();

      renderStringInput({ fieldConfig: { onChange: onChangeSpy } });

      await act(async () => {
        fireEvent.change(screen.getByLabelText('Name'), {
          target: { value: 'hello' },
        });
      });

      expect(screen.getByDisplayValue('hello')).toBeInTheDocument();
      expect(onChangeSpy).toHaveBeenCalledWith('hello', 'name');
    });

    it('preserves an empty string returned by fieldConfig.onChange as a valid transform', async () => {
      // Empty string is a valid transformed value — must not be treated as void.
      renderStringInput({ fieldConfig: { onChange: () => '' } });

      await act(async () => {
        fireEvent.change(screen.getByLabelText('Name'), {
          target: { value: 'something' },
        });
      });

      // The input is cleared because onChange explicitly returned ''.
      expect(screen.getByDisplayValue('')).toBeInTheDocument();
    });
  });
});
