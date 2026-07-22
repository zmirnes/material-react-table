import { MRT_Localization_HR } from '../../../locales/hr';
import { type MRT_ColumnDef } from '../../../types';
import {
  DEFAULT_TEST_COLUMNS,
  DEFAULT_TEST_DATA,
  type MockRowData,
} from '../../data/mock-data';
import {
  openColumnMenu,
  renderServerTable,
} from '../../utils/renderServerTable';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

const { pinToLeft, pinToRight, unpin } = MRT_Localization_HR;

const getPinningMenuItems = () => ({
  pinLeftMenuItem: screen.getByRole('menuitem', { name: pinToLeft }),
  pinRightMenuItem: screen.getByRole('menuitem', { name: pinToRight }),
  unpinMenuItem: screen.getByRole('menuitem', { name: unpin }),
});

const expectDisabledState = (
  element: HTMLElement,
  shouldBeDisabled: boolean,
) => {
  if (shouldBeDisabled) {
    expect(element).toHaveAttribute('aria-disabled', 'true');
  } else {
    expect(element).not.toHaveAttribute('aria-disabled', 'true');
  }
};

const expectPinningOptionsNotVisible = () => {
  expect(
    screen.queryByRole('menuitem', { name: pinToLeft }),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole('menuitem', { name: pinToRight }),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole('menuitem', { name: unpin }),
  ).not.toBeInTheDocument();
};

describe('MRT_ColumnActionMenu - Column Pinning', () => {
  it('should show all three pinning options when column is not pinned', async () => {
    const user = userEvent.setup();

    renderServerTable<MockRowData>({
      columns: DEFAULT_TEST_COLUMNS,
      data: DEFAULT_TEST_DATA,
      enableColumnPinning: true,
    });
    await openColumnMenu(user, 'First Name');

    expect(
      screen.getByRole('menuitem', { name: pinToLeft }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', { name: pinToRight }),
    ).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: unpin })).toBeInTheDocument();
  });

  it('should disable "Pin to left" and enable "Pin to right" and "Unpin" when column is pinned left', async () => {
    const user = userEvent.setup();

    renderServerTable<MockRowData>({
      columns: DEFAULT_TEST_COLUMNS,
      data: DEFAULT_TEST_DATA,
      enableColumnPinning: true,
      initialState: { columnPinning: { start: ['firstName'], end: [] } },
    });
    await openColumnMenu(user, 'First Name');

    const { pinLeftMenuItem, pinRightMenuItem, unpinMenuItem } =
      getPinningMenuItems();

    expectDisabledState(pinLeftMenuItem, true);
    expectDisabledState(pinRightMenuItem, false);
    expectDisabledState(unpinMenuItem, false);
  });

  it('should disable "Pin to right" and enable "Pin to left" and "Unpin" when column is pinned right', async () => {
    const user = userEvent.setup();

    renderServerTable<MockRowData>({
      columns: DEFAULT_TEST_COLUMNS,
      data: DEFAULT_TEST_DATA,
      enableColumnPinning: true,
      initialState: { columnPinning: { start: [], end: ['firstName'] } },
    });
    await openColumnMenu(user, 'First Name');

    const { pinLeftMenuItem, pinRightMenuItem, unpinMenuItem } =
      getPinningMenuItems();

    expectDisabledState(pinLeftMenuItem, false);
    expectDisabledState(pinRightMenuItem, true);
    expectDisabledState(unpinMenuItem, false);
  });

  it('should disable "Unpin" when column is not pinned', async () => {
    const user = userEvent.setup();

    renderServerTable<MockRowData>({
      columns: DEFAULT_TEST_COLUMNS,
      data: DEFAULT_TEST_DATA,
      enableColumnPinning: true,
    });
    await openColumnMenu(user, 'First Name');

    const { unpinMenuItem } = getPinningMenuItems();
    expectDisabledState(unpinMenuItem, true);
  });

  it('should pin column to left when "Pin to left" is clicked', async () => {
    const user = userEvent.setup();

    renderServerTable<MockRowData>({
      columns: DEFAULT_TEST_COLUMNS,
      data: DEFAULT_TEST_DATA,
      enableColumnPinning: true,
      enableRowSelection: true,
    });
    await openColumnMenu(user, 'First Name');
    await user.click(screen.getByRole('menuitem', { name: pinToLeft }));

    const firstNameCell = screen.getByTestId('header-cell-firstName');
    const headerRow = firstNameCell.closest('tr')!;
    const allHeaderCells = headerRow.querySelectorAll('th');

    // index 0 = checkbox (auto-pinned left by server table's default enableRowSelection)
    // index 1 = firstName (user-pinned left)
    expect(allHeaderCells[1]).toBe(firstNameCell);
    expect(firstNameCell).toHaveAttribute('data-pinned', 'true');
  });

  it('should pin column to right when "Pin to right" is clicked', async () => {
    const user = userEvent.setup();

    renderServerTable<MockRowData>({
      columns: DEFAULT_TEST_COLUMNS,
      data: DEFAULT_TEST_DATA,
      enableColumnPinning: true,
    });
    await openColumnMenu(user, 'First Name');
    await user.click(screen.getByRole('menuitem', { name: pinToRight }));
    const pinnedCell = screen.getByTestId('header-cell-firstName');
    const headerRow = pinnedCell.closest('tr')!;
    const allHeaderCellsInRow = headerRow.querySelectorAll('th');
    const lastCell = allHeaderCellsInRow[allHeaderCellsInRow.length - 1];

    expect(lastCell).toBe(pinnedCell);
    expect(pinnedCell).toHaveAttribute('data-pinned', 'true');
  });

  it('should unpin column when "Unpin" is clicked on a pinned column', async () => {
    const user = userEvent.setup();

    renderServerTable<MockRowData>({
      columns: DEFAULT_TEST_COLUMNS,
      data: DEFAULT_TEST_DATA,
      enableColumnPinning: true,
      initialState: { columnPinning: { start: ['firstName'], end: [] } },
    });
    await openColumnMenu(user, 'First Name');

    await user.click(screen.getByRole('menuitem', { name: unpin }));

    const headerCell = screen.getByTestId('header-cell-firstName');
    expect(headerCell).not.toHaveAttribute('data-pinned', 'true');
  });

  it('should not show pinning options for a column with enablePinning: false', async () => {
    const user = userEvent.setup();
    const columnsWithDisabledPinning: MRT_ColumnDef<MockRowData>[] = [
      {
        accessorKey: 'firstName',
        header: 'First Name',
        type: 'string',
        enablePinning: false,
      },
      { accessorKey: 'lastName', header: 'Last Name', type: 'string' },
    ];

    renderServerTable<MockRowData>({
      columns: columnsWithDisabledPinning,
      data: DEFAULT_TEST_DATA,
      enableColumnPinning: true,
    });
    await openColumnMenu(user, 'First Name');

    expectPinningOptionsNotVisible();
  });

  it('should close menu after pinning action', async () => {
    const user = userEvent.setup();

    renderServerTable<MockRowData>({
      columns: DEFAULT_TEST_COLUMNS,
      data: DEFAULT_TEST_DATA,
      enableColumnPinning: true,
    });
    await openColumnMenu(user, 'First Name');

    await user.click(screen.getByRole('menuitem', { name: pinToLeft }));

    expect(
      screen.queryByRole('menuitem', { name: pinToLeft }),
    ).not.toBeInTheDocument();
  });

  it('should allow switching pin direction from left to right', async () => {
    const user = userEvent.setup();

    renderServerTable<MockRowData>({
      columns: DEFAULT_TEST_COLUMNS,
      data: DEFAULT_TEST_DATA,
      enableColumnPinning: true,
      initialState: { columnPinning: { start: ['firstName'], end: [] } },
    });
    await openColumnMenu(user, 'First Name');

    await user.click(screen.getByRole('menuitem', { name: pinToRight }));

    const headerCell = screen.getByTestId('header-cell-firstName');
    expect(headerCell).toHaveAttribute('data-pinned', 'true');
  });
});
