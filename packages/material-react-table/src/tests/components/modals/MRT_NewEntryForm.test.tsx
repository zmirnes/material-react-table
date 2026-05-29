import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { MRT_NewEntryForm } from '../../../components/modals/MRT_NewEntryForm';
import { MRT_NewEntryFormActions } from '../../../components/modals/MRT_NewEntryFormActions';
import { MRT_NewEntryFormProvider } from '../../../components/modals/MRT_NewEntryFormProvider';
import { useMaterialReactTable } from '../../../hooks/useMaterialReactTable';
import {
  type MRT_ColumnDef,
  type MRT_FormAdditionalField,
  type MRT_FormConfig,
  type MRT_FormCustomAction,
  type MRT_NewEntryModalState,
  type MRT_TableInstance,
} from '../../../types';
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// A default MUI theme used to satisfy useTheme() calls inside MUI components.
const DEFAULT_THEME = createTheme();

// Wraps the given element in a MUI ThemeProvider.
const renderWithTheme = (ui: React.ReactElement) =>
  render(<ThemeProvider theme={DEFAULT_THEME}>{ui}</ThemeProvider>);

// Minimal localization strings consumed by MRT_NewEntryFormActions.
const MOCK_LOCALIZATION = {
  cancel: 'Cancel',
  save: 'Save',
};

// Default columns used when a test does not require specific column configuration.
const DEFAULT_COLUMNS: MRT_ColumnDef<Record<string, unknown>>[] = [
  { accessorKey: 'name', header: 'Name', type: 'string' },
  { accessorKey: 'age', header: 'Age', type: 'string' },
];

// Options for configuring the real table instance in each test scenario.
interface TableConfig {
  columns?: MRT_ColumnDef<Record<string, unknown>>[];
  enableRowSelection?: boolean;
  formConfig?: MRT_FormConfig<Record<string, unknown>>;
  // Initial state for the new-entry modal — open with an optional mode and values.
  initialNewEntryModal?: MRT_NewEntryModalState;
}

// Creates a real MRT_TableInstance via renderHook with the given options.
// Using a real instance avoids the fragility of as-unknown-as casts and keeps
// the test surface aligned with the actual MRT API.
const buildTable = ({
  columns = DEFAULT_COLUMNS,
  enableRowSelection,
  formConfig,
  initialNewEntryModal = { open: true },
}: TableConfig = {}): MRT_TableInstance<Record<string, unknown>> => {
  const { result } = renderHook(() =>
    useMaterialReactTable<Record<string, unknown>>({
      columns,
      data: [],
      enableRowSelection,
      formConfig,
      initialState: { newEntryModal: initialNewEntryModal },
    }),
  );
  return result.current;
};

// Renders MRT_NewEntryForm wrapped in MRT_NewEntryFormProvider so tests have RHF context.
// Optionally includes MRT_NewEntryFormActions when footer interactions need to be tested.
const renderFormWithProvider = (
  table: MRT_TableInstance<Record<string, unknown>>,
  includeActions = false,
) =>
  renderWithTheme(
    <MRT_NewEntryFormProvider table={table}>
      <MRT_NewEntryForm table={table} />
      {includeActions && <MRT_NewEntryFormActions table={table} />}
    </MRT_NewEntryFormProvider>,
  );

describe('MRT_NewEntryForm', () => {
  describe('field rendering from columns', () => {
    it('renders a TextField for each data column by default', () => {
      const table = buildTable({
        columns: [
          { accessorKey: 'name', header: 'Name', type: 'string' },
          { accessorKey: 'email', header: 'Email', type: 'string' },
        ],
      });

      renderFormWithProvider(table);

      // Each data column produces a labeled TextField in the form body.
      expect(screen.getByLabelText('Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    it('does not render a field for display columns', () => {
      // enableRowSelection injects an internal mrt-row-select display column that must be excluded.
      const table = buildTable({
        columns: [{ accessorKey: 'name', header: 'Name', type: 'string' }],
        enableRowSelection: true,
      });

      renderFormWithProvider(table);

      expect(screen.getByLabelText('Name')).toBeInTheDocument();
      // The injected display column must not produce a form field.
      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    });

    it('does not render a field for columns listed in formConfig.excludeColumns', () => {
      const table = buildTable({
        columns: [
          { accessorKey: 'name', header: 'Name', type: 'string' },
          { accessorKey: 'internalId', header: 'Internal ID', type: 'string' },
        ],
        formConfig: { excludeColumns: ['internalId'] },
      });

      renderFormWithProvider(table);

      expect(screen.getByLabelText('Name')).toBeInTheDocument();
      expect(screen.queryByLabelText('Internal ID')).not.toBeInTheDocument();
    });

    it('renders a disabled TextField when formField.disabled is true', () => {
      const table = buildTable({
        columns: [
          { accessorKey: 'name', header: 'Name', type: 'string' },
          {
            accessorKey: 'secret',
            header: 'Secret',
            type: 'string',
            formField: { disabled: true },
          },
        ],
      });

      renderFormWithProvider(table);

      expect(screen.getByLabelText('Name')).toBeInTheDocument();
      // Disabled field is rendered — just not interactive.
      const secretInput = screen.getByLabelText('Secret');
      expect(secretInput).toBeInTheDocument();
      expect(secretInput).toBeDisabled();
    });

    it('uses formField.label override as the TextField label when provided', () => {
      const table = buildTable({
        columns: [
          {
            accessorKey: 'firstName',
            header: 'First Name',
            type: 'string',
            formField: { label: 'Given Name' },
          },
        ],
      });

      renderFormWithProvider(table);

      // The override label is shown; the column header is not used as a label.
      expect(screen.getByLabelText('Given Name')).toBeInTheDocument();
      expect(screen.queryByLabelText('First Name')).not.toBeInTheDocument();
    });

    it('renders the output of fieldConfig.render when provided as a config-level render override', () => {
      // fieldConfig.render is a render override inside the config object — lower priority than
      // formField-as-function but higher priority than the default Controller+TextField fallback.
      const RENDER_OVERRIDE_TEST_ID = 'render-override-sentinel';
      const table = buildTable({
        columns: [
          {
            accessorKey: 'name',
            header: 'Name',
            type: 'string',
            formField: {
              render: () => <div data-testid={RENDER_OVERRIDE_TEST_ID} />,
            },
          },
        ],
      });

      renderFormWithProvider(table);

      expect(screen.getByTestId(RENDER_OVERRIDE_TEST_ID)).toBeInTheDocument();
      // Default TextField is not rendered when a render override is provided.
      expect(screen.queryByLabelText('Name')).not.toBeInTheDocument();
    });

    it('shows a validation error message when fieldConfig.rules are violated on submit', async () => {
      const table = buildTable({
        columns: [
          {
            accessorKey: 'email',
            header: 'Email',
            type: 'string',
            formField: { rules: { required: 'Email is required' } },
          },
        ],
        // onSave must be defined — Save button is only rendered when a save handler is provided.
        formConfig: { onSave: vi.fn() },
      });

      // includeActions = true so the Save (type="submit") button is present.
      renderFormWithProvider(table, true);

      // Click Save without filling in the required field — RHF blocks submission and shows the error.
      await act(async () => {
        fireEvent.click(
          screen.getByRole('button', { name: MOCK_LOCALIZATION.save }),
        );
      });

      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
      });
    });

    it('applies the fieldConfig.onChange transform to the value before updating RHF state', async () => {
      const table = buildTable({
        columns: [
          {
            accessorKey: 'code',
            header: 'Code',
            type: 'string',
            // Transform: convert input to uppercase before storing in RHF state.
            formField: {
              onChange: (value: unknown) => (value as string).toUpperCase(),
            },
          },
        ],
      });

      renderFormWithProvider(table);

      await act(async () => {
        fireEvent.change(screen.getByLabelText('Code'), {
          target: { value: 'abc' },
        });
      });

      // The controlled input reflects the transformed (uppercased) value from RHF state.
      expect(screen.getByDisplayValue('ABC')).toBeInTheDocument();
    });
  });

  describe('default values', () => {
    it('pre-populates fields with formField.defaultValue in create mode', () => {
      const table = buildTable({
        initialNewEntryModal: { mode: 'create', open: true },
        columns: [
          {
            accessorKey: 'status',
            header: 'Status',
            type: 'string',
            formField: { defaultValue: 'active' },
          },
        ],
      });

      renderFormWithProvider(table);

      expect(screen.getByDisplayValue('active')).toBeInTheDocument();
    });

    it('pre-populates fields from initialValues in edit mode', () => {
      const table = buildTable({
        initialNewEntryModal: {
          mode: 'edit',
          open: true,
          initialValues: { name: 'Alice', age: '30' },
        },
        columns: [
          { accessorKey: 'name', header: 'Name', type: 'string' },
          { accessorKey: 'age', header: 'Age', type: 'string' },
        ],
      });

      renderFormWithProvider(table);

      expect(screen.getByDisplayValue('Alice')).toBeInTheDocument();
      expect(screen.getByDisplayValue('30')).toBeInTheDocument();
    });
  });

  describe('MRT_NewEntryFormActions — footer buttons', () => {
    it('renders Save and Cancel buttons', () => {
      // onSave must be defined — Save button is only rendered when a save handler is provided.
      const table = buildTable({ formConfig: { onSave: vi.fn() } });
      renderFormWithProvider(table, true);

      expect(
        screen.getByRole('button', { name: MOCK_LOCALIZATION.save }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: MOCK_LOCALIZATION.cancel }),
      ).toBeInTheDocument();
    });

    it('calls setNewEntryModal({ open: false }) when Cancel is clicked', async () => {
      const table = buildTable();
      const setNewEntryModalSpy = vi.spyOn(table, 'setNewEntryModal');
      renderFormWithProvider(table, true);

      await act(async () => {
        fireEvent.click(
          screen.getByRole('button', { name: MOCK_LOCALIZATION.cancel }),
        );
      });

      expect(setNewEntryModalSpy).toHaveBeenCalledWith({ open: false });
    });

    it('calls formConfig.onCancel before closing the modal on Cancel click', async () => {
      const onCancel = vi.fn();
      const table = buildTable({ formConfig: { onCancel } });
      const setNewEntryModalSpy = vi.spyOn(table, 'setNewEntryModal');

      renderFormWithProvider(table, true);

      await act(async () => {
        fireEvent.click(
          screen.getByRole('button', { name: MOCK_LOCALIZATION.cancel }),
        );
      });

      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(setNewEntryModalSpy).toHaveBeenCalledWith({ open: false });
    });

    it('calls formConfig.onSave when Save is clicked', async () => {
      const onSave = vi.fn().mockResolvedValue(undefined);
      const table = buildTable({ formConfig: { onSave } });
      renderFormWithProvider(table, true);

      await act(async () => {
        fireEvent.click(
          screen.getByRole('button', { name: MOCK_LOCALIZATION.save }),
        );
      });

      await waitFor(() => {
        expect(onSave).toHaveBeenCalledTimes(1);
      });
    });

    it('renders custom action buttons alongside the default Save/Cancel buttons', () => {
      const CUSTOM_ACTION_TEST_ID = 'custom-action-button';
      const customActions: MRT_FormCustomAction<Record<string, unknown>>[] = [
        {
          key: 'draft',
          render: () => (
            <button data-testid={CUSTOM_ACTION_TEST_ID}>Save as Draft</button>
          ),
        },
      ];
      // onSave must be defined — Save button is only rendered when a save handler is provided.
      const table = buildTable({
        formConfig: { customActions, onSave: vi.fn() },
      });

      renderFormWithProvider(table, true);

      expect(screen.getByTestId(CUSTOM_ACTION_TEST_ID)).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: MOCK_LOCALIZATION.save }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: MOCK_LOCALIZATION.cancel }),
      ).toBeInTheDocument();
    });
  });

  describe('renderForm override', () => {
    it('renders the consumer-provided renderForm content instead of default fields', () => {
      const RENDER_FORM_TEST_ID = 'custom-form-body';
      const table = buildTable({
        formConfig: {
          renderForm: () => <div data-testid={RENDER_FORM_TEST_ID} />,
        },
      });

      renderFormWithProvider(table);

      expect(screen.getByTestId(RENDER_FORM_TEST_ID)).toBeInTheDocument();
      // Default column fields are not rendered when renderForm is provided.
      expect(screen.queryByLabelText('Name')).not.toBeInTheDocument();
    });
  });

  describe('additional fields', () => {
    it('renders additional non-column fields returned by their render function', () => {
      const ADDITIONAL_FIELD_TEST_ID = 'additional-field';
      const additionalFields: MRT_FormAdditionalField<
        Record<string, unknown>
      >[] = [
        {
          name: 'notes',
          render: ({ name }) => (
            <input data-testid={ADDITIONAL_FIELD_TEST_ID} name={name} />
          ),
        },
      ];
      const table = buildTable({
        columns: [{ accessorKey: 'name', header: 'Name', type: 'string' }],
        formConfig: { additionalFields },
      });

      renderFormWithProvider(table);

      expect(screen.getByTestId(ADDITIONAL_FIELD_TEST_ID)).toBeInTheDocument();
    });
  });

  describe('section rendering', () => {
    it('renders the section title when a section is defined', () => {
      const table = buildTable({
        columns: [
          {
            accessorKey: 'city',
            header: 'City',
            type: 'string',
            formField: { section: 'address' },
          },
        ],
        formConfig: {
          sections: [{ id: 'address', title: 'Address Information' }],
        },
      });

      renderFormWithProvider(table);

      expect(screen.getByText('Address Information')).toBeInTheDocument();
    });

    it('renders a field assigned to a section inside that section block', () => {
      const table = buildTable({
        columns: [
          {
            accessorKey: 'city',
            header: 'City',
            type: 'string',
            formField: { section: 'address' },
          },
        ],
        formConfig: {
          sections: [{ id: 'address', title: 'Address Information' }],
        },
      });

      renderFormWithProvider(table);

      // Both the section heading and the field inside it are visible.
      expect(screen.getByText('Address Information')).toBeInTheDocument();
      expect(screen.getByLabelText('City')).toBeInTheDocument();
    });

    it('renders unsectioned fields flat below the sections', () => {
      const table = buildTable({
        columns: [
          {
            accessorKey: 'city',
            header: 'City',
            type: 'string',
            formField: { section: 'address' },
          },
          // Notes has no section — must appear outside any Accordion.
          { accessorKey: 'notes', header: 'Notes', type: 'string' },
        ],
        formConfig: {
          sections: [{ id: 'address', title: 'Address Information' }],
        },
      });

      renderFormWithProvider(table);

      expect(screen.getByText('Address Information')).toBeInTheDocument();
      expect(screen.getByLabelText('City')).toBeInTheDocument();
      // Unsectioned field is rendered alongside the section, not inside it.
      expect(screen.getByLabelText('Notes')).toBeInTheDocument();
    });

    it('collapses section content when a collapsible section header is clicked', async () => {
      const SECTION_FIELD_LABEL = 'City';
      const table = buildTable({
        columns: [
          {
            accessorKey: 'city',
            header: SECTION_FIELD_LABEL,
            type: 'string',
            formField: { section: 'address' },
          },
        ],
        formConfig: {
          sections: [
            { id: 'address', title: 'Address Information', collapsible: true },
          ],
        },
      });

      renderFormWithProvider(table);

      // Section is expanded by default — the field is visible.
      expect(screen.getByLabelText(SECTION_FIELD_LABEL)).toBeInTheDocument();

      // Click the section header to collapse it.
      await act(async () => {
        fireEvent.click(screen.getByText('Address Information'));
      });

      // unmountOnExit removes collapsed children from the DOM.
      await waitFor(() => {
        expect(
          screen.queryByLabelText(SECTION_FIELD_LABEL),
        ).not.toBeInTheDocument();
      });
    });
  });
});
