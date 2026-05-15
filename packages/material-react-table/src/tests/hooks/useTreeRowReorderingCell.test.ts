import { act, type ChangeEvent } from 'react';
import { useMaterialReactTable } from '../../hooks/useMaterialReactTable';
import { useTreeRowReorderingCell } from '../../hooks/useTreeRowReorderingCell';
import {
  type MRT_Row,
  type MRT_RowData,
  type MRT_TableInstance,
  type MRT_TableOptions,
} from '../../types';
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const createMockTable = <TData extends MRT_RowData>(
  tableOptions: MRT_TableOptions<TData>,
) => {
  const { result } = renderHook(() =>
    useMaterialReactTable<TData>(tableOptions),
  );
  return result.current;
};

const createMockRow = <TData extends MRT_RowData>({
  table,
  index = 0,
}: {
  table: MRT_TableInstance<TData>;
  index?: number;
}): MRT_Row<TData> => {
  const row = table.getRowModel().rows[index];
  if (!row) {
    throw new Error(`No row found at index ${index}`);
  }
  return row;
};

describe('useTreeRowReorderingCell', () => {
  it('should hide reorder checkbox initially when there is no hover and no selection', () => {
    const table = createMockTable({
      columns: [],
      data: [{ id: 'row1' }],
      getRowId: (originalRow) => originalRow.id,
    });

    const row = createMockRow({ table });

    const { result } = renderHook(() =>
      useTreeRowReorderingCell({
        row,
        table,
        rowReorderingSelection: undefined,
        maxDepth: undefined,
        onTreeRowReorder: undefined,
      }),
    );
    expect(result.current.isRowHovered).toBe(false);
    expect(result.current.shouldShowReorderCheckbox).toBe(false);
  });

  it('should show reorder checkbox on hover and hide it after hover leave when there is no selection', () => {
    const table = createMockTable({
      columns: [],
      data: [{ id: 'row1' }],
      getRowId: (originalRow) => originalRow.id,
    });

    const row = createMockRow({ table });

    const { result } = renderHook(() =>
      useTreeRowReorderingCell({
        row,
        table,
        rowReorderingSelection: undefined,
        maxDepth: undefined,
        onTreeRowReorder: undefined,
      }),
    );

    expect(result.current.isRowHovered).toBe(false);
    expect(result.current.shouldShowReorderCheckbox).toBe(false);

    act(() => {
      result.current.handleRowHoverEnter();
    });

    expect(result.current.isRowHovered).toBe(true);
    expect(result.current.shouldShowReorderCheckbox).toBe(true);
  });

  it('should show reorder checkbox without hover when there is an active reorder selection', () => {
    const table = createMockTable({
      columns: [],
      data: [{ id: 'row1' }, { id: 'row2' }],
      getRowId: (originalRow) => originalRow.id,
    });

    const row = createMockRow({ table, index: 1 });

    const { result } = renderHook(() =>
      useTreeRowReorderingCell({
        row,
        table,
        rowReorderingSelection: {
          row1: true,
        },
        maxDepth: undefined,
        onTreeRowReorder: undefined,
      }),
    );

    expect(result.current.isRowHovered).toBe(false);
    expect(result.current.shouldShowReorderCheckbox).toBe(true);
  });

  it('should hide reorder checkbox when current row depth does not match first selected row depth', () => {
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
    });

    const rootRow = createMockRow({ table, index: 0 });

    const { result } = renderHook(() =>
      useTreeRowReorderingCell({
        row: rootRow,
        table,
        rowReorderingSelection: {
          'row1-child': true,
        },
        maxDepth: undefined,
        onTreeRowReorder: undefined,
      }),
    );

    expect(rootRow.depth).toBe(0);

    act(() => {
      result.current.handleRowHoverEnter();
    });

    expect(result.current.isRowHovered).toBe(true);
    expect(result.current.shouldShowReorderCheckbox).toBe(false);
  });

  it('should call setRowReorderingSelection with updater that sets current row id to checked value', () => {
    const table = createMockTable({
      columns: [],
      data: [{ id: 'row1' }],
      getRowId: (originalRow) => originalRow.id,
    });

    const row = createMockRow({ table });
    const setRowReorderingSelectionSpy = vi.spyOn(
      table,
      'setRowReorderingSelection',
    );

    const { result } = renderHook(() =>
      useTreeRowReorderingCell({
        row,
        table,
        rowReorderingSelection: undefined,
        maxDepth: undefined,
        onTreeRowReorder: undefined,
      }),
    );

    const mockChangeEvent = {
      target: { checked: true },
    } as ChangeEvent<HTMLInputElement>;

    act(() => {
      result.current.handleReorderCheckboxChange(mockChangeEvent);
    });

    expect(setRowReorderingSelectionSpy).toHaveBeenCalledTimes(1);

    const setSelectionArg = setRowReorderingSelectionSpy.mock.calls[0]?.[0];
    expect(typeof setSelectionArg).toBe('function');

    if (typeof setSelectionArg !== 'function') {
      throw new Error(
        'Expected setRowReorderingSelection to receive updater fn',
      );
    }

    const nextSelection = setSelectionArg({ existingRow: false });

    expect(nextSelection).toEqual({
      existingRow: false,
      row1: true,
    });
  });

  it('should call setRowReorderingSelection with updater that sets current row id to unchecked value', () => {
    const table = createMockTable({
      columns: [],
      data: [{ id: 'row1' }],
      getRowId: (originalRow) => originalRow.id,
    });

    const row = createMockRow({ table });
    const setRowReorderingSelectionSpy = vi.spyOn(
      table,
      'setRowReorderingSelection',
    );

    const { result } = renderHook(() =>
      useTreeRowReorderingCell({
        row,
        table,
        rowReorderingSelection: undefined,
        maxDepth: undefined,
        onTreeRowReorder: undefined,
      }),
    );

    const mockChangeEvent = {
      target: { checked: false },
    } as ChangeEvent<HTMLInputElement>;

    act(() => {
      result.current.handleReorderCheckboxChange(mockChangeEvent);
    });

    expect(setRowReorderingSelectionSpy).toHaveBeenCalledTimes(1);

    const setSelectionArg = setRowReorderingSelectionSpy.mock.calls[0]?.[0];
    expect(typeof setSelectionArg).toBe('function');

    if (typeof setSelectionArg !== 'function') {
      throw new Error(
        'Expected setRowReorderingSelection to receive updater fn',
      );
    }

    const nextSelection = setSelectionArg({ existingRow: true });

    expect(nextSelection).toEqual({
      existingRow: true,
      row1: false,
    });
  });

  it('should hide reorder checkbox after hover leave when there is no selection', () => {
    const table = createMockTable({
      columns: [],
      data: [{ id: 'row1' }],
      getRowId: (originalRow) => originalRow.id,
    });

    const row = createMockRow({ table });

    const { result } = renderHook(() =>
      useTreeRowReorderingCell({
        row,
        table,
        rowReorderingSelection: undefined,
        maxDepth: undefined,
        onTreeRowReorder: undefined,
      }),
    );

    act(() => {
      result.current.handleRowHoverEnter();
    });

    expect(result.current.isRowHovered).toBe(true);
    expect(result.current.shouldShowReorderCheckbox).toBe(true);

    act(() => {
      result.current.handleRowHoverLeave();
    });

    expect(result.current.isRowHovered).toBe(false);
    expect(result.current.shouldShowReorderCheckbox).toBe(false);
  });

  it('should reflect whether the current row is selected', () => {
    const table = createMockTable({
      columns: [],
      data: [{ id: 'row1' }, { id: 'row2' }],
      getRowId: (originalRow) => originalRow.id,
    });

    const selectedRow = createMockRow({ table, index: 0 });
    const unselectedRow = createMockRow({ table, index: 1 });

    const { result: selectedResult } = renderHook(() =>
      useTreeRowReorderingCell({
        row: selectedRow,
        table,
        rowReorderingSelection: {
          row1: true,
        },
        maxDepth: undefined,
        onTreeRowReorder: undefined,
      }),
    );

    expect(selectedResult.current.isReorderCheckboxSelected).toBe(true);

    const { result: unselectedResult } = renderHook(() =>
      useTreeRowReorderingCell({
        row: unselectedRow,
        table,
        rowReorderingSelection: {
          row1: true,
        },
        maxDepth: undefined,
        onTreeRowReorder: undefined,
      }),
    );

    expect(unselectedResult.current.isReorderCheckboxSelected).toBe(false);
  });

  it('should show insert here action when target row is valid and there is a selection', () => {
    const table = createMockTable({
      columns: [],
      data: [{ id: 'row1' }, { id: 'row2' }],
      getRowId: (originalRow) => originalRow.id,
    });

    const row = createMockRow({ table, index: 1 });

    const { result } = renderHook(() =>
      useTreeRowReorderingCell({
        row,
        table,
        rowReorderingSelection: {
          row1: true,
        },
        maxDepth: undefined,
        onTreeRowReorder: undefined,
      }),
    );

    expect(result.current.shouldShowInsertHereAction).toBe(true);
  });

  it('should hide insert here action when target row is already selected', () => {
    const table = createMockTable({
      columns: [],
      data: [{ id: 'row1' }, { id: 'row2' }],
      getRowId: (originalRow) => originalRow.id,
    });

    const row = createMockRow({ table, index: 1 });

    const { result } = renderHook(() =>
      useTreeRowReorderingCell({
        row,
        table,
        rowReorderingSelection: {
          row2: true,
        },
        maxDepth: undefined,
        onTreeRowReorder: undefined,
      }),
    );

    expect(result.current.shouldShowInsertHereAction).toBe(false);
  });

  it('should hide insert here action when target row is a descendant of a selected row', () => {
    const table = createMockTable({
      columns: [],
      data: [
        {
          id: 'row1',
          subRows: [{ id: 'row1-child' }],
        },
      ],
      getRowId: (originalRow) => originalRow.id,
    });

    const parentRow = createMockRow({ table, index: 0 });
    const childRow = parentRow.subRows?.[0];

    if (!childRow) {
      throw new Error('Expected child row to exist');
    }

    const { result } = renderHook(() =>
      useTreeRowReorderingCell({
        row: childRow,
        table,
        rowReorderingSelection: {
          row1: true,
        },
        maxDepth: undefined,
        onTreeRowReorder: undefined,
      }),
    );

    expect(result.current.shouldShowInsertHereAction).toBe(false);
  });

  it('should hide insert here action when moving rows would exceed maxDepth', () => {
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
    });

    const row = createMockRow({ table, index: 1 });

    const { result } = renderHook(() =>
      useTreeRowReorderingCell({
        row,
        table,
        rowReorderingSelection: {
          row1: true,
        },
        maxDepth: 2,
        onTreeRowReorder: undefined,
      }),
    );

    expect(result.current.shouldShowInsertHereAction).toBe(false);
  });

  it('should call onTreeRowReorder with the selected rows and target row', () => {
    const table = createMockTable({
      columns: [],
      data: [{ id: 'row1' }, { id: 'row2' }],
      getRowId: (originalRow) => originalRow.id,
    });

    const row = createMockRow({ table, index: 1 });
    const onTreeRowReorder = vi.fn();

    const { result } = renderHook(() =>
      useTreeRowReorderingCell({
        row,
        table,
        rowReorderingSelection: {
          row1: true,
        },
        maxDepth: undefined,
        onTreeRowReorder,
      }),
    );

    act(() => {
      result.current.handleInsertHereActionClick();
    });

    expect(onTreeRowReorder).toHaveBeenCalledTimes(1);

    expect(onTreeRowReorder).toHaveBeenCalledWith({
      selectedRowIds: ['row1'],
      selectedRows: [table.getRow('row1', true)],
      table,
      targetRow: row,
    });
  });

  it('should warn when onTreeRowReorder is not defined', () => {
    const table = createMockTable({
      columns: [],
      data: [{ id: 'row1' }, { id: 'row2' }],
      getRowId: (originalRow) => originalRow.id,
    });

    const row = createMockRow({ table, index: 1 });
    const consoleWarnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => {});

    const { result } = renderHook(() =>
      useTreeRowReorderingCell({
        row,
        table,
        rowReorderingSelection: {
          row1: true,
        },
        maxDepth: undefined,
        onTreeRowReorder: undefined,
      }),
    );

    act(() => {
      result.current.handleInsertHereActionClick();
    });

    expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      '[MRT] onTreeRowReorder callback is not defined',
    );

    consoleWarnSpy.mockRestore();
  });
});
