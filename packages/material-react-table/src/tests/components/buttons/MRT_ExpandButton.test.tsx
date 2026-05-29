import { MRT_Localization_HR } from '../../../locales/hr';
import {
  DEFAULT_TEST_COLUMNS,
  DEFAULT_TEST_DATA,
  type MockRowData,
} from '../../data/mock-data';
import {
  groupTableByColumn,
  renderServerTable,
} from '../../utils/renderServerTable';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event/dist/cjs/index.js';
import { describe, expect, it } from 'vitest';

// Helper: renders the table and groups by First Name — shared by all tests in this suite
const setupGroupedTableByFirstName = async () => {
  const user = userEvent.setup();
  renderServerTable<MockRowData>({
    columns: DEFAULT_TEST_COLUMNS,
    data: DEFAULT_TEST_DATA,
  });
  await groupTableByColumn(user, 'First Name');
  return user;
};

// Helper: returns the expand button scoped to the first group row
const getFirstGroupRowExpandButton = () => {
  const firstGroupRow = screen.getByTestId('body-row-0');
  return within(firstGroupRow).getByRole('button', {
    name: MRT_Localization_HR.expand,
  });
};

describe('MRT_ExpandButton', () => {
  it('renders an expand button on the first group row after grouping by First Name', async () => {
    await setupGroupedTableByFirstName();

    const expandButton = getFirstGroupRowExpandButton();
    expect(expandButton).toBeInTheDocument();
  });

  it('reveals child data rows after clicking the expand button on the first group row', async () => {
    const user = await setupGroupedTableByFirstName();

    // Get the name of the first group to count its expected child rows
    const firstGroupRow = screen.getByTestId('body-row-0');
    const firstGroupName =
      within(firstGroupRow).getByTestId('group-cell-value').textContent ?? '';
    const firstGroupChildRowCount = DEFAULT_TEST_DATA.filter(
      (row) => row.firstName === firstGroupName,
    ).length;

    await user.click(getFirstGroupRowExpandButton());

    // Count unique firstName values — each unique value is one group header row
    const uniqueFirstNameCount = new Set(
      DEFAULT_TEST_DATA.map((row) => row.firstName),
    ).size;
    // Total expected rows: 1 header row + group rows + child rows of the expanded group
    const HEADER_ROW_COUNT = 1;
    const expectedTotalRowCount =
      HEADER_ROW_COUNT + uniqueFirstNameCount + firstGroupChildRowCount;

    await waitFor(() => {
      expect(screen.getAllByRole('row')).toHaveLength(expectedTotalRowCount);
    });
  });

  it('hides child data rows after collapsing a previously expanded group row', async () => {
    const user = await setupGroupedTableByFirstName();

    // Get the name of the first group to count its expected child rows
    const firstGroupRow = screen.getByTestId('body-row-0');
    const firstGroupName =
      within(firstGroupRow).getByTestId('group-cell-value').textContent ?? '';
    const firstGroupChildRowCount = DEFAULT_TEST_DATA.filter(
      (row) => row.firstName === firstGroupName,
    ).length;

    const uniqueFirstNameCount = new Set(
      DEFAULT_TEST_DATA.map((row) => row.firstName),
    ).size;
    const HEADER_ROW_COUNT = 1;

    // Expand the first group row and verify child rows are visible
    await user.click(getFirstGroupRowExpandButton());
    const expectedExpandedRowCount =
      HEADER_ROW_COUNT + uniqueFirstNameCount + firstGroupChildRowCount;
    await waitFor(() => {
      expect(screen.getAllByRole('row')).toHaveLength(expectedExpandedRowCount);
    });

    // Collapse the first group row and verify child rows are hidden
    await user.click(getFirstGroupRowExpandButton());
    const expectedCollapsedRowCount = HEADER_ROW_COUNT + uniqueFirstNameCount;
    await waitFor(() => {
      expect(screen.getAllByRole('row')).toHaveLength(
        expectedCollapsedRowCount,
      );
    });
  });
});
