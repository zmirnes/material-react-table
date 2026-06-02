import { MRT_Localization_HR } from '../../../../locales/hr';
import {
  DEFAULT_TEST_COLUMNS,
  DEFAULT_TEST_DATA,
  type MockRowData,
} from '../../../data/mock-data';
import { renderServerTable } from '../../../utils/renderServerTable';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

// Localization constants — avoids magic strings in assertions
const { toggleSelectRow, toggleSelectAll, rowsSelected } = MRT_Localization_HR;

// 'Bob' is unique in DEFAULT_TEST_DATA — safe to use as a load-complete signal
const LOAD_TIMEOUT_MS = 5_000;
const waitForTableToLoad = () =>
  screen.findByText('Bob', {}, { timeout: LOAD_TIMEOUT_MS });

// Returns all row-level select checkboxes (excludes the select-all checkbox in the header)
const getRowCheckboxes = (): HTMLElement[] =>
  screen.getAllByRole('checkbox', { name: toggleSelectRow });

// Returns the select-all checkbox in the table header
const getSelectAllCheckbox = (): HTMLElement =>
  screen.getByRole('checkbox', { name: toggleSelectAll });

// Builds the expected selection badge label for N selected rows
const buildSelectionBadgeText = (count: number): string =>
  rowsSelected.replace('{count}', count.toLocaleString('hr'));

describe('MRT_RowSelectionFlow — integration', () => {
  describe('checkbox rendering', () => {
    it('should render a checkbox for each data row when enableRowSelection is true', async () => {
      renderServerTable<MockRowData>({
        columns: DEFAULT_TEST_COLUMNS,
        data: DEFAULT_TEST_DATA,
        enableRowSelection: true,
      });

      await waitForTableToLoad();

      // One checkbox per data row — DEFAULT_TEST_DATA has 3 rows
      expect(getRowCheckboxes()).toHaveLength(DEFAULT_TEST_DATA.length);
    });

    it('should render the select-all checkbox in the header when enableRowSelection is true', async () => {
      renderServerTable<MockRowData>({
        columns: DEFAULT_TEST_COLUMNS,
        data: DEFAULT_TEST_DATA,
        enableRowSelection: true,
      });

      await waitForTableToLoad();

      expect(getSelectAllCheckbox()).toBeInTheDocument();
    });
  });

  describe('single row selection', () => {
    it('should check the checkbox after clicking it', async () => {
      const user = userEvent.setup();

      renderServerTable<MockRowData>({
        columns: DEFAULT_TEST_COLUMNS,
        data: DEFAULT_TEST_DATA,
        enableRowSelection: true,
      });

      await waitForTableToLoad();

      const [firstCheckbox] = getRowCheckboxes();

      expect(firstCheckbox).not.toBeChecked();

      await user.click(firstCheckbox);

      await waitFor(() => expect(firstCheckbox).toBeChecked());
    });

    it('should uncheck the checkbox after clicking a selected row again', async () => {
      const user = userEvent.setup();

      renderServerTable<MockRowData>({
        columns: DEFAULT_TEST_COLUMNS,
        data: DEFAULT_TEST_DATA,
        enableRowSelection: true,
      });

      await waitForTableToLoad();

      const [firstCheckbox] = getRowCheckboxes();

      await user.click(firstCheckbox);
      await waitFor(() => expect(firstCheckbox).toBeChecked());

      await user.click(firstCheckbox);
      await waitFor(() => expect(firstCheckbox).not.toBeChecked());
    });

    it('should allow selecting multiple rows independently', async () => {
      const user = userEvent.setup();

      renderServerTable<MockRowData>({
        columns: DEFAULT_TEST_COLUMNS,
        data: DEFAULT_TEST_DATA,
        enableRowSelection: true,
      });

      await waitForTableToLoad();

      const [firstCheckbox, secondCheckbox] = getRowCheckboxes();

      await user.click(firstCheckbox);
      await user.click(secondCheckbox);

      await waitFor(() => {
        expect(firstCheckbox).toBeChecked();
        expect(secondCheckbox).toBeChecked();
      });
    });
  });

  describe('select-all behaviour', () => {
    it('should check all row checkboxes when the select-all checkbox is clicked', async () => {
      const user = userEvent.setup();

      renderServerTable<MockRowData>({
        columns: DEFAULT_TEST_COLUMNS,
        data: DEFAULT_TEST_DATA,
        enableRowSelection: true,
      });

      await waitForTableToLoad();

      await user.click(getSelectAllCheckbox());

      await waitFor(() => {
        for (const checkbox of getRowCheckboxes()) {
          expect(checkbox).toBeChecked();
        }
      });
    });

    it('should uncheck all row checkboxes when the select-all checkbox is clicked again', async () => {
      const user = userEvent.setup();

      renderServerTable<MockRowData>({
        columns: DEFAULT_TEST_COLUMNS,
        data: DEFAULT_TEST_DATA,
        enableRowSelection: true,
      });

      await waitForTableToLoad();

      // Select all, then deselect all
      await user.click(getSelectAllCheckbox());
      await waitFor(() =>
        getRowCheckboxes().forEach((cb) => expect(cb).toBeChecked()),
      );

      await user.click(getSelectAllCheckbox());
      await waitFor(() =>
        getRowCheckboxes().forEach((cb) => expect(cb).not.toBeChecked()),
      );
    });
  });

  describe('selection count badge', () => {
    it('should not show the selection badge when no rows are selected', async () => {
      renderServerTable<MockRowData>({
        columns: DEFAULT_TEST_COLUMNS,
        data: DEFAULT_TEST_DATA,
        enableRowSelection: true,
      });

      await waitForTableToLoad();

      // Badge only renders when selectedCount > 0
      expect(
        screen.queryByText(buildSelectionBadgeText(1)),
      ).not.toBeInTheDocument();
    });

    it('should show the selection badge with count 1 after selecting one row', async () => {
      const user = userEvent.setup();

      renderServerTable<MockRowData>({
        columns: DEFAULT_TEST_COLUMNS,
        data: DEFAULT_TEST_DATA,
        enableRowSelection: true,
      });

      await waitForTableToLoad();

      await user.click(getRowCheckboxes()[0]);

      await waitFor(() =>
        expect(
          screen.getByText(buildSelectionBadgeText(1)),
        ).toBeInTheDocument(),
      );
    });

    it('should update the badge count as more rows are selected', async () => {
      const user = userEvent.setup();

      renderServerTable<MockRowData>({
        columns: DEFAULT_TEST_COLUMNS,
        data: DEFAULT_TEST_DATA,
        enableRowSelection: true,
      });

      await waitForTableToLoad();

      const checkboxes = getRowCheckboxes();

      await user.click(checkboxes[0]);
      await waitFor(() =>
        expect(
          screen.getByText(buildSelectionBadgeText(1)),
        ).toBeInTheDocument(),
      );

      await user.click(checkboxes[1]);
      await waitFor(() =>
        expect(
          screen.getByText(buildSelectionBadgeText(2)),
        ).toBeInTheDocument(),
      );
    });

    it('should hide the badge after deselecting all rows', async () => {
      const user = userEvent.setup();

      renderServerTable<MockRowData>({
        columns: DEFAULT_TEST_COLUMNS,
        data: DEFAULT_TEST_DATA,
        enableRowSelection: true,
      });

      await waitForTableToLoad();

      const [firstCheckbox] = getRowCheckboxes();

      await user.click(firstCheckbox);
      await waitFor(() =>
        expect(
          screen.getByText(buildSelectionBadgeText(1)),
        ).toBeInTheDocument(),
      );

      await user.click(firstCheckbox);
      await waitFor(() =>
        expect(
          screen.queryByText(buildSelectionBadgeText(1)),
        ).not.toBeInTheDocument(),
      );
    });
  });

  describe('initial selection state', () => {
    it('should pre-check rows that are in initialState.rowSelection', async () => {
      renderServerTable<MockRowData>({
        columns: DEFAULT_TEST_COLUMNS,
        data: DEFAULT_TEST_DATA,
        enableRowSelection: true,
        initialState: {
          rowSelection: { [DEFAULT_TEST_DATA[0].id]: true },
        },
      });

      await waitForTableToLoad();

      const [firstCheckbox, secondCheckbox] = getRowCheckboxes();

      expect(firstCheckbox).toBeChecked();
      expect(secondCheckbox).not.toBeChecked();
    });
  });
});
