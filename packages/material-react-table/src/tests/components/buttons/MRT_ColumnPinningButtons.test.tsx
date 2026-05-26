import { MRT_Localization_HR } from '../../../locales/hr';
import { type MRT_ColumnDef } from '../../../types';
import { renderServerTable } from '../../utils/renderServerTable';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

type MockRowData = {
  id: string;
  name: string;
  age: number;
  city: string;
} & Record<string, unknown>;

const DEFAULT_COLUMNS: MRT_ColumnDef<MockRowData>[] = [
  { accessorKey: 'name', header: 'Name', type: 'string' },
  { accessorKey: 'age', header: 'Age', type: 'number' },
  { accessorKey: 'city', header: 'City', type: 'string' },
];

const DEFAULT_DATA: MockRowData[] = [
  { id: '1', name: 'Alice', age: 30, city: 'NYC' },
  { id: '2', name: 'Bob', age: 25, city: 'LA' },
];

const { pinToLeft, pinToRight, unpin, showHideColumns } = MRT_Localization_HR;

/**
 * Opens the Show/Hide Columns menu where pinning buttons are rendered.
 */
const openShowHideColumnsMenu = async (
  user: ReturnType<typeof userEvent.setup>,
) => {
  const showHideColumnsButton = await screen.findByLabelText(showHideColumns);
  await user.click(showHideColumnsButton);
};

/**
 * Finds the pinning buttons container for a given column accessorKey
 * within the show/hide columns menu using data-testid.
 */
const findColumnPinningRow = (columnAccessorKey: string) => {
  return screen.getByTestId(`column-show-hide-row-${columnAccessorKey}`);
};

describe('MRT_ColumnPinningButtons', () => {
  it('should render unpin button when column is pinned left', async () => {
    const user = userEvent.setup();

    renderServerTable<MockRowData>({
      columns: DEFAULT_COLUMNS,
      data: DEFAULT_DATA,
      enableColumnPinning: true,
      initialState: { columnPinning: { left: ['name'], right: [] } },
    });
    await openShowHideColumnsMenu(user);

    const columnRow = findColumnPinningRow('name');
    expect(within(columnRow).getByLabelText(unpin)).toBeInTheDocument();
    expect(
      within(columnRow).queryByLabelText(pinToLeft),
    ).not.toBeInTheDocument();
    expect(
      within(columnRow).queryByLabelText(pinToRight),
    ).not.toBeInTheDocument();
  });

  it('should render unpin button when column is pinned right', async () => {
    const user = userEvent.setup();

    renderServerTable<MockRowData>({
      columns: DEFAULT_COLUMNS,
      data: DEFAULT_DATA,
      enableColumnPinning: true,
      initialState: { columnPinning: { left: [], right: ['city'] } },
    });
    await openShowHideColumnsMenu(user);

    const columnRow = findColumnPinningRow('city');
    expect(within(columnRow).getByLabelText(unpin)).toBeInTheDocument();
  });

  it('should pin column left when pin-left button is clicked', async () => {
    const user = userEvent.setup();

    renderServerTable<MockRowData>({
      columns: DEFAULT_COLUMNS,
      data: DEFAULT_DATA,
      enableColumnPinning: true,
    });
    await openShowHideColumnsMenu(user);

    const columnRow = findColumnPinningRow('name');
    await user.click(within(columnRow).getByLabelText(pinToLeft));

    await user.keyboard('{Escape}');

    await waitFor(() => {
      const pinnedCell = screen.getByTestId('header-cell-name');
      const headerRow = pinnedCell.closest('tr')!;
      const allHeaderCells = headerRow.querySelectorAll('th');

      expect(allHeaderCells[1]).toBe(pinnedCell);
      expect(pinnedCell).toHaveAttribute('data-pinned', 'true');
    });
  });

  it('should pin column right when pin-right button is clicked', async () => {
    const user = userEvent.setup();

    renderServerTable<MockRowData>({
      columns: DEFAULT_COLUMNS,
      data: DEFAULT_DATA,
      enableColumnPinning: true,
    });
    await openShowHideColumnsMenu(user);

    const columnRow = findColumnPinningRow('age');
    await user.click(within(columnRow).getByLabelText(pinToRight));

    await user.keyboard('{Escape}');
    await waitFor(() => {
      const pinnedCell = screen.getByTestId('header-cell-age');
      const headerRow = pinnedCell.closest('tr')!;
      const allHeaderCellsInRow = headerRow.querySelectorAll('th');
      const lastCell = allHeaderCellsInRow[allHeaderCellsInRow.length - 1];

      expect(lastCell).toBe(pinnedCell);
      expect(pinnedCell).toHaveAttribute('data-pinned', 'true');
    });
  });

  it('should unpin column when unpin button is clicked', async () => {
    const user = userEvent.setup();

    renderServerTable<MockRowData>({
      columns: DEFAULT_COLUMNS,
      data: DEFAULT_DATA,
      enableColumnPinning: true,
      initialState: { columnPinning: { left: ['name'], right: [] } },
    });
    await openShowHideColumnsMenu(user);

    const columnRow = findColumnPinningRow('name');
    await user.click(within(columnRow).getByLabelText(unpin));

    // Close the popover to reveal the table
    await user.keyboard('{Escape}');

    // Verify the column is no longer pinned in the table header
    await waitFor(() => {
      const nameCell = screen.getByTestId('header-cell-name');
      expect(nameCell).not.toHaveAttribute('data-pinned', 'true');
    });
  });
});
