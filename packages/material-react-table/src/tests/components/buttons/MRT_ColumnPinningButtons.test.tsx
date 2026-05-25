import { MRT_ColumnPinningButtons } from '../../../components/buttons/MRT_ColumnPinningButtons';
import { useMaterialReactTable } from '../../../hooks/useMaterialReactTable';
import { MRT_Localization_EN } from '../../../locales/en';
import {
  type MRT_ColumnDef,
  type MRT_RowData,
  type MRT_TableInstance,
  type MRT_TableOptions,
} from '../../../types';
import { render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

type MockRowData = {
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
  { name: 'Alice', age: 30, city: 'NYC' },
  { name: 'Bob', age: 25, city: 'LA' },
];

const createMockTable = <TData extends MRT_RowData>(
  tableOptions: MRT_TableOptions<TData>,
): MRT_TableInstance<TData> => {
  const { result } = renderHook(() =>
    useMaterialReactTable<TData>(tableOptions),
  );
  return result.current;
};

const { pinToLeft, pinToRight, unpin } = MRT_Localization_EN;

describe('MRT_ColumnPinningButtons', () => {
  it('should render pin-left and pin-right buttons when column is not pinned', () => {
    const table = createMockTable({
      columns: DEFAULT_COLUMNS,
      data: DEFAULT_DATA,
      enableColumnPinning: true,
    });
    const column = table.getColumn('name');

    render(<MRT_ColumnPinningButtons column={column} table={table} />);

    expect(screen.getByLabelText(pinToLeft)).toBeInTheDocument();
    expect(screen.getByLabelText(pinToRight)).toBeInTheDocument();
    expect(screen.queryByLabelText(unpin)).not.toBeInTheDocument();
  });

  it('should render unpin button when column is pinned left', () => {
    const table = createMockTable({
      columns: DEFAULT_COLUMNS,
      data: DEFAULT_DATA,
      enableColumnPinning: true,
      initialState: { columnPinning: { left: ['name'], right: [] } },
    });
    const column = table.getColumn('name');

    render(<MRT_ColumnPinningButtons column={column} table={table} />);

    expect(screen.getByLabelText(unpin)).toBeInTheDocument();
    expect(screen.queryByLabelText(pinToLeft)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(pinToRight)).not.toBeInTheDocument();
  });

  it('should render unpin button when column is pinned right', () => {
    const table = createMockTable({
      columns: DEFAULT_COLUMNS,
      data: DEFAULT_DATA,
      enableColumnPinning: true,
      initialState: { columnPinning: { left: [], right: ['city'] } },
    });
    const column = table.getColumn('city');

    render(<MRT_ColumnPinningButtons column={column} table={table} />);

    expect(screen.getByLabelText(unpin)).toBeInTheDocument();
  });

  it('should call column.pin with "left" when pin-left is clicked', async () => {
    const user = userEvent.setup();
    const table = createMockTable({
      columns: DEFAULT_COLUMNS,
      data: DEFAULT_DATA,
      enableColumnPinning: true,
    });
    const column = table.getColumn('name');

    render(<MRT_ColumnPinningButtons column={column} table={table} />);

    await user.click(screen.getByLabelText(pinToLeft));

    expect(column.getIsPinned()).toBe('left');
  });

  it('should call column.pin with "right" when pin-right is clicked', async () => {
    const user = userEvent.setup();
    const table = createMockTable({
      columns: DEFAULT_COLUMNS,
      data: DEFAULT_DATA,
      enableColumnPinning: true,
    });
    const column = table.getColumn('age');

    render(<MRT_ColumnPinningButtons column={column} table={table} />);

    await user.click(screen.getByLabelText(pinToRight));

    expect(column.getIsPinned()).toBe('right');
  });

  it('should unpin column when unpin button is clicked', async () => {
    const user = userEvent.setup();
    const table = createMockTable({
      columns: DEFAULT_COLUMNS,
      data: DEFAULT_DATA,
      enableColumnPinning: true,
      initialState: { columnPinning: { left: ['name'], right: [] } },
    });
    const column = table.getColumn('name');

    render(<MRT_ColumnPinningButtons column={column} table={table} />);

    await user.click(screen.getByLabelText(unpin));

    expect(column.getIsPinned()).toBe(false);
  });
});
