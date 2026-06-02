import { MaterialReactServerTable } from '../../../../components/MaterialReactServerTable';
import { MRT_Localization_HR } from '../../../../locales/hr';
import {
  DEFAULT_TEST_COLUMNS,
  type MockRowData,
} from '../../../data/mock-data';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

// Localization constants — avoids magic strings in assertions
const {
  goToNextPage,
  goToPreviousPage,
  rowsPerPage: rowsPerPageLabel,
} = MRT_Localization_HR;

// 5 000 ms timeout guards against slow environments when running in parallel with other test files
const LOAD_TIMEOUT_MS = 5_000;

// Default page size used by the hook when no initialState is provided
const DEFAULT_PAGE_SIZE = 10;

// Total row count large enough to produce multiple pages with the default page size
const MULTI_PAGE_ROW_COUNT = 50;

// Builds rows with enough entries to fill multiple pages — data content is irrelevant for pagination tests
const buildRows = (count: number): MockRowData[] =>
  Array.from({ length: count }, (_, i) => ({
    id: String(i + 1),
    firstName: `First${i + 1}`,
    lastName: `Last${i + 1}`,
    city: `City${i + 1}`,
  }));

// Renders a MaterialReactServerTable configured for pagination tests.
// Uses a real loadData so the table transitions out of skeleton/loading state.
// rowCount controls how many total rows the table believes exist (determines page count).
const renderPaginatedTable = ({
  pageSize = DEFAULT_PAGE_SIZE,
  rowCount = MULTI_PAGE_ROW_COUNT,
}: {
  pageSize?: number;
  rowCount?: number;
} = {}) => {
  const rows = buildRows(pageSize);

  render(
    <MaterialReactServerTable<MockRowData>
      loadConfig={async () => ({
        columns: DEFAULT_TEST_COLUMNS,
        initialState: { pagination: { pageIndex: 0, pageSize } },
      })}
      loadData={async () => ({ data: rows, rowCount })}
      saveState={async () => {}}
    />,
  );
};

// Waits for the table to finish loading by finding a cell from the first rendered page
const waitForTableToLoad = () =>
  screen.findByText('First1', {}, { timeout: LOAD_TIMEOUT_MS });

describe('MRT_PaginationFlow — integration', () => {
  describe('pagination controls rendering', () => {
    it('should render the "next page" button', async () => {
      renderPaginatedTable();

      await waitForTableToLoad();

      expect(
        screen.getByRole('button', { name: goToNextPage }),
      ).toBeInTheDocument();
    });

    it('should render the "previous page" button', async () => {
      renderPaginatedTable();

      await waitForTableToLoad();

      expect(
        screen.getByRole('button', { name: goToPreviousPage }),
      ).toBeInTheDocument();
    });

    it('should render the rows-per-page selector', async () => {
      renderPaginatedTable();

      await waitForTableToLoad();

      // The InputLabel for the rows-per-page select uses rowsPerPageLabel as its text
      expect(screen.getByText(rowsPerPageLabel)).toBeInTheDocument();
    });
  });

  describe('button disabled states', () => {
    it('should disable the "previous page" button when on the first page', async () => {
      renderPaginatedTable();

      await waitForTableToLoad();

      expect(
        screen.getByRole('button', { name: goToPreviousPage }),
      ).toBeDisabled();
    });

    it('should enable the "next page" button when there are more pages', async () => {
      // rowCount=50 with pageSize=10 → 5 pages → next is enabled on page 1
      renderPaginatedTable({ rowCount: MULTI_PAGE_ROW_COUNT });

      await waitForTableToLoad();

      expect(
        screen.getByRole('button', { name: goToNextPage }),
      ).not.toBeDisabled();
    });

    it('should disable the "next page" button when total rows fit on a single page', async () => {
      // rowCount=5 with pageSize=10 → 1 page → next must be disabled
      renderPaginatedTable({ pageSize: 10, rowCount: 5 });

      await waitForTableToLoad();

      expect(screen.getByRole('button', { name: goToNextPage })).toBeDisabled();
    });
  });

  describe('navigation interactions', () => {
    it('should enable the "previous page" button after clicking "next page"', async () => {
      const user = userEvent.setup();

      renderPaginatedTable();

      await waitForTableToLoad();

      // "Previous page" must be disabled before navigating
      expect(
        screen.getByRole('button', { name: goToPreviousPage }),
      ).toBeDisabled();

      await user.click(screen.getByRole('button', { name: goToNextPage }));

      // After moving to page 2, "previous page" should become enabled
      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: goToPreviousPage }),
        ).not.toBeDisabled(),
      );
    });

    it('should disable the "previous page" button again after navigating back to the first page', async () => {
      const user = userEvent.setup();

      renderPaginatedTable();

      await waitForTableToLoad();

      // Go to page 2 then back to page 1
      await user.click(screen.getByRole('button', { name: goToNextPage }));
      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: goToPreviousPage }),
        ).not.toBeDisabled(),
      );

      await user.click(screen.getByRole('button', { name: goToPreviousPage }));

      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: goToPreviousPage }),
        ).toBeDisabled(),
      );
    });
  });

  describe('rows-per-page selector', () => {
    it('should display the current page size as the selected value in the rows-per-page selector', async () => {
      renderPaginatedTable({ pageSize: DEFAULT_PAGE_SIZE });

      await waitForTableToLoad();

      // MUI Select (non-native) renders the selected value as visible text inside
      // the combobox container rather than as a DOM value attribute — check textContent
      const select = screen.getByRole('combobox', { name: rowsPerPageLabel });
      expect(select).toHaveTextContent(String(DEFAULT_PAGE_SIZE));
    });
  });

  describe('row count display', () => {
    it('should display the total row count in the pagination area', async () => {
      renderPaginatedTable({ rowCount: MULTI_PAGE_ROW_COUNT });

      await waitForTableToLoad();

      // MRT_TablePagination renders total rows in a span[data-testid="total-rows-count"]
      const countDisplay = await screen.findByTestId('total-rows-count');
      expect(countDisplay).toHaveTextContent(String(MULTI_PAGE_ROW_COUNT));
    });
  });
});
