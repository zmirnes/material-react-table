import { useServerTableState } from '../../../hooks/useServerTableState';
import { type MRT_PaginationState } from '../../../types';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Debounce delay used by the hook when saveDebounceMs is not explicitly set
const DEFAULT_SAVE_DEBOUNCE_MS = 500;

// Default values used by the hook when no initialState is provided
const DEFAULT_PAGE_INDEX = 0;
const DEFAULT_PAGE_SIZE = 10;

type TestRowData = { id: string };

describe('useServerTableState — onPaginationChange', () => {
  it('should initialise pagination to pageIndex 0 and pageSize 10', () => {
    const { result } = renderHook(() => useServerTableState<TestRowData>({}));

    expect(result.current.tableState.pagination).toEqual({
      pageIndex: DEFAULT_PAGE_INDEX,
      pageSize: DEFAULT_PAGE_SIZE,
    });
  });

  it('should use provided pagination initial state', () => {
    const initialPagination: MRT_PaginationState = {
      pageIndex: 2,
      pageSize: 25,
    };

    const { result } = renderHook(() =>
      useServerTableState<TestRowData>({
        initialState: { pagination: initialPagination },
      }),
    );

    expect(result.current.tableState.pagination).toEqual(initialPagination);
  });

  it('should update tableState.pagination when onPaginationChange is called with a new value', () => {
    const { result } = renderHook(() => useServerTableState<TestRowData>({}));
    const newPagination: MRT_PaginationState = { pageIndex: 3, pageSize: 10 };

    act(() => {
      result.current.handlers.onPaginationChange(newPagination);
    });

    expect(result.current.tableState.pagination).toEqual(newPagination);
  });

  it('should update pageIndex while keeping pageSize unchanged', () => {
    const { result } = renderHook(() =>
      useServerTableState<TestRowData>({
        initialState: { pagination: { pageIndex: 0, pageSize: 20 } },
      }),
    );

    act(() => {
      result.current.handlers.onPaginationChange({
        pageIndex: 5,
        pageSize: 20,
      });
    });

    expect(result.current.tableState.pagination).toEqual({
      pageIndex: 5,
      pageSize: 20,
    });
  });

  it('should update pageSize while resetting pageIndex to 0', () => {
    // When a user changes page size, TanStack Table resets pageIndex to 0
    const { result } = renderHook(() =>
      useServerTableState<TestRowData>({
        initialState: { pagination: { pageIndex: 3, pageSize: 10 } },
      }),
    );

    act(() => {
      result.current.handlers.onPaginationChange({
        pageIndex: 0,
        pageSize: 50,
      });
    });

    expect(result.current.tableState.pagination).toEqual({
      pageIndex: 0,
      pageSize: 50,
    });
  });

  it('should support a functional updater that derives the new pagination from previous state', () => {
    const { result } = renderHook(() =>
      useServerTableState<TestRowData>({
        initialState: { pagination: { pageIndex: 1, pageSize: 10 } },
      }),
    );

    // TanStack Table internally calls onPaginationChange with a function updater
    act(() => {
      result.current.handlers.onPaginationChange((prev) => ({
        ...prev,
        pageIndex: prev.pageIndex + 1,
      }));
    });

    expect(result.current.tableState.pagination).toEqual({
      pageIndex: 2,
      pageSize: 10,
    });
  });

  describe('fetchTrigger', () => {
    it('should expose pagination in fetchTrigger so consumers can use it as a data-fetch dependency', () => {
      const { result } = renderHook(() => useServerTableState<TestRowData>({}));
      const newPagination: MRT_PaginationState = { pageIndex: 1, pageSize: 25 };

      act(() => {
        result.current.handlers.onPaginationChange(newPagination);
      });

      expect(result.current.fetchTrigger.pagination).toEqual(newPagination);
    });

    it('should update fetchTrigger.pagination when pageIndex changes', () => {
      const { result } = renderHook(() => useServerTableState<TestRowData>({}));

      act(() => {
        result.current.handlers.onPaginationChange({
          pageIndex: 2,
          pageSize: 10,
        });
      });

      expect(result.current.fetchTrigger.pagination.pageIndex).toBe(2);
    });

    it('should update fetchTrigger.pagination when pageSize changes', () => {
      const { result } = renderHook(() => useServerTableState<TestRowData>({}));

      act(() => {
        result.current.handlers.onPaginationChange({
          pageIndex: 0,
          pageSize: 50,
        });
      });

      expect(result.current.fetchTrigger.pagination.pageSize).toBe(50);
    });

    it('should update fetchTrigger.pagination independently from other fetchTrigger fields', () => {
      const { result } = renderHook(() => useServerTableState<TestRowData>({}));
      const initialSorting = result.current.fetchTrigger.sorting;

      act(() => {
        result.current.handlers.onPaginationChange({
          pageIndex: 1,
          pageSize: 10,
        });
      });

      // sorting in fetchTrigger must remain unchanged — only pagination should update
      expect(result.current.fetchTrigger.sorting).toEqual(initialSorting);
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

    it('should NOT call saveState when pagination changes — pagination is a fetch trigger, not a persisted state', () => {
      const saveState = vi.fn();

      const { result } = renderHook(() =>
        useServerTableState<TestRowData>({ saveState }),
      );

      act(() => {
        result.current.handlers.onPaginationChange({
          pageIndex: 1,
          pageSize: 10,
        });
      });

      act(() => {
        vi.advanceTimersByTime(DEFAULT_SAVE_DEBOUNCE_MS);
      });

      expect(saveState).not.toHaveBeenCalled();
    });

    it('should NOT call saveState when pageSize changes', () => {
      const saveState = vi.fn();

      const { result } = renderHook(() =>
        useServerTableState<TestRowData>({ saveState }),
      );

      act(() => {
        result.current.handlers.onPaginationChange({
          pageIndex: 0,
          pageSize: 100,
        });
      });

      act(() => {
        vi.advanceTimersByTime(DEFAULT_SAVE_DEBOUNCE_MS);
      });

      expect(saveState).not.toHaveBeenCalled();
    });
  });
});
