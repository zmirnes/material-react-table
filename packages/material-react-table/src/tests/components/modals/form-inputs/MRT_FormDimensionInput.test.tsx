import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  MRT_FormDimensionInput,
  type DimensionFormValue,
} from '../../../../components/modals/form-inputs/MRT_FormDimensionInput';
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

// Minimal dimension column definition used across tests.
const DEFAULT_COLUMN_DEF: MRT_ColumnDef<Record<string, unknown>> = {
  accessorKey: 'dimension',
  header: 'Dimension',
  type: 'dimension',
  meta: {
    dimensions: {
      fields: ['length', 'width', 'height'],
    },
  },
};

// Column definition that includes a tolerance range.
const COLUMN_DEF_WITH_TOLERANCE: MRT_ColumnDef<Record<string, unknown>> = {
  accessorKey: 'dimension',
  header: 'Dimension',
  type: 'dimension',
  meta: {
    dimensions: {
      fields: ['length', 'width'],
      tolerance: { min: 0.01, max: 100 },
    },
  },
};

// Column definition with no configured dimension fields — triggers null render.
const COLUMN_DEF_EMPTY_FIELDS: MRT_ColumnDef<Record<string, unknown>> = {
  accessorKey: 'dimension',
  header: 'Dimension',
  type: 'dimension',
  meta: {
    dimensions: { fields: [] },
  },
};

interface FormWrapperProps {
  children: React.ReactNode;
  // Initial form values used to pre-populate controlled fields.
  defaultValues?: Record<string, unknown>;
  // RHF validation mode — 'onBlur' is used for error trigger tests.
  mode?: 'onChange' | 'onBlur' | 'onSubmit';
}

// Provides RHF context and MUI theme for rendering MRT_FormDimensionInput in isolation.
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
    DimensionFormValue
  > | null;
  fieldLabels?: Record<string, string>;
  defaultValues?: Record<string, unknown>;
  mode?: 'onChange' | 'onBlur' | 'onSubmit';
}

// Renders MRT_FormDimensionInput wrapped in FormWrapper so useFormContext() resolves correctly.
const renderDimensionInput = ({
  name = 'dimension',
  columnDef = DEFAULT_COLUMN_DEF,
  fieldConfig = null,
  fieldLabels,
  defaultValues = { dimension: {} },
  mode = 'onBlur',
}: RenderOptions = {}) =>
  render(
    <FormWrapper defaultValues={defaultValues} mode={mode}>
      <MRT_FormDimensionInput
        name={name}
        columnDef={columnDef}
        fieldConfig={fieldConfig}
        fieldLabels={fieldLabels}
      />
    </FormWrapper>,
  );

describe('MRT_FormDimensionInput', () => {
  describe('rendering', () => {
    it('renders one input per configured dimension field', () => {
      renderDimensionInput();

      // Three fields: length, width, height
      expect(screen.getAllByRole('spinbutton')).toHaveLength(3);
    });

    it('renders an additional tolerance input when tolerance is configured', () => {
      renderDimensionInput({ columnDef: COLUMN_DEF_WITH_TOLERANCE });

      // Two dimension fields + one tolerance field
      expect(screen.getAllByRole('spinbutton')).toHaveLength(3);
    });

    it('renders nothing when dimensions.fields is empty', () => {
      renderDimensionInput({
        columnDef: COLUMN_DEF_EMPTY_FIELDS,
      });

      expect(screen.queryAllByRole('spinbutton')).toHaveLength(0);
    });

    it('renders nothing when meta.dimensions is not defined', () => {
      const columnDefNoMeta: MRT_ColumnDef<Record<string, unknown>> = {
        accessorKey: 'dimension',
        header: 'Dimension',
        type: 'dimension',
      };
      renderDimensionInput({
        columnDef: columnDefNoMeta,
      });

      expect(screen.queryAllByRole('spinbutton')).toHaveLength(0);
    });

    it('all inputs have type number', () => {
      renderDimensionInput();

      screen.getAllByRole('spinbutton').forEach((input) => {
        expect(input).toHaveAttribute('type', 'number');
      });
    });
  });

  describe('labels', () => {
    it('uses the raw field key as label when fieldLabels is not provided', () => {
      renderDimensionInput();

      expect(screen.getByLabelText('length')).toBeInTheDocument();
      expect(screen.getByLabelText('width')).toBeInTheDocument();
      expect(screen.getByLabelText('height')).toBeInTheDocument();
    });

    it('uses translated labels from fieldLabels when provided', () => {
      renderDimensionInput({
        fieldLabels: { length: 'Dužina', width: 'Širina', height: 'Visina' },
      });

      expect(screen.getByLabelText('Dužina')).toBeInTheDocument();
      expect(screen.getByLabelText('Širina')).toBeInTheDocument();
      expect(screen.getByLabelText('Visina')).toBeInTheDocument();
    });

    it('falls back to raw field key when fieldLabels does not contain that key', () => {
      // Only 'length' is translated — 'width' and 'height' fall back to raw key.
      renderDimensionInput({ fieldLabels: { length: 'Dužina' } });

      expect(screen.getByLabelText('Dužina')).toBeInTheDocument();
      expect(screen.getByLabelText('width')).toBeInTheDocument();
      expect(screen.getByLabelText('height')).toBeInTheDocument();
    });

    it('renders the tolerance field with translated label when fieldLabels provides it', () => {
      renderDimensionInput({
        columnDef: COLUMN_DEF_WITH_TOLERANCE,
        fieldLabels: { tolerance: 'Tolerancija' },
      });

      expect(screen.getByLabelText('Tolerancija')).toBeInTheDocument();
    });
  });

  describe('pre-populated value (edit mode)', () => {
    it('displays default values for each dimension field', () => {
      renderDimensionInput({
        defaultValues: { dimension: { length: 100, width: 200, height: 300 } },
      });

      expect(screen.getByDisplayValue('100')).toBeInTheDocument();
      expect(screen.getByDisplayValue('200')).toBeInTheDocument();
      expect(screen.getByDisplayValue('300')).toBeInTheDocument();
    });

    it('renders empty inputs when the default value is an empty object', () => {
      renderDimensionInput({ defaultValues: { dimension: {} } });

      screen.getAllByRole('spinbutton').forEach((input) => {
        expect(input).toHaveValue(null);
      });
    });
  });

  describe('onChange', () => {
    it('updates a single dimension field value inside the stored object', async () => {
      renderDimensionInput();

      await act(async () => {
        fireEvent.change(screen.getByLabelText('length'), {
          target: { value: '150' },
        });
      });

      expect(screen.getByDisplayValue('150')).toBeInTheDocument();
    });

    it('stores null for a field when its input is cleared', async () => {
      renderDimensionInput({
        defaultValues: { dimension: { length: 100 } },
      });

      await act(async () => {
        fireEvent.change(screen.getByLabelText('length'), {
          target: { value: '' },
        });
      });

      expect(screen.getByLabelText('length')).toHaveValue(null);
    });

    it('applies the transform returned by fieldConfig.onChange', async () => {
      // Double every dimension value as a transformation.
      const handleChange = vi.fn(
        (value: DimensionFormValue): DimensionFormValue =>
          Object.fromEntries(
            Object.entries(value).map(([key, val]) => [
              key,
              val !== null ? val * 2 : null,
            ]),
          ),
      );

      renderDimensionInput({ fieldConfig: { onChange: handleChange } });

      await act(async () => {
        fireEvent.change(screen.getByLabelText('length'), {
          target: { value: '50' },
        });
      });

      // The transform doubles the input: 50 → 100
      expect(screen.getByDisplayValue('100')).toBeInTheDocument();
    });

    it('ignores tolerance input that exceeds the configured max', async () => {
      renderDimensionInput({
        columnDef: COLUMN_DEF_WITH_TOLERANCE,
        defaultValues: { dimension: { tolerance: 10 } },
      });

      await act(async () => {
        // 101 exceeds the configured max of 100 — should be discarded
        fireEvent.change(screen.getByLabelText('tolerance'), {
          target: { value: '101' },
        });
      });

      // Value must remain at 10 (the original default), not change to 101
      expect(screen.getByDisplayValue('10')).toBeInTheDocument();
    });

    it('accepts a tolerance value within the allowed range', async () => {
      renderDimensionInput({ columnDef: COLUMN_DEF_WITH_TOLERANCE });

      await act(async () => {
        fireEvent.change(screen.getByLabelText('tolerance'), {
          target: { value: '50' },
        });
      });

      expect(screen.getByDisplayValue('50')).toBeInTheDocument();
    });
  });

  describe('fieldConfig props', () => {
    it('disables all inputs when fieldConfig.disabled is true', () => {
      renderDimensionInput({ fieldConfig: { disabled: true } });

      screen.getAllByRole('spinbutton').forEach((input) => {
        expect(input).toBeDisabled();
      });
    });

    it('renders helperText when there is no validation error', () => {
      renderDimensionInput({
        fieldConfig: { helperText: 'Enter dimensions in millimeters' },
      });

      expect(
        screen.getByText('Enter dimensions in millimeters'),
      ).toBeInTheDocument();
    });

    it('applies small size by default when fieldConfig.size is not specified', () => {
      renderDimensionInput({ fieldConfig: null });

      // MUI applies MuiInputBase-sizeSmall on each input wrapper.
      const firstInput = screen.getAllByRole('spinbutton')[0];
      const inputWrapper = firstInput.closest('.MuiInputBase-root');
      expect(inputWrapper).toHaveClass('MuiInputBase-sizeSmall');
    });

    it('applies medium size when fieldConfig.size is medium', () => {
      renderDimensionInput({ fieldConfig: { size: 'medium' } });

      const firstInput = screen.getAllByRole('spinbutton')[0];
      const inputWrapper = firstInput.closest('.MuiInputBase-root');
      expect(inputWrapper).not.toHaveClass('MuiInputBase-sizeSmall');
    });
  });

  describe('validation', () => {
    it('shows a required error when all fields are untouched and the form is submitted', async () => {
      renderDimensionInput({
        fieldConfig: { rules: { required: 'Dimension is required' } },
        mode: 'onSubmit',
        defaultValues: { dimension: null },
      });

      await act(async () => {
        fireEvent.submit(screen.getByRole('form'));
      });

      await waitFor(() => {
        expect(screen.getByText('Dimension is required')).toBeInTheDocument();
      });
    });

    it('replaces helperText with the error message when validation fails', async () => {
      renderDimensionInput({
        fieldConfig: {
          helperText: 'Enter dimensions in millimeters',
          rules: { required: 'Dimension is required' },
        },
        mode: 'onSubmit',
        defaultValues: { dimension: null },
      });

      await act(async () => {
        fireEvent.submit(screen.getByRole('form'));
      });

      await waitFor(() => {
        expect(screen.getByText('Dimension is required')).toBeInTheDocument();
        expect(
          screen.queryByText('Enter dimensions in millimeters'),
        ).not.toBeInTheDocument();
      });
    });
  });
});
