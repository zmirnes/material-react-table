import { useServerTableState } from '../../../hooks/useServerTableState';
import { type MRT_SortingState } from '../../../types';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Debounce delay used by the hook when saveDebounceMs is not explicitly set
const DEFAULT_SAVE_DEBOUNCE_MS = 500;

type TestRowData = { id: string };

describe('useServerTableState — onSortingChange', () => {
  it('should initialise sorting as an empty array', () => {
    const { result } = renderHook(() => useServerTableState<TestRowData>({}));

    expect(result.current.tableState.sorting).toEqual([]);
  });

  it('should use provided sorting initial state', () => {
    const initialSorting: MRT_SortingState = [{ id: 'firstName', desc: false }];

    const { result } = renderHook(() =>
      useServerTableState<TestRowData>({
        initialState: { sorting: initialSorting },
      }),
    );

    expect(result.current.tableState.sorting).toEqual(initialSorting);
  });

  it('should update tableState.sorting when onSortingChange is called with a new value', () => {
    const { result } = renderHook(() => useServerTableState<TestRowData>({}));
    const newSorting: MRT_SortingState = [{ id: 'firstName', desc: false }];

    act(() => {
      result.current.handlers.onSortingChange(newSorting);
    });

    expect(result.current.tableState.sorting).toEqual(newSorting);
  });

  it('should update sorting to descending direction', () => {
    const { result } = renderHook(() => useServerTableState<TestRowData>({}));
    const descendingSorting: MRT_SortingState = [{ id: 'age', desc: true }];

    act(() => {
      result.current.handlers.onSortingChange(descendingSorting);
    });

    expect(result.current.tableState.sorting).toEqual(descendingSorting);
  });

  it('should support sorting by multiple columns', () => {
    const { result } = renderHook(() => useServerTableState<TestRowData>({}));
    const multiColumnSorting: MRT_SortingState = [
      { id: 'lastName', desc: false },
      { id: 'firstName', desc: true },
    ];

    act(() => {
      result.current.handlers.onSortingChange(multiColumnSorting);
    });

    expect(result.current.tableState.sorting).toEqual(multiColumnSorting);
  });

  it('should clear sorting when onSortingChange is called with an empty array', () => {
    const { result } = renderHook(() =>
      useServerTableState<TestRowData>({
        initialState: { sorting: [{ id: 'firstName', desc: false }] },
      }),
    );

    act(() => {
      result.current.handlers.onSortingChange([]);
    });

    expect(result.current.tableState.sorting).toEqual([]);
  });

  it('should support a functional updater that derives the new sorting from previous state', () => {
    const initialSorting: MRT_SortingState = [{ id: 'firstName', desc: false }];

    const { result } = renderHook(() =>
      useServerTableState<TestRowData>({
        initialState: { sorting: initialSorting },
      }),
    );

    // TanStack Table internally calls onSortingChange with a function updater
    act(() => {
      result.current.handlers.onSortingChange((prev) => [
        ...prev,
        { id: 'lastName', desc: true },
      ]);
    });

    expect(result.current.tableState.sorting).toEqual([
      { id: 'firstName', desc: false },
      { id: 'lastName', desc: true },
    ]);
  });

  describe('fetchTrigger', () => {
    it('should expose sorting in fetchTrigger so consumers can use it as a data-fetch dependency', () => {
      const { result } = renderHook(() => useServerTableState<TestRowData>({}));
      const newSorting: MRT_SortingState = [{ id: 'city', desc: true }];

      act(() => {
        result.current.handlers.onSortingChange(newSorting);
      });

      expect(result.current.fetchTrigger.sorting).toEqual(newSorting);
    });

    it('should update fetchTrigger.sorting independently from other fetchTrigger fields', () => {
      const { result } = renderHook(() => useServerTableState<TestRowData>({}));
      const initialPagination = result.current.fetchTrigger.pagination;

      act(() => {
        result.current.handlers.onSortingChange([{ id: 'city', desc: false }]);
      });

      // pagination in fetchTrigger must remain unchanged — only sorting should update
      expect(result.current.fetchTrigger.pagination).toEqual(initialPagination);
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

    it('should NOT call saveState when sorting changes — sorting is a fetch trigger, not a persisted state', () => {
      const saveState = vi.fn();

      const { result } = renderHook(() =>
        useServerTableState<TestRowData>({ saveState }),
      );

      act(() => {
        result.current.handlers.onSortingChange([
          { id: 'firstName', desc: false },
        ]);
      });

      act(() => {
        vi.advanceTimersByTime(DEFAULT_SAVE_DEBOUNCE_MS);
      });

      expect(saveState).not.toHaveBeenCalled();
    });
  });
});
