import { MRT_ResetStateMenuItem } from '../../../components/options/MRT_ResetStateMenuItem';
import { useMaterialReactTable } from '../../../hooks/useMaterialReactTable';
import { MRT_Localization_EN } from '../../../locales/en';
import { render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

type TestRow = { id: string };

const RESET_STATE_LABEL = MRT_Localization_EN.resetState;

function createTable(resetState?: (table: unknown) => void) {
  const { result } = renderHook(() =>
    useMaterialReactTable<TestRow>({
      columns: [{ accessorKey: 'id', header: 'ID', type: 'string' }],
      data: [{ id: 'row-1' }],
      resetState,
    }),
  );
  return result.current;
}

describe('MRT_ResetStateMenuItem', () => {
  it('should render the menu item with correct label', () => {
    const table = createTable();
    const mockOnCloseMenu = vi.fn();

    render(
      <MRT_ResetStateMenuItem table={table} onCloseMenu={mockOnCloseMenu} />,
    );
    expect(screen.getByText(RESET_STATE_LABEL)).toBeInTheDocument();
  });

  it('should call default reset functions when no custom resetState is provided', async () => {
    const user = userEvent.setup();
    const table = createTable();
    const mockOnCloseMenu = vi.fn();

    // Spy on all default reset methods
    const resetSortingSpy = vi.spyOn(table, 'resetSorting');
    const resetColumnFiltersSpy = vi.spyOn(table, 'resetColumnFilters');
    const resetGlobalFilterSpy = vi.spyOn(table, 'resetGlobalFilter');
    const resetPaginationSpy = vi.spyOn(table, 'resetPagination');
    const resetColumnOrderSpy = vi.spyOn(table, 'resetColumnOrder');
    const resetGroupingSpy = vi.spyOn(table, 'resetGrouping');
    const resetExpandedSpy = vi.spyOn(table, 'resetExpanded');
    const resetRowSelectionSpy = vi.spyOn(table, 'resetRowSelection');
    const resetColumnVisibilitySpy = vi.spyOn(table, 'resetColumnVisibility');
    const resetColumnPinningSpy = vi.spyOn(table, 'resetColumnPinning');

    render(
      <MRT_ResetStateMenuItem table={table} onCloseMenu={mockOnCloseMenu} />,
    );

    const menuItem = screen.getByRole('menuitem');
    await user.click(menuItem);

    expect(resetSortingSpy).toHaveBeenCalledWith(true);
    expect(resetColumnFiltersSpy).toHaveBeenCalledWith(true);
    expect(resetGlobalFilterSpy).toHaveBeenCalledWith(true);
    expect(resetPaginationSpy).toHaveBeenCalledWith(true);
    expect(resetColumnOrderSpy).toHaveBeenCalledWith(true);
    expect(resetGroupingSpy).toHaveBeenCalledWith(true);
    expect(resetExpandedSpy).toHaveBeenCalledWith(true);
    expect(resetRowSelectionSpy).toHaveBeenCalledWith(true);
    expect(resetColumnVisibilitySpy).toHaveBeenCalledWith(true);
    expect(resetColumnPinningSpy).toHaveBeenCalledWith(true);
  });

  it('should call custom resetState function when provided', async () => {
    const user = userEvent.setup();
    const mockResetState = vi.fn();
    const table = createTable(mockResetState);
    const mockOnCloseMenu = vi.fn();

    render(
      <MRT_ResetStateMenuItem table={table} onCloseMenu={mockOnCloseMenu} />,
    );

    const menuItem = screen.getByRole('menuitem');
    await user.click(menuItem);

    expect(mockResetState).toHaveBeenCalledWith(table);
  });

  it('should call onCloseMenu after clicking the menu item', async () => {
    const user = userEvent.setup();
    const table = createTable();
    const mockOnCloseMenu = vi.fn();

    render(
      <MRT_ResetStateMenuItem table={table} onCloseMenu={mockOnCloseMenu} />,
    );

    const menuItem = screen.getByRole('menuitem');
    await user.click(menuItem);

    expect(mockOnCloseMenu).toHaveBeenCalledOnce();
  });
});
