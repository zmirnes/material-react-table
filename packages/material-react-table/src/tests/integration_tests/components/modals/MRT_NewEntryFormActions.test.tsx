import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { MaterialReactTable } from '../../../../components/MaterialReactTable';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

// A minimal MUI theme required because MRT components call useTheme() internally.
const DEFAULT_THEME = createTheme();

// Localization constants shared across tests — avoids magic strings in assertions.
const NEW_ENTRY_LABEL = 'New Entry';
const SAVE_LABEL = 'Save';
const CANCEL_LABEL = 'Cancel';
const CLOSE_LABEL = 'Close';

// Column definitions for a minimal two-column table.
const TEST_COLUMNS = [
  { accessorKey: 'name' as const, header: 'Name', type: 'string' as const },
  { accessorKey: 'age' as const, header: 'Age', type: 'number' as const },
];

// Wraps the given element in a MUI ThemeProvider.
const renderWithTheme = (ui: React.ReactElement) =>
  render(<ThemeProvider theme={DEFAULT_THEME}>{ui}</ThemeProvider>);

// Opens the New Entry modal by clicking the toolbar button.
// All form action tests start with an open modal.
const openModal = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole('button', { name: NEW_ENTRY_LABEL }));
  await waitFor(() => {
    expect(
      screen.getByRole('heading', { name: NEW_ENTRY_LABEL }),
    ).toBeInTheDocument();
  });
};

describe('MRT_NewEntryFormActions', () => {
  describe('Cancel button visibility', () => {
    it('always renders the Cancel button even without onCancel defined', async () => {
      const user = userEvent.setup();

      renderWithTheme(
        <MaterialReactTable
          columns={TEST_COLUMNS}
          data={[]}
          enableNewEntryButton
          localization={{
            close: CLOSE_LABEL,
            cancel: CANCEL_LABEL,
            save: SAVE_LABEL,
            newEntry: NEW_ENTRY_LABEL,
          }}
          formConfig={{ onSave: vi.fn() }}
        />,
      );

      await openModal(user);

      expect(
        screen.getByRole('button', { name: CANCEL_LABEL }),
      ).toBeInTheDocument();
    });

    it('renders the Cancel button when no formConfig is provided at all', async () => {
      const user = userEvent.setup();

      renderWithTheme(
        <MaterialReactTable
          columns={TEST_COLUMNS}
          data={[]}
          enableNewEntryButton
          localization={{
            close: CLOSE_LABEL,
            cancel: CANCEL_LABEL,
            save: SAVE_LABEL,
            newEntry: NEW_ENTRY_LABEL,
          }}
        />,
      );

      await openModal(user);

      expect(
        screen.getByRole('button', { name: CANCEL_LABEL }),
      ).toBeInTheDocument();
    });
  });

  describe('Save button visibility', () => {
    it('renders the Save button when onSave is defined', async () => {
      const user = userEvent.setup();

      renderWithTheme(
        <MaterialReactTable
          columns={TEST_COLUMNS}
          data={[]}
          enableNewEntryButton
          localization={{
            close: CLOSE_LABEL,
            cancel: CANCEL_LABEL,
            save: SAVE_LABEL,
            newEntry: NEW_ENTRY_LABEL,
          }}
          formConfig={{ onSave: vi.fn() }}
        />,
      );

      await openModal(user);

      expect(
        screen.getByRole('button', { name: SAVE_LABEL }),
      ).toBeInTheDocument();
    });

    it('does not render the Save button when onSave is not defined', async () => {
      const user = userEvent.setup();

      renderWithTheme(
        <MaterialReactTable
          columns={TEST_COLUMNS}
          data={[]}
          enableNewEntryButton
          localization={{
            close: CLOSE_LABEL,
            cancel: CANCEL_LABEL,
            save: SAVE_LABEL,
            newEntry: NEW_ENTRY_LABEL,
          }}
        />,
      );

      await openModal(user);

      expect(
        screen.queryByRole('button', { name: SAVE_LABEL }),
      ).not.toBeInTheDocument();
    });
  });

  describe('Cancel button behaviour', () => {
    it('closes the modal when Cancel is clicked and onCancel is not defined', async () => {
      const user = userEvent.setup();

      renderWithTheme(
        <MaterialReactTable
          columns={TEST_COLUMNS}
          data={[]}
          enableNewEntryButton
          localization={{
            close: CLOSE_LABEL,
            cancel: CANCEL_LABEL,
            save: SAVE_LABEL,
            newEntry: NEW_ENTRY_LABEL,
          }}
        />,
      );

      await openModal(user);

      await user.click(screen.getByRole('button', { name: CANCEL_LABEL }));

      // After cancel, modal title heading should be removed from the DOM.
      await waitFor(() => {
        expect(
          screen.queryByRole('heading', { name: NEW_ENTRY_LABEL }),
        ).not.toBeInTheDocument();
      });
    });

    it('calls onCancel before closing the modal when onCancel is defined', async () => {
      const onCancel = vi.fn();
      const user = userEvent.setup();

      renderWithTheme(
        <MaterialReactTable
          columns={TEST_COLUMNS}
          data={[]}
          enableNewEntryButton
          localization={{
            close: CLOSE_LABEL,
            cancel: CANCEL_LABEL,
            save: SAVE_LABEL,
            newEntry: NEW_ENTRY_LABEL,
          }}
          formConfig={{ onCancel }}
        />,
      );

      await openModal(user);

      await user.click(screen.getByRole('button', { name: CANCEL_LABEL }));

      // onCancel must be called once with form/table/mode props.
      await waitFor(() => {
        expect(onCancel).toHaveBeenCalledTimes(1);
        expect(onCancel).toHaveBeenCalledWith(
          expect.objectContaining({ mode: 'create' }),
        );
      });

      // Modal must also close automatically after onCancel resolves.
      await waitFor(() => {
        expect(
          screen.queryByRole('heading', { name: NEW_ENTRY_LABEL }),
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('renderSaveButton override', () => {
    it('renders the custom Save button instead of the default when renderSaveButton is provided', async () => {
      const CUSTOM_SAVE_LABEL = 'Kreiraj';
      const user = userEvent.setup();

      renderWithTheme(
        <MaterialReactTable
          columns={TEST_COLUMNS}
          data={[]}
          enableNewEntryButton
          localization={{
            close: CLOSE_LABEL,
            cancel: CANCEL_LABEL,
            save: SAVE_LABEL,
            newEntry: NEW_ENTRY_LABEL,
          }}
          formConfig={{
            onSave: vi.fn(),
            renderSaveButton: ({ handleAction }) => (
              <button onClick={handleAction}>{CUSTOM_SAVE_LABEL}</button>
            ),
          }}
        />,
      );

      await openModal(user);

      // Custom button is present; default Save label is absent.
      expect(
        screen.getByRole('button', { name: CUSTOM_SAVE_LABEL }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: SAVE_LABEL }),
      ).not.toBeInTheDocument();
    });

    it('calls onSave when renderSaveButton uses handleAction', async () => {
      const onSave = vi.fn();
      const user = userEvent.setup();

      renderWithTheme(
        <MaterialReactTable
          columns={TEST_COLUMNS}
          data={[]}
          enableNewEntryButton
          localization={{
            close: CLOSE_LABEL,
            cancel: CANCEL_LABEL,
            save: SAVE_LABEL,
            newEntry: NEW_ENTRY_LABEL,
          }}
          formConfig={{
            onSave,
            renderSaveButton: ({ handleAction }) => (
              <button onClick={handleAction}>Kreiraj</button>
            ),
          }}
        />,
      );

      await openModal(user);
      await user.click(screen.getByRole('button', { name: 'Kreiraj' }));

      await waitFor(() => {
        expect(onSave).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('renderCancelButton override', () => {
    it('renders the custom Cancel button instead of the default when renderCancelButton is provided', async () => {
      const CUSTOM_CANCEL_LABEL = 'Odustani';
      const user = userEvent.setup();

      renderWithTheme(
        <MaterialReactTable
          columns={TEST_COLUMNS}
          data={[]}
          enableNewEntryButton
          localization={{
            close: CLOSE_LABEL,
            cancel: CANCEL_LABEL,
            save: SAVE_LABEL,
            newEntry: NEW_ENTRY_LABEL,
          }}
          formConfig={{
            renderCancelButton: ({ handleAction }) => (
              <button onClick={handleAction}>{CUSTOM_CANCEL_LABEL}</button>
            ),
          }}
        />,
      );

      await openModal(user);

      // Custom cancel button is present; default Cancel label is absent.
      expect(
        screen.getByRole('button', { name: CUSTOM_CANCEL_LABEL }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: CANCEL_LABEL }),
      ).not.toBeInTheDocument();
    });

    it('closes the modal when renderCancelButton uses handleAction', async () => {
      const user = userEvent.setup();

      renderWithTheme(
        <MaterialReactTable
          columns={TEST_COLUMNS}
          data={[]}
          enableNewEntryButton
          localization={{
            close: CLOSE_LABEL,
            cancel: CANCEL_LABEL,
            save: SAVE_LABEL,
            newEntry: NEW_ENTRY_LABEL,
          }}
          formConfig={{
            renderCancelButton: ({ handleAction }) => (
              <button onClick={handleAction}>Odustani</button>
            ),
          }}
        />,
      );

      await openModal(user);
      await user.click(screen.getByRole('button', { name: 'Odustani' }));

      await waitFor(() => {
        expect(
          screen.queryByRole('heading', { name: NEW_ENTRY_LABEL }),
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('customActions', () => {
    it('renders custom action buttons in the modal footer', async () => {
      const DRAFT_LABEL = 'Sačuvaj nacrt';
      const user = userEvent.setup();

      renderWithTheme(
        <MaterialReactTable
          columns={TEST_COLUMNS}
          data={[]}
          enableNewEntryButton
          localization={{
            close: CLOSE_LABEL,
            cancel: CANCEL_LABEL,
            save: SAVE_LABEL,
            newEntry: NEW_ENTRY_LABEL,
          }}
          formConfig={{
            onSave: vi.fn(),
            customActions: [
              {
                key: 'draft',
                render: () => <button>{DRAFT_LABEL}</button>,
              },
            ],
          }}
        />,
      );

      await openModal(user);

      expect(
        screen.getByRole('button', { name: DRAFT_LABEL }),
      ).toBeInTheDocument();
    });

    it('renders multiple custom actions', async () => {
      const user = userEvent.setup();

      renderWithTheme(
        <MaterialReactTable
          columns={TEST_COLUMNS}
          data={[]}
          enableNewEntryButton
          localization={{
            close: CLOSE_LABEL,
            cancel: CANCEL_LABEL,
            save: SAVE_LABEL,
            newEntry: NEW_ENTRY_LABEL,
          }}
          formConfig={{
            onSave: vi.fn(),
            customActions: [
              { key: 'draft', render: () => <button>Nacrt</button> },
              { key: 'preview', render: () => <button>Pregled</button> },
            ],
          }}
        />,
      );

      await openModal(user);

      expect(screen.getByRole('button', { name: 'Nacrt' })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Pregled' }),
      ).toBeInTheDocument();
    });
  });
});
