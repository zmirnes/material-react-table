import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { MaterialReactTable } from '../../../../components/MaterialReactTable';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

// A minimal MUI theme required because MRT components call useTheme() internally.
const DEFAULT_THEME = createTheme();

// Shape of one data row — content is irrelevant for modal flow tests.
// Index signature is required to satisfy the MRT_RowData constraint.
interface Person {
  [key: string]: unknown;
  age: number;
  name: string;
}

// Static test rows — only needed so the table renders without warnings.
const TEST_DATA: Person[] = [
  { age: 30, name: 'Alice' },
  { age: 25, name: 'Bob' },
];

// Column definitions matching the Person shape.
// type is required by MRT_NonIconColumnDef — it drives filtering and cell rendering behaviour.
const TEST_COLUMNS = [
  { accessorKey: 'name' as const, header: 'Name', type: 'string' as const },
  { accessorKey: 'age' as const, header: 'Age', type: 'number' as const },
];

// Localization text constants used in assertions — avoids magic strings in tests.
const NEW_ENTRY_LABEL = 'New Entry';

// The EN localization does not include a 'close' key by default, so the close
// IconButton would receive aria-label={undefined} and be invisible to role queries.
// We define the string here and pass it explicitly to MaterialReactTable.
const CLOSE_LABEL = 'Close';

// Wraps the given element in a MUI ThemeProvider.
// Required because MaterialReactTable calls useTheme() deep in its component tree.
const renderWithTheme = (ui: React.ReactElement) =>
  render(<ThemeProvider theme={DEFAULT_THEME}>{ui}</ThemeProvider>);

// Renders the full MaterialReactTable with the new-entry feature enabled.
// Returns the userEvent instance so each test can perform interactions.
const setupTable = () => {
  // userEvent.setup() simulates realistic browser interactions (focus, hover, click).
  // Unlike fireEvent, it dispatches the full sequence of events a real user would trigger.
  const user = userEvent.setup();

  renderWithTheme(
    <MaterialReactTable
      columns={TEST_COLUMNS}
      data={TEST_DATA}
      // Renders the "New Entry" button inside MRT_ToolbarInternalButtons.
      enableNewEntryButton
      // Supply 'close' so MRT_NewEntryModal can set aria-label on the close IconButton.
      localization={{ close: CLOSE_LABEL }}
    />,
  );

  return { user };
};

describe('MRT_NewEntryModal — integration flow', () => {
  describe('opening the modal', () => {
    it('modal is not visible before any user interaction', () => {
      setupTable();

      // MRT_TableContainer renders MRT_NewEntryModal only when newEntryModal.open is true.
      // On initial render the state is { open: false } — only the toolbar button is present.
      // Exactly one element contains "New Entry" text: the toolbar button itself.
      expect(screen.getAllByText(NEW_ENTRY_LABEL)).toHaveLength(1);
    });

    it('opens the modal when the toolbar "New Entry" button is clicked', async () => {
      const { user } = setupTable();

      // MRT_NewEntryButton calls table.setNewEntryModal({ open: true }) on click.
      // That triggers a state update inside useMRT_TableInstance.
      // MRT_TableContainer re-renders and mounts MRT_NewEntryModal.
      await user.click(screen.getByRole('button', { name: NEW_ENTRY_LABEL }));

      // After opening, "New Entry" text appears in two places:
      // 1. The toolbar button text.
      // 2. The modal header Typography h6 title.
      // Note: MUI Modal uses role="presentation", not role="dialog" — we assert on text.
      await waitFor(() => {
        expect(
          screen.getAllByText(NEW_ENTRY_LABEL).length,
        ).toBeGreaterThanOrEqual(2);
      });
    });

    it('shows the "New Entry" heading inside the modal header after opening', async () => {
      const { user } = setupTable();

      await user.click(screen.getByRole('button', { name: NEW_ENTRY_LABEL }));

      // The Typography h6 inside MRT_NewEntryModal renders as a heading element.
      // getByRole('heading') finds it without ambiguity with the toolbar button.
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: NEW_ENTRY_LABEL }),
        ).toBeInTheDocument();
      });
    });
  });

  describe('closing the modal', () => {
    it('removes the modal title from the DOM after clicking the close (X) button', async () => {
      const { user } = setupTable();

      // Step 1 — open the modal.
      await user.click(screen.getByRole('button', { name: NEW_ENTRY_LABEL }));
      await waitFor(() => {
        // Modal is open — title appears in the heading AND the toolbar button.
        expect(
          screen.getAllByText(NEW_ENTRY_LABEL).length,
        ).toBeGreaterThanOrEqual(2);
      });

      // Step 2 — click the X IconButton whose aria-label is localization.close.
      // MRT_NewEntryModal calls handleClose() → table.setNewEntryModal({ open: false }).
      // MRT_TableContainer stops rendering MRT_NewEntryModal — heading leaves the DOM.
      await user.click(screen.getByRole('button', { name: CLOSE_LABEL }));

      // After closing, only the toolbar button remains — exactly one "New Entry" element.
      await waitFor(() => {
        expect(screen.getAllByText(NEW_ENTRY_LABEL)).toHaveLength(1);
      });
    });

    it('modal can be reopened after being closed', async () => {
      const { user } = setupTable();

      // Open → verify open.
      await user.click(screen.getByRole('button', { name: NEW_ENTRY_LABEL }));
      await waitFor(() =>
        expect(
          screen.getAllByText(NEW_ENTRY_LABEL).length,
        ).toBeGreaterThanOrEqual(2),
      );

      // Close → verify closed.
      await user.click(screen.getByRole('button', { name: CLOSE_LABEL }));
      await waitFor(() =>
        expect(screen.getAllByText(NEW_ENTRY_LABEL)).toHaveLength(1),
      );

      // Reopen → verify open again — confirms the state cycle is repeatable.
      await user.click(screen.getByRole('button', { name: NEW_ENTRY_LABEL }));
      await waitFor(() =>
        expect(
          screen.getAllByText(NEW_ENTRY_LABEL).length,
        ).toBeGreaterThanOrEqual(2),
      );
    });
  });
});
