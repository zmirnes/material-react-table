import React from 'react';
import CancelIcon from '@mui/icons-material/Cancel';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { MRT_NewEntryForm } from '../../../components/modals/MRT_NewEntryForm';
import { MRT_NewEntryFormActions } from '../../../components/modals/MRT_NewEntryFormActions';
import { MRT_NewEntryFormProvider } from '../../../components/modals/MRT_NewEntryFormProvider';
import {
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

// Minimal MRT_Icons subset required by the form components.
const MOCK_ICONS = {
  CancelIcon,
  ExpandMoreIcon,
};

// Options for configuring the mock table in each test scenario.
interface MockTableConfig {
  newEntryModalState?: MRT_NewEntryModalState;
  formConfig?: MRT_FormConfig<Record<string, unknown>>;
  // Column definitions — each item maps to a leaf column in getAllLeafColumns().
  columns?: Array<{
    id: string;
    header: string;
    columnDefType?: 'data' | 'display' | 'group';
    formField?: Record<string, unknown> | ((props: unknown) => React.ReactNode);
  }>;
}

// Builds a minimal MRT_TableInstance mock that satisfies the form components' needs.
const buildMockTable = ({
  newEntryModalState = { open: true },
  formConfig,
  columns = [
    { id: 'name', header: 'Name', columnDefType: 'data' },
    { id: 'age', header: 'Age', columnDefType: 'data' },
  ],
}: MockTableConfig = {}): {
  table: MRT_TableInstance<Record<string, unknown>>;
  setNewEntryModal: ReturnType<typeof vi.fn>;
} => {
  const setNewEntryModal = vi.fn();

  const leafColumns = columns.map((col) => ({
    id: col.id,
    columnDef: {
      columnDefType: col.columnDefType ?? 'data',
      header: col.header,
      formField: col.formField,
    },
  }));

  const table = {
    getAllLeafColumns: () => leafColumns,
    getState: () => ({ newEntryModal: newEntryModalState }),
    options: {
      formConfig,
      icons: MOCK_ICONS,
      localization: MOCK_LOCALIZATION,
      muiNewEntryModalProps: undefined,
    },
    setNewEntryModal,
  } as unknown as MRT_TableInstance<Record<string, unknown>>;

  return { setNewEntryModal, table };
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
      const { table } = buildMockTable({
        columns: [
          { id: 'name', header: 'Name', columnDefType: 'data' },
          { id: 'email', header: 'Email', columnDefType: 'data' },
        ],
      });

      renderFormWithProvider(table);

      // Each data column produces a labeled TextField in the form body.
      expect(screen.getByLabelText('Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    it('does not render a field for display columns', () => {
      const { table } = buildMockTable({
        columns: [
          { id: 'name', header: 'Name', columnDefType: 'data' },
          {
            id: 'mrt-row-actions',
            header: 'Actions',
            columnDefType: 'display',
          },
        ],
      });

      renderFormWithProvider(table);

      // Only the data column produces a field — the display column is excluded.
      expect(screen.getByLabelText('Name')).toBeInTheDocument();
      expect(screen.queryByLabelText('Actions')).not.toBeInTheDocument();
    });

    it('does not render a field for columns listed in formConfig.excludeColumns', () => {
      const { table } = buildMockTable({
        columns: [
          { id: 'name', header: 'Name', columnDefType: 'data' },
          { id: 'internalId', header: 'Internal ID', columnDefType: 'data' },
        ],
        formConfig: { excludeColumns: ['internalId'] },
      });

      renderFormWithProvider(table);

      expect(screen.getByLabelText('Name')).toBeInTheDocument();
      expect(screen.queryByLabelText('Internal ID')).not.toBeInTheDocument();
    });

    it('renders a disabled TextField when formField.disabled is true', () => {
      const { table } = buildMockTable({
        columns: [
          { id: 'name', header: 'Name', columnDefType: 'data' },
          {
            id: 'secret',
            header: 'Secret',
            columnDefType: 'data',
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
      const { table } = buildMockTable({
        columns: [
          {
            id: 'firstName',
            header: 'First Name',
            columnDefType: 'data',
            formField: { label: 'Given Name' },
          },
        ],
      });

      renderFormWithProvider(table);

      // The override label is shown; the column header is not used as a label.
      expect(screen.getByLabelText('Given Name')).toBeInTheDocument();
      expect(screen.queryByLabelText('First Name')).not.toBeInTheDocument();
    });

    it('renders the output of formField render function instead of the default TextField', () => {
      const CUSTOM_FIELD_TEST_ID = 'custom-field-sentinel';
      const { table } = buildMockTable({
        columns: [
          {
            id: 'name',
            header: 'Name',
            columnDefType: 'data',
            formField: () => <div data-testid={CUSTOM_FIELD_TEST_ID} />,
          },
        ],
      });

      renderFormWithProvider(table);

      expect(screen.getByTestId(CUSTOM_FIELD_TEST_ID)).toBeInTheDocument();
      // No default TextField should be present for this column.
      expect(screen.queryByLabelText('Name')).not.toBeInTheDocument();
    });

    it('renders the output of fieldConfig.render when provided as a config-level render override', () => {
      // fieldConfig.render is a render override inside the config object — lower priority than
      // formField-as-function but higher priority than the default Controller+TextField fallback.
      const RENDER_OVERRIDE_TEST_ID = 'render-override-sentinel';
      const { table } = buildMockTable({
        columns: [
          {
            id: 'name',
            header: 'Name',
            columnDefType: 'data',
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
      const { table } = buildMockTable({
        columns: [
          {
            id: 'email',
            header: 'Email',
            columnDefType: 'data',
            // required rule with a human-readable error message.
            formField: { rules: { required: 'Email is required' } },
          },
        ],
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
      const { table } = buildMockTable({
        columns: [
          {
            id: 'code',
            header: 'Code',
            columnDefType: 'data',
            // Transform: convert input to uppercase before storing in RHF state.
            formField: { onChange: (value: string) => value.toUpperCase() },
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
      const { table } = buildMockTable({
        newEntryModalState: { mode: 'create', open: true },
        columns: [
          {
            id: 'status',
            header: 'Status',
            columnDefType: 'data',
            formField: { defaultValue: 'active' },
          },
        ],
      });

      renderFormWithProvider(table);

      expect(screen.getByDisplayValue('active')).toBeInTheDocument();
    });

    it('pre-populates fields from initialValues in edit mode', () => {
      const { table } = buildMockTable({
        newEntryModalState: {
          mode: 'edit',
          open: true,
          initialValues: { name: 'Alice', age: '30' },
        },
        columns: [
          { id: 'name', header: 'Name', columnDefType: 'data' },
          { id: 'age', header: 'Age', columnDefType: 'data' },
        ],
      });

      renderFormWithProvider(table);

      expect(screen.getByDisplayValue('Alice')).toBeInTheDocument();
      expect(screen.getByDisplayValue('30')).toBeInTheDocument();
    });
  });

  describe('MRT_NewEntryFormActions — footer buttons', () => {
    it('renders Save and Cancel buttons', () => {
      const { table } = buildMockTable();
      renderFormWithProvider(table, true);

      expect(
        screen.getByRole('button', { name: MOCK_LOCALIZATION.save }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: MOCK_LOCALIZATION.cancel }),
      ).toBeInTheDocument();
    });

    it('calls setNewEntryModal({ open: false }) when Cancel is clicked', async () => {
      const { setNewEntryModal, table } = buildMockTable();
      renderFormWithProvider(table, true);

      await act(async () => {
        fireEvent.click(
          screen.getByRole('button', { name: MOCK_LOCALIZATION.cancel }),
        );
      });

      expect(setNewEntryModal).toHaveBeenCalledWith({ open: false });
    });

    it('calls formConfig.onCancel before closing the modal on Cancel click', async () => {
      const onCancel = vi.fn();
      const { setNewEntryModal, table } = buildMockTable({
        formConfig: { onCancel },
      });

      renderFormWithProvider(table, true);

      await act(async () => {
        fireEvent.click(
          screen.getByRole('button', { name: MOCK_LOCALIZATION.cancel }),
        );
      });

      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(setNewEntryModal).toHaveBeenCalledWith({ open: false });
    });

    it('calls formConfig.onSave when Save is clicked', async () => {
      const onSave = vi.fn().mockResolvedValue(undefined);
      const { table } = buildMockTable({ formConfig: { onSave } });
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
      const { table } = buildMockTable({ formConfig: { customActions } });

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
      const { table } = buildMockTable({
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
      const { table } = buildMockTable({
        columns: [{ id: 'name', header: 'Name', columnDefType: 'data' }],
        formConfig: { additionalFields },
      });

      renderFormWithProvider(table);

      expect(screen.getByTestId(ADDITIONAL_FIELD_TEST_ID)).toBeInTheDocument();
    });
  });

  describe('section rendering', () => {
    it('renders the section title when sections are defined', () => {
      const { table } = buildMockTable({
        columns: [
          {
            id: 'city',
            header: 'City',
            columnDefType: 'data',
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

    it('collapses section content when a collapsible section header is clicked', async () => {
      const SECTION_FIELD_LABEL = 'City';
      const { table } = buildMockTable({
        columns: [
          {
            id: 'city',
            header: SECTION_FIELD_LABEL,
            columnDefType: 'data',
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

      // Section is expanded by default — the field is visible in the DOM.
      expect(screen.getByLabelText(SECTION_FIELD_LABEL)).toBeInTheDocument();

      // Click the section header — FormSectionBlock calls handleToggle to collapse.
      await act(async () => {
        fireEvent.click(screen.getByText('Address Information'));
      });

      // Collapse uses unmountOnExit — collapsed children are removed from the DOM.
      await waitFor(() => {
        expect(
          screen.queryByLabelText(SECTION_FIELD_LABEL),
        ).not.toBeInTheDocument();
      });
    });
  });
});
