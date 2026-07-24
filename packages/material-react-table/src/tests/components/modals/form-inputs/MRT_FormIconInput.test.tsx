import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { MRT_FormIconInput } from '../../../../components/modals/form-inputs/MRT_FormIconInput';
import {
  type MRT_ColumnDef,
  type MRT_FormFieldConfig,
  type MRT_IconColumnDef,
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

// Available icon options — mirrors what the backend sends via column.meta.availableIcons.
const DEFAULT_AVAILABLE_ICONS = [
  {
    iconType: { iconCode: 1, description: 'Aktivan', color: '#00b894' },
    tooltip: 'Aktivan',
    value: '1',
  },
  {
    iconType: { iconCode: 2, description: 'Na čekanju', color: '#f39c12' },
    tooltip: 'Na čekanju',
    value: '2',
  },
  {
    iconType: { iconCode: 3, description: 'Neaktivan', color: '#d63031' },
    tooltip: 'Neaktivan',
    value: '3',
  },
];

// Minimal icon column definition used across tests.
const DEFAULT_COLUMN_DEF: MRT_IconColumnDef<Record<string, unknown>> = {
  accessorKey: 'status',
  header: 'Status',
  type: 'icon',
  meta: {
    availableIcons: DEFAULT_AVAILABLE_ICONS,
  },
};

interface FormWrapperProps {
  children: React.ReactNode;
  // Initial form values used to pre-populate controlled fields.
  defaultValues?: Record<string, unknown>;
  // RHF validation mode — 'onBlur' is used for error trigger tests.
  mode?: 'onChange' | 'onBlur' | 'onSubmit';
}

// Provides RHF context and MUI theme for rendering MRT_FormIconInput in isolation.
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
  mode?: 'onChange' | 'onBlur' | 'onSubmit';
}

// Renders MRT_FormIconInput wrapped in FormWrapper so useFormContext() resolves correctly.
// iconsList is left empty — these tests cover the colored-dot fallback path.
const renderIconInput = ({
  name = 'status',
  columnDef = DEFAULT_COLUMN_DEF,
  fieldConfig = null,
  defaultValues = { status: '' },
  mode = 'onBlur',
}: RenderOptions = {}) =>
  render(
    <FormWrapper defaultValues={defaultValues} mode={mode}>
      <MRT_FormIconInput
        name={name}
        columnDef={columnDef}
        fieldConfig={fieldConfig}
        iconsList={{}}
      />
    </FormWrapper>,
  );

describe('MRT_FormIconInput', () => {
  describe('label', () => {
    it('uses columnDef.header as label when fieldConfig has no label', () => {
      renderIconInput({ fieldConfig: null });

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
      renderIconInput({ fieldConfig: { label: 'Icon Status' } });

      // Override label is rendered; original column header is not used as label.
      expect(
        screen.getByText(
          (content, el) => content === 'Icon Status' && el?.tagName === 'LABEL',
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
      renderIconInput({
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
      renderIconInput({ fieldConfig: null });

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('renders a disabled select when fieldConfig.disabled is true', () => {
      renderIconInput({ fieldConfig: { disabled: true } });

      // MUI Select marks the underlying combobox input as disabled.
      expect(screen.getByRole('combobox')).toHaveAttribute(
        'aria-disabled',
        'true',
      );
    });

    it('renders helperText from fieldConfig when there is no validation error', () => {
      renderIconInput({ fieldConfig: { helperText: 'Pick an icon' } });

      expect(screen.getByText('Pick an icon')).toBeInTheDocument();
    });

    it('applies small size by default when fieldConfig.size is not specified', () => {
      renderIconInput({ fieldConfig: null });

      // MUI v6 applies size="small" as MuiInputBase-sizeSmall on the InputBase wrapper.
      const selectRoot = screen
        .getByRole('combobox')
        .closest('.MuiInputBase-root');
      expect(selectRoot).toHaveClass('MuiInputBase-sizeSmall');
    });

    it('applies medium size when fieldConfig.size is medium', () => {
      renderIconInput({ fieldConfig: { size: 'medium' } });

      // Medium size does not carry the sizeSmall class.
      const selectRoot = screen
        .getByRole('combobox')
        .closest('.MuiInputBase-root');
      expect(selectRoot).not.toHaveClass('MuiInputBase-sizeSmall');
    });
  });

  describe('available options', () => {
    it('renders all available icon options inside the dropdown', async () => {
      renderIconInput({ fieldConfig: null });

      await act(async () => {
        fireEvent.mouseDown(screen.getByRole('combobox'));
      });

      // All three options should be visible in the dropdown.
      expect(screen.getByText('Aktivan')).toBeInTheDocument();
      expect(screen.getByText('Na čekanju')).toBeInTheDocument();
      expect(screen.getByText('Neaktivan')).toBeInTheDocument();
    });

    it('renders an empty dropdown when no availableIcons are provided', async () => {
      const columnDefWithNoIcons: MRT_IconColumnDef<Record<string, unknown>> = {
        ...DEFAULT_COLUMN_DEF,
        meta: { availableIcons: [] },
      };

      renderIconInput({ columnDef: columnDefWithNoIcons, fieldConfig: null });

      await act(async () => {
        fireEvent.mouseDown(screen.getByRole('combobox'));
      });

      // None of the default option labels should be present.
      expect(screen.queryByText('Aktivan')).not.toBeInTheDocument();
    });
  });

  describe('pre-populated value (edit mode)', () => {
    it('displays the tooltip of the pre-selected icon when defaultValues contains an iconCode', () => {
      renderIconInput({ defaultValues: { status: '1' } });

      // renderValue renders the tooltip text of the selected icon.
      expect(screen.getByText('Aktivan')).toBeInTheDocument();
    });

    it('renders nothing in the trigger when the pre-selected iconCode has no matching option', () => {
      renderIconInput({ defaultValues: { status: 'unknown-code' } });

      // No option matches — renderValue returns null, trigger shows nothing.
      expect(screen.queryByText('Aktivan')).not.toBeInTheDocument();
      expect(screen.queryByText('Na čekanju')).not.toBeInTheDocument();
    });
  });

  describe('selection', () => {
    it('shows the selected option tooltip after the user picks an icon', async () => {
      renderIconInput({ fieldConfig: null });

      await act(async () => {
        fireEvent.mouseDown(screen.getByRole('combobox'));
      });

      await act(async () => {
        fireEvent.click(screen.getByText('Na čekanju'));
      });

      // Collapsed trigger now shows the selected icon's tooltip.
      expect(screen.getByText('Na čekanju')).toBeInTheDocument();
    });

    it('applies the transform returned by fieldConfig.onChange', async () => {
      // Transform maps any selected iconCode to a fixed value '3'.
      renderIconInput({ fieldConfig: { onChange: () => '3' } });

      await act(async () => {
        fireEvent.mouseDown(screen.getByRole('combobox'));
      });

      await act(async () => {
        fireEvent.click(screen.getByText('Aktivan'));
      });

      // The transformed iconCode '3' resolves to 'Neaktivan' in renderValue.
      await waitFor(() => {
        expect(screen.getByText('Neaktivan')).toBeInTheDocument();
      });
    });

    it('calls fieldConfig.onChange with the selected iconCode and field name', async () => {
      const onChangeSpy = vi.fn<(value: string | null, name: string) => void>();

      renderIconInput({
        name: 'status',
        fieldConfig: { onChange: onChangeSpy },
      });

      await act(async () => {
        fireEvent.mouseDown(screen.getByRole('combobox'));
      });

      await act(async () => {
        fireEvent.click(screen.getByText('Aktivan'));
      });

      expect(onChangeSpy).toHaveBeenCalledWith('1', 'status');
    });

    it('stores null returned by fieldConfig.onChange as a valid transformed value', async () => {
      // null is a valid transformed value — must not be skipped in favour of the raw iconCode.
      const onChangeSpy = vi.fn<(value: string | null, name: string) => null>(
        () => null,
      );

      renderIconInput({ fieldConfig: { onChange: onChangeSpy } });

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
    it('shows a required error message when the field is blurred without selection', async () => {
      renderIconInput({
        fieldConfig: { rules: { required: 'Status is required' } },
        mode: 'onBlur',
      });

      await act(async () => {
        fireEvent.focus(screen.getByRole('combobox'));
        fireEvent.blur(screen.getByRole('combobox'));
      });

      await waitFor(() => {
        expect(screen.getByText('Status is required')).toBeInTheDocument();
      });
    });

    it('replaces helperText with the error message when validation fails', async () => {
      renderIconInput({
        fieldConfig: {
          helperText: 'Pick an icon',
          rules: { required: 'Status is required' },
        },
        mode: 'onBlur',
      });

      await act(async () => {
        fireEvent.focus(screen.getByRole('combobox'));
        fireEvent.blur(screen.getByRole('combobox'));
      });

      await waitFor(() => {
        // Error message replaces the static helper text while validation fails.
        expect(screen.getByText('Status is required')).toBeInTheDocument();
        expect(screen.queryByText('Pick an icon')).not.toBeInTheDocument();
      });
    });
  });
});
