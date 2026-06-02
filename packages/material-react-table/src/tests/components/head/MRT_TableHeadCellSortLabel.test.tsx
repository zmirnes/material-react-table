import {
  DEFAULT_TEST_COLUMNS,
  DEFAULT_TEST_DATA,
  type MockRowData,
} from '../../data/mock-data';
import { renderServerTable } from '../../utils/renderServerTable';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

// 'Bob' is unique in DEFAULT_TEST_DATA — safe to use as a load-complete signal.
// Using 'Alice' would throw because Alice appears in two rows.
const LOAD_TIMEOUT_MS = 5000;
const waitForTableToLoad = () =>
  screen.findByText('Bob', {}, { timeout: LOAD_TIMEOUT_MS });

// MRT sets data-testid="header-cell-{columnId}" on every th element.
// There may be two th elements per column (regular + sticky header row).
// The sticky one carries aria-sort and the sort label button — we use it for
// all sort-related assertions.
const getStickyHeaderCell = (columnId: string): HTMLElement => {
  const cells = Array.from(
    document.querySelectorAll(`[data-testid="header-cell-${columnId}"]`),
  ) as HTMLElement[];

  // The sticky header cell has the MuiTableCell-stickyHeader CSS class
  return (
    cells.find((cell) =>
      cell.classList.contains('MuiTableCell-stickyHeader'),
    ) ?? cells[0]
  );
};

// Returns the MUI TableSortLabel element (role="button") inside a header cell.
// This is more reliable than querying by role because a header cell can contain
// multiple buttons (sort, filter, column-actions).
const getSortLabelElement = (headerCell: HTMLElement): HTMLElement | null =>
  headerCell.querySelector('.MuiTableSortLabel-root');

describe('MRT_TableHeadCellSortLabel', () => {
  describe('initial render', () => {
    it('should render a sort label inside the header cell when the column is sortable', async () => {
      renderServerTable<MockRowData>({
        columns: DEFAULT_TEST_COLUMNS,
        data: DEFAULT_TEST_DATA,
      });

      await waitForTableToLoad();

      const headerCell = getStickyHeaderCell('firstName');
      expect(getSortLabelElement(headerCell)).not.toBeNull();
    });

    it('should not render a sort label for a column with enableSorting: false', async () => {
      const columnsNoSort = DEFAULT_TEST_COLUMNS.map((col) =>
        col.accessorKey === 'firstName'
          ? { ...col, enableSorting: false }
          : col,
      );

      renderServerTable<MockRowData>({
        columns: columnsNoSort,
        data: DEFAULT_TEST_DATA,
      });

      await waitForTableToLoad();

      const headerCell = getStickyHeaderCell('firstName');
      expect(getSortLabelElement(headerCell)).toBeNull();
    });
  });

  describe('sort interaction', () => {
    it('should update aria-sort on the header cell when the sort label is clicked', async () => {
      const user = userEvent.setup();

      renderServerTable<MockRowData>({
        columns: DEFAULT_TEST_COLUMNS,
        data: DEFAULT_TEST_DATA,
      });

      await waitForTableToLoad();

      const headerCell = getStickyHeaderCell('firstName');
      const sortLabel = getSortLabelElement(headerCell)!;

      // Initial state — column is not sorted
      expect(headerCell).toHaveAttribute('aria-sort', 'none');

      // First click — ascending
      await user.click(sortLabel);
      await waitFor(() =>
        expect(headerCell).toHaveAttribute('aria-sort', 'ascending'),
      );

      // Second click — descending
      await user.click(sortLabel);
      await waitFor(() =>
        expect(headerCell).toHaveAttribute('aria-sort', 'descending'),
      );
    });

    it('should remove the sort on the third click when enableSortingRemoval is true (default)', async () => {
      const user = userEvent.setup();

      renderServerTable<MockRowData>({
        columns: DEFAULT_TEST_COLUMNS,
        data: DEFAULT_TEST_DATA,
      });

      await waitForTableToLoad();

      const headerCell = getStickyHeaderCell('firstName');
      const sortLabel = getSortLabelElement(headerCell)!;

      await user.click(sortLabel); // asc
      await waitFor(() =>
        expect(headerCell).toHaveAttribute('aria-sort', 'ascending'),
      );

      await user.click(sortLabel); // desc
      await waitFor(() =>
        expect(headerCell).toHaveAttribute('aria-sort', 'descending'),
      );

      await user.click(sortLabel); // sort removed
      await waitFor(() =>
        expect(headerCell).toHaveAttribute('aria-sort', 'none'),
      );
    });
  });

  describe('initial sort state', () => {
    it('should reflect aria-sort ascending when initialState has the column sorted asc', async () => {
      renderServerTable<MockRowData>({
        columns: DEFAULT_TEST_COLUMNS,
        data: DEFAULT_TEST_DATA,
        initialState: { sorting: [{ id: 'firstName', desc: false }] },
      });

      await waitForTableToLoad();

      const headerCell = getStickyHeaderCell('firstName');
      expect(headerCell).toHaveAttribute('aria-sort', 'ascending');
    });

    it('should reflect aria-sort descending when initialState has the column sorted desc', async () => {
      renderServerTable<MockRowData>({
        columns: DEFAULT_TEST_COLUMNS,
        data: DEFAULT_TEST_DATA,
        initialState: { sorting: [{ id: 'firstName', desc: true }] },
      });

      await waitForTableToLoad();

      const headerCell = getStickyHeaderCell('firstName');
      expect(headerCell).toHaveAttribute('aria-sort', 'descending');
    });
  });
});
