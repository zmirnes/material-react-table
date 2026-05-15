import { useMaterialReactTable } from '../../hooks/useMaterialReactTable';
import { useTreeRowReorderingHeader } from '../../hooks/useTreeRowReorderingHeader';
import { type MRT_RowData, type MRT_TableOptions } from '../../types';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const createMockTable = <TData extends MRT_RowData>(
  tableOptions: MRT_TableOptions<TData>,
) => {
  const { result } = renderHook(() =>
    useMaterialReactTable<TData>(tableOptions),
  );
  return result.current;
};

describe('useTreeRowReorderingHeader', () => {
  it('should hide move to top level action when row reordering is disabled', () => {
    const table = createMockTable({
      columns: [],
      data: [
        {
          id: 'row1',
          subRows: [{ id: 'row1-child' }],
        },
      ],
      getRowId: (originalRow) => originalRow.id,
      state: {
        rowReorderingSelection: {
          'row1-child': true,
        },
      },
    });

    const { result } = renderHook(() =>
      useTreeRowReorderingHeader({
        table,
        enableRowReordering: false,
        onTreeRowReorder: undefined,
      }),
    );

    expect(result.current.shouldShowMoveToTopLevelAction).toBe(false);
  });

  it('should show move to top level action when row reordering is enabled and at least one selected row is nested', () => {
    const table = createMockTable({
      columns: [],
      data: [
        {
          id: 'row1',
          subRows: [{ id: 'row1-child' }],
        },
      ],
      getRowId: (originalRow) => originalRow.id,
      state: {
        rowReorderingSelection: {
          'row1-child': true,
        },
      },
    });

    const { result } = renderHook(() =>
      useTreeRowReorderingHeader({
        table,
        enableRowReordering: true,
        onTreeRowReorder: undefined,
      }),
    );

    expect(result.current.shouldShowMoveToTopLevelAction).toBe(true);
  });

  it('should hide move to top level action when all selected rows are already top level', () => {
    const table = createMockTable({
      columns: [],
      data: [{ id: 'row1' }, { id: 'row2' }],
      getRowId: (originalRow) => originalRow.id,
      state: {
        rowReorderingSelection: {
          row1: true,
        },
      },
    });

    const { result } = renderHook(() =>
      useTreeRowReorderingHeader({
        table,
        enableRowReordering: true,
        onTreeRowReorder: undefined,
      }),
    );

    expect(result.current.shouldShowMoveToTopLevelAction).toBe(false);
  });

  it('should call onTreeRowReorder with targetRow null when moving selected rows to top level', () => {
    const table = createMockTable({
      columns: [],
      data: [
        {
          id: 'row1',
          subRows: [{ id: 'row1-child' }],
        },
        { id: 'row2' },
      ],
      getRowId: (originalRow) => originalRow.id,
      state: {
        rowReorderingSelection: {
          'row1-child': true,
        },
      },
    });

    const onTreeRowReorder = vi.fn();

    const { result } = renderHook(() =>
      useTreeRowReorderingHeader({
        table,
        enableRowReordering: true,
        onTreeRowReorder,
      }),
    );

    act(() => {
      result.current.handleMoveToTopLevelActionClick();
    });

    expect(onTreeRowReorder).toHaveBeenCalledTimes(1);
    expect(onTreeRowReorder).toHaveBeenCalledWith({
      selectedRowIds: ['row1-child'],
      selectedRows: [table.getRow('row1-child', true)],
      table,
      targetRow: null,
    });
  });

  it('should warn when onTreeRowReorder is not defined', () => {
    const table = createMockTable({
      columns: [],
      data: [
        {
          id: 'row1',
          subRows: [{ id: 'row1-child' }],
        },
      ],
      getRowId: (originalRow) => originalRow.id,
      state: {
        rowReorderingSelection: {
          'row1-child': true,
        },
      },
    });

    const consoleWarnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => {});

    const { result } = renderHook(() =>
      useTreeRowReorderingHeader({
        table,
        enableRowReordering: true,
        onTreeRowReorder: undefined,
      }),
    );

    act(() => {
      result.current.handleMoveToTopLevelActionClick();
    });

    expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      '[MRT] onTreeRowReorder callback is not defined',
    );

    consoleWarnSpy.mockRestore();
  });

  it('should log error when onTreeRowReorder throws while moving rows to top level', () => {
    const table = createMockTable({
      columns: [],
      data: [
        {
          id: 'row1',
          subRows: [{ id: 'row1-child' }],
        },
      ],
      getRowId: (originalRow) => originalRow.id,
      state: {
        rowReorderingSelection: {
          'row1-child': true,
        },
      },
    });

    const reorderError = new Error('reorder failed');
    const onTreeRowReorder = vi.fn(() => {
      throw reorderError;
    });

    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const { result } = renderHook(() =>
      useTreeRowReorderingHeader({
        table,
        enableRowReordering: true,
        onTreeRowReorder,
      }),
    );

    act(() => {
      result.current.handleMoveToTopLevelActionClick();
    });

    expect(onTreeRowReorder).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[MRT] Error during tree row reorder to top level:',
      reorderError,
    );

    consoleErrorSpy.mockRestore();
  });
});
