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

describe('MRT_ExpandAllButton', () => {
  it('displays first group row label with correct count after grouping by First Name and expanding all', async () => {
    const user = userEvent.setup();
    renderServerTable<MockRowData>({
      columns: DEFAULT_TEST_COLUMNS,
      data: DEFAULT_TEST_DATA,
    });
    await groupTableByColumn(user, 'First Name');
    const expandAllButton = screen.getByTestId('header-cell-mrt-row-expand');
    expect(expandAllButton).toBeInTheDocument();

    const firstTableBodyRow = screen.getByTestId('body-row-0');
    const renderedGroupName =
      within(firstTableBodyRow).getByTestId('group-cell-value').textContent ??
      '';
    const renderedGroupCount = Number(
      within(firstTableBodyRow).getByTestId('group-cell-count').textContent ??
        0,
    );

    // Count how many rows in test data match the rendered group name
    const expectedCountForRenderedGroup = DEFAULT_TEST_DATA.filter(
      (row) => row.firstName === renderedGroupName,
    ).length;
    expect(renderedGroupCount).toBe(expectedCountForRenderedGroup);
  });

  it('renders correct number of rows after expanding all grouped rows', async () => {
    const user = userEvent.setup();
    renderServerTable<MockRowData>({
      columns: DEFAULT_TEST_COLUMNS,
      data: DEFAULT_TEST_DATA,
    });
    await groupTableByColumn(user, 'First Name');
    const expandAllHeaderCell = screen.getByTestId(
      'header-cell-mrt-row-expand',
    );
    expect(expandAllHeaderCell).toBeInTheDocument();
    const expandAllIconButton = within(expandAllHeaderCell).getByRole(
      'button',
      {
        name: MRT_Localization_HR.expandAll,
      },
    );
    await user.click(expandAllIconButton);

    // Count unique firstName values — each unique value becomes one group header row
    const uniqueFirstNameCount = new Set(
      DEFAULT_TEST_DATA.map((row) => row.firstName),
    ).size;
    // Total expected rows: 1 header row + number of group rows + number of data rows
    const HEADER_ROW_COUNT = 1;
    const expectedTotalRowCount =
      HEADER_ROW_COUNT + uniqueFirstNameCount + DEFAULT_TEST_DATA.length;

    await waitFor(() => {
      expect(screen.getAllByRole('row')).toHaveLength(expectedTotalRowCount);
    });
  });
});
