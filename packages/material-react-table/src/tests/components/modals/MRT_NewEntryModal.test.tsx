import React from 'react';
import CancelIcon from '@mui/icons-material/Cancel';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { MRT_NewEntryModal } from '../../../components/modals/MRT_NewEntryModal';
import {
  type MRT_NewEntryModalOverrides,
  type MRT_NewEntryModalState,
  type MRT_TableInstance,
} from '../../../types';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// A default MUI theme used to satisfy useTheme() inside the component.
const DEFAULT_THEME = createTheme();

// Wraps the given UI element in a MUI ThemeProvider so useTheme() works in tests.
const renderWithTheme = (ui: React.ReactElement) =>
  render(<ThemeProvider theme={DEFAULT_THEME}>{ui}</ThemeProvider>);

// Minimal localization object containing only the keys used by MRT_NewEntryModal.
const MOCK_LOCALIZATION = {
  close: 'Close',
  edit: 'Edit',
  newEntry: 'New Entry',
};

// Options accepted by buildMockTable to configure test scenarios.
interface MockTableConfig {
  // Controls what the modal state looks like (open/close, mode, initialValues).
  newEntryModalState?: MRT_NewEntryModalState;
  // Passed directly to muiNewEntryModalProps to test style/behaviour overrides.
  muiNewEntryModalProps?: MRT_NewEntryModalOverrides;
  // When provided, sets formConfig.renderModal to delegate rendering.
  renderModalFn?: (args: {
    table: MRT_TableInstance<Record<string, unknown>>;
  }) => React.ReactNode;
}

// Builds a minimal MRT_TableInstance mock that satisfies MRT_NewEntryModal's needs.
// Returns both the table instance and the setNewEntryModal spy for assertion.
const buildMockTable = ({
  newEntryModalState = { open: true },
  muiNewEntryModalProps,
  renderModalFn,
}: MockTableConfig = {}): {
  table: MRT_TableInstance<Record<string, unknown>>;
  setNewEntryModal: ReturnType<typeof vi.fn>;
} => {
  const setNewEntryModal = vi.fn();

  // Cast to unknown first to avoid having to satisfy the full MRT_TableInstance shape.
  const table = {
    getState: () => ({ newEntryModal: newEntryModalState }),
    options: {
      formConfig: renderModalFn ? { renderModal: renderModalFn } : undefined,
      icons: { CancelIcon },
      localization: MOCK_LOCALIZATION,
      muiNewEntryModalProps,
    },
    setNewEntryModal,
  } as unknown as MRT_TableInstance<Record<string, unknown>>;

  return { setNewEntryModal, table };
};

describe('MRT_NewEntryModal', () => {
  describe('renderModal delegation', () => {
    it('renders the output of formConfig.renderModal instead of the built-in modal', () => {
      // Arrange — consumer provides a custom renderModal that returns a sentinel element.
      const CUSTOM_CONTENT_TEST_ID = 'custom-render-modal';
      const renderModalFn = () => <div data-testid={CUSTOM_CONTENT_TEST_ID} />;
      const { table } = buildMockTable({ renderModalFn });

      // Act
      renderWithTheme(<MRT_NewEntryModal table={table} />);

      // Assert — custom content is rendered; built-in modal title is absent.
      expect(screen.getByTestId(CUSTOM_CONTENT_TEST_ID)).toBeInTheDocument();
      expect(
        screen.queryByText(MOCK_LOCALIZATION.newEntry),
      ).not.toBeInTheDocument();
    });
  });

  describe('title resolution', () => {
    it('shows the "New Entry" localization key when mode is "create"', () => {
      const { table } = buildMockTable({
        newEntryModalState: { mode: 'create', open: true },
      });
      renderWithTheme(<MRT_NewEntryModal table={table} />);
      expect(screen.getByText(MOCK_LOCALIZATION.newEntry)).toBeInTheDocument();
    });

    it('shows the "New Entry" localization key when mode is not specified', () => {
      // mode defaults to create when undefined.
      const { table } = buildMockTable({ newEntryModalState: { open: true } });
      renderWithTheme(<MRT_NewEntryModal table={table} />);
      expect(screen.getByText(MOCK_LOCALIZATION.newEntry)).toBeInTheDocument();
    });

    it('shows the "Edit" localization key when mode is "edit"', () => {
      const { table } = buildMockTable({
        newEntryModalState: { mode: 'edit', open: true },
      });
      renderWithTheme(<MRT_NewEntryModal table={table} />);
      expect(screen.getByText(MOCK_LOCALIZATION.edit)).toBeInTheDocument();
    });

    it('shows the custom title override from muiNewEntryModalProps when provided', () => {
      const CUSTOM_TITLE = 'Add New Product';
      const { table } = buildMockTable({
        muiNewEntryModalProps: { title: CUSTOM_TITLE },
        newEntryModalState: { open: true },
      });

      renderWithTheme(<MRT_NewEntryModal table={table} />);

      // Custom title overrides both create and edit localization keys.
      expect(screen.getByText(CUSTOM_TITLE)).toBeInTheDocument();
      expect(
        screen.queryByText(MOCK_LOCALIZATION.newEntry),
      ).not.toBeInTheDocument();
    });
  });

  describe('close button behaviour', () => {
    it('calls setNewEntryModal with { open: false } when the close button is clicked', async () => {
      const { setNewEntryModal, table } = buildMockTable();

      renderWithTheme(<MRT_NewEntryModal table={table} />);

      // Find the close button by its aria-label set from localization.close.
      const closeButton = screen.getByRole('button', {
        name: MOCK_LOCALIZATION.close,
      });
      // await act so that the async onClick microtask resolves before asserting.
      await act(async () => {
        fireEvent.click(closeButton);
      });

      // setNewEntryModal must be called once with the closed state.
      expect(setNewEntryModal).toHaveBeenCalledTimes(1);
      expect(setNewEntryModal).toHaveBeenCalledWith({ open: false });
    });

    it('invokes closeButtonProps.onClick before closing the modal', async () => {
      const customOnClick = vi.fn();
      const { setNewEntryModal, table } = buildMockTable({
        muiNewEntryModalProps: { closeButtonProps: { onClick: customOnClick } },
      });

      renderWithTheme(<MRT_NewEntryModal table={table} />);

      const closeButton = screen.getByRole('button', {
        name: MOCK_LOCALIZATION.close,
      });
      // await act so that the async onClick microtask resolves before asserting.
      await act(async () => {
        fireEvent.click(closeButton);
      });

      // Consumer's onClick is called before the built-in close handler.
      expect(customOnClick).toHaveBeenCalledTimes(1);
      expect(setNewEntryModal).toHaveBeenCalledWith({ open: false });
    });

    it('does not close the modal when closeButtonProps.onClick calls e.preventDefault()', async () => {
      // Consumer calls e.preventDefault() to prevent the built-in close handler.
      const customOnClick = vi.fn((e: React.MouseEvent) => e.preventDefault());
      const { setNewEntryModal, table } = buildMockTable({
        muiNewEntryModalProps: { closeButtonProps: { onClick: customOnClick } },
      });

      renderWithTheme(<MRT_NewEntryModal table={table} />);

      const closeButton = screen.getByRole('button', {
        name: MOCK_LOCALIZATION.close,
      });
      // await act so that the async onClick microtask resolves before asserting.
      await act(async () => {
        fireEvent.click(closeButton);
      });

      // Consumer's onClick is still invoked.
      expect(customOnClick).toHaveBeenCalledTimes(1);
      // setNewEntryModal must NOT be called because default was prevented.
      expect(setNewEntryModal).not.toHaveBeenCalled();
    });
  });

  describe('header visibility', () => {
    it('renders the header by default', () => {
      const { table } = buildMockTable();
      renderWithTheme(<MRT_NewEntryModal table={table} />);
      // Title is the reliable indicator that the header section is present.
      expect(screen.getByText(MOCK_LOCALIZATION.newEntry)).toBeInTheDocument();
    });

    it('hides the entire header when disableHeader is true', () => {
      const { table } = buildMockTable({
        muiNewEntryModalProps: { disableHeader: true },
      });

      renderWithTheme(<MRT_NewEntryModal table={table} />);

      // Neither title nor close button should be present.
      expect(
        screen.queryByText(MOCK_LOCALIZATION.newEntry),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: MOCK_LOCALIZATION.close }),
      ).not.toBeInTheDocument();
    });
  });

  describe('headerComponents', () => {
    it('renders additional components inside the header when headerComponents is provided', () => {
      const HEADER_BADGE_TEST_ID = 'header-badge';
      const { table } = buildMockTable({
        muiNewEntryModalProps: {
          headerComponents: (
            <span data-testid={HEADER_BADGE_TEST_ID}>Required</span>
          ),
        },
      });

      renderWithTheme(<MRT_NewEntryModal table={table} />);

      // The custom header element must be present alongside the title.
      expect(screen.getByTestId(HEADER_BADGE_TEST_ID)).toBeInTheDocument();
      expect(screen.getByText(MOCK_LOCALIZATION.newEntry)).toBeInTheDocument();
    });
  });
});
