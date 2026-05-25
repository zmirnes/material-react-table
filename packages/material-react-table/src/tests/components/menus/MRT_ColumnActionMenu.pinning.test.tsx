import { MaterialReactTable } from '../../../components/MaterialReactTable';
import { MRT_Localization_EN } from '../../../locales/en';
import { type MRT_ColumnDef, type MRT_TableOptions } from '../../../types';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

type MockRowData = {
  firstName: string;
  lastName: string;
  city: string;
} & Record<string, unknown>;

const DEFAULT_COLUMNS: MRT_ColumnDef<MockRowData>[] = [
  { accessorKey: 'firstName', header: 'First Name', type: 'string' },
  { accessorKey: 'lastName', header: 'Last Name', type: 'string' },
  { accessorKey: 'city', header: 'City', type: 'string' },
];

const DEFAULT_DATA: MockRowData[] = [
  { firstName: 'Alice', lastName: 'Smith', city: 'NYC' },
  { firstName: 'Bob', lastName: 'Jones', city: 'LA' },
];

const { columnActions, pinToLeft, pinToRight, unpin } = MRT_Localization_EN;

const renderTable = (tableOptions: MRT_TableOptions<MockRowData>) => {
  render(<MaterialReactTable {...tableOptions} />);
};

const openColumnMenu = async (
  user: ReturnType<typeof userEvent.setup>,
  columnHeaderText: string,
) => {
  const headerCell = screen.getByText(columnHeaderText).closest('th')!;
  const columnActionsButton = within(headerCell).getByLabelText(columnActions);
  await user.click(columnActionsButton);
};

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

    renderTable({
      columns: DEFAULT_COLUMNS,
      data: DEFAULT_DATA,
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

    renderTable({
      columns: DEFAULT_COLUMNS,
      data: DEFAULT_DATA,
      enableColumnPinning: true,
      initialState: { columnPinning: { left: ['firstName'], right: [] } },
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

    renderTable({
      columns: DEFAULT_COLUMNS,
      data: DEFAULT_DATA,
      enableColumnPinning: true,
      initialState: { columnPinning: { left: [], right: ['firstName'] } },
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

    renderTable({
      columns: DEFAULT_COLUMNS,
      data: DEFAULT_DATA,
      enableColumnPinning: true,
    });
    await openColumnMenu(user, 'First Name');

    const { unpinMenuItem } = getPinningMenuItems();
    expectDisabledState(unpinMenuItem, true);
  });

  it('should pin column to left when "Pin to left" is clicked', async () => {
    const user = userEvent.setup();

    renderTable({
      columns: DEFAULT_COLUMNS,
      data: DEFAULT_DATA,
      enableColumnPinning: true,
    });
    await openColumnMenu(user, 'First Name');

    await user.click(screen.getByRole('menuitem', { name: pinToLeft }));

    const headerCell = screen.getByText('First Name').closest('th');
    expect(headerCell).toHaveAttribute('data-pinned', 'true');
  });

  it('should pin column to right when "Pin to right" is clicked', async () => {
    const user = userEvent.setup();

    renderTable({
      columns: DEFAULT_COLUMNS,
      data: DEFAULT_DATA,
      enableColumnPinning: true,
    });
    await openColumnMenu(user, 'First Name');

    await user.click(screen.getByRole('menuitem', { name: pinToRight }));

    const headerCell = screen.getByText('First Name').closest('th');
    expect(headerCell).toHaveAttribute('data-pinned', 'true');
  });

  it('should unpin column when "Unpin" is clicked on a pinned column', async () => {
    const user = userEvent.setup();

    renderTable({
      columns: DEFAULT_COLUMNS,
      data: DEFAULT_DATA,
      enableColumnPinning: true,
      initialState: { columnPinning: { left: ['firstName'], right: [] } },
    });
    await openColumnMenu(user, 'First Name');

    await user.click(screen.getByRole('menuitem', { name: unpin }));

    const headerCell = screen.getByText('First Name').closest('th');
    expect(headerCell).not.toHaveAttribute('data-pinned', 'true');
  });

  it('should not show pinning options when enableColumnPinning is false', async () => {
    const user = userEvent.setup();

    renderTable({
      columns: DEFAULT_COLUMNS,
      data: DEFAULT_DATA,
      enableColumnPinning: false,
    });
    await openColumnMenu(user, 'First Name');

    expectPinningOptionsNotVisible();
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

    renderTable({
      columns: columnsWithDisabledPinning,
      data: DEFAULT_DATA,
      enableColumnPinning: true,
    });
    await openColumnMenu(user, 'First Name');

    expectPinningOptionsNotVisible();
  });

  it('should close menu after pinning action', async () => {
    const user = userEvent.setup();

    renderTable({
      columns: DEFAULT_COLUMNS,
      data: DEFAULT_DATA,
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

    renderTable({
      columns: DEFAULT_COLUMNS,
      data: DEFAULT_DATA,
      enableColumnPinning: true,
      initialState: { columnPinning: { left: ['firstName'], right: [] } },
    });
    await openColumnMenu(user, 'First Name');

    await user.click(screen.getByRole('menuitem', { name: pinToRight }));

    const headerCell = screen.getByText('First Name').closest('th');
    expect(headerCell).toHaveAttribute('data-pinned', 'true');
  });
});
