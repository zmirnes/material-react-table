import { useServerTableState } from '../../../hooks/useServerTableState';
import { type MRT_RowSelectionState } from '../../../types';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Debounce delay used by the hook when saveDebounceMs is not explicitly set
const DEFAULT_SAVE_DEBOUNCE_MS = 500;

type TestRowData = { id: string };

describe('useServerTableState — onRowSelectionChange', () => {
  it('should initialise rowSelection as an empty object', () => {
    const { result } = renderHook(() => useServerTableState<TestRowData>({}));

    expect(result.current.tableState.rowSelection).toEqual({});
  });

  it('should use provided rowSelection initial state', () => {
    const initialRowSelection: MRT_RowSelectionState = { '1': true, '2': true };

    const { result } = renderHook(() =>
      useServerTableState<TestRowData>({
        initialState: { rowSelection: initialRowSelection },
      }),
    );

    expect(result.current.tableState.rowSelection).toEqual(initialRowSelection);
  });

  it('should update tableState.rowSelection when onRowSelectionChange is called with a new value', () => {
    const { result } = renderHook(() => useServerTableState<TestRowData>({}));
    const newSelection: MRT_RowSelectionState = { '1': true };

    act(() => {
      result.current.handlers.onRowSelectionChange(newSelection);
    });

    expect(result.current.tableState.rowSelection).toEqual(newSelection);
  });

  it('should support selecting multiple rows simultaneously', () => {
    const { result } = renderHook(() => useServerTableState<TestRowData>({}));
    const multiRowSelection: MRT_RowSelectionState = {
      '1': true,
      '2': true,
      '3': true,
    };

    act(() => {
      result.current.handlers.onRowSelectionChange(multiRowSelection);
    });

    expect(result.current.tableState.rowSelection).toEqual(multiRowSelection);
  });

  it('should deselect a row by setting its value to false', () => {
    const { result } = renderHook(() =>
      useServerTableState<TestRowData>({
        initialState: { rowSelection: { '1': true, '2': true } },
      }),
    );

    act(() => {
      result.current.handlers.onRowSelectionChange({ '1': true, '2': false });
    });

    expect(result.current.tableState.rowSelection).toEqual({
      '1': true,
      '2': false,
    });
  });

  it('should clear all selections when onRowSelectionChange is called with an empty object', () => {
    const { result } = renderHook(() =>
      useServerTableState<TestRowData>({
        initialState: { rowSelection: { '1': true, '2': true } },
      }),
    );

    act(() => {
      result.current.handlers.onRowSelectionChange({});
    });

    expect(result.current.tableState.rowSelection).toEqual({});
  });

  it('should support a functional updater that derives the new selection from previous state', () => {
    const initialSelection: MRT_RowSelectionState = { '1': true };

    const { result } = renderHook(() =>
      useServerTableState<TestRowData>({
        initialState: { rowSelection: initialSelection },
      }),
    );

    // TanStack Table internally calls onRowSelectionChange with a function updater
    act(() => {
      result.current.handlers.onRowSelectionChange((prev) => ({
        ...prev,
        '2': true,
      }));
    });

    expect(result.current.tableState.rowSelection).toEqual({
      '1': true,
      '2': true,
    });
  });

  describe('saveState behaviour', () => {
    // Enable fake timers so vi.advanceTimersByTime controls the debounce delay
    beforeEach(() => {
      vi.useFakeTimers();
    });

    // Restore real timers after each test to avoid affecting other test suites
    afterEach(() => {
      vi.useRealTimers();
    });

    it('should call saveState with updated rowSelection after the debounce delay', () => {
      const saveState = vi.fn();
      const { result } = renderHook(() =>
        useServerTableState<TestRowData>({ saveState }),
      );
      const newSelection: MRT_RowSelectionState = { '1': true };

      act(() => {
        result.current.handlers.onRowSelectionChange(newSelection);
      });

      // saveState should not be called before the debounce expires
      expect(saveState).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(DEFAULT_SAVE_DEBOUNCE_MS);
      });

      expect(saveState).toHaveBeenCalledTimes(1);
      expect(saveState).toHaveBeenCalledWith(
        expect.objectContaining({ rowSelection: newSelection }),
      );
    });

    it('should NOT call saveState before the debounce delay expires', () => {
      const saveState = vi.fn();
      const { result } = renderHook(() =>
        useServerTableState<TestRowData>({ saveState }),
      );

      act(() => {
        result.current.handlers.onRowSelectionChange({ '1': true });
      });

      act(() => {
        vi.advanceTimersByTime(DEFAULT_SAVE_DEBOUNCE_MS - 1);
      });

      expect(saveState).not.toHaveBeenCalled();
    });

    it('should debounce multiple rapid selection changes into a single saveState call', () => {
      const saveState = vi.fn();
      const { result } = renderHook(() =>
        useServerTableState<TestRowData>({ saveState }),
      );

      // Three rapid changes — only the last one should be saved
      act(() => {
        result.current.handlers.onRowSelectionChange({ '1': true });
      });
      act(() => {
        result.current.handlers.onRowSelectionChange({ '1': true, '2': true });
      });
      act(() => {
        result.current.handlers.onRowSelectionChange({
          '1': true,
          '2': true,
          '3': true,
        });
      });

      act(() => {
        vi.advanceTimersByTime(DEFAULT_SAVE_DEBOUNCE_MS);
      });

      expect(saveState).toHaveBeenCalledTimes(1);
      expect(saveState).toHaveBeenCalledWith(
        expect.objectContaining({
          rowSelection: { '1': true, '2': true, '3': true },
        }),
      );
    });

    it('should not call saveState when saveState is not provided', () => {
      // No saveState passed — hook must not throw
      const { result } = renderHook(() => useServerTableState<TestRowData>({}));

      act(() => {
        result.current.handlers.onRowSelectionChange({ '1': true });
      });

      act(() => {
        vi.advanceTimersByTime(DEFAULT_SAVE_DEBOUNCE_MS);
      });

      // No assertion on a mock — just verifying no exception was thrown
      expect(result.current.tableState.rowSelection).toEqual({ '1': true });
    });
  });
});
