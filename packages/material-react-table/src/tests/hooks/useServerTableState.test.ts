import { useServerTableState } from '../../hooks/useServerTableState';
import type { MRT_GroupingState } from '../../types';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Debounce delay used by the hook when saveDebounceMs is not explicitly set
const DEFAULT_SAVE_DEBOUNCE_MS = 500;

type TestRowData = { id: string };

describe('useServerTableState — onGroupingChange', () => {
  it('should initialise grouping as an empty array', () => {
    const { result } = renderHook(() => useServerTableState<TestRowData>({}));
    expect(result.current.tableState.grouping).toEqual([]);
  });

  it('should use provided grouping initial state', () => {
    const initialGrouping: MRT_GroupingState = ['age'];
    const { result } = renderHook(() =>
      useServerTableState<TestRowData>({
        initialState: { grouping: initialGrouping },
      }),
    );
    expect(result.current.tableState.grouping).toEqual(initialGrouping);
  });

  it('should update grouping in tableState', () => {
    const { result } = renderHook(() => useServerTableState<TestRowData>({}));
    const newGrouping: MRT_GroupingState = ['age'];

    act(() => {
      result.current.handlers.onGroupingChange(newGrouping);
    });

    expect(result.current.tableState.grouping).toEqual(newGrouping);
  });

  it('should support grouping by multiple columns', () => {
    const { result } = renderHook(() => useServerTableState<TestRowData>({}));
    const multiColumnGrouping: MRT_GroupingState = ['age', 'firstName'];

    act(() => {
      result.current.handlers.onGroupingChange(multiColumnGrouping);
    });

    expect(result.current.tableState.grouping).toEqual(multiColumnGrouping);
  });

  it('should reset grouping to an empty array', () => {
    const { result } = renderHook(() =>
      useServerTableState<TestRowData>({
        initialState: { grouping: ['age'] },
      }),
    );

    act(() => {
      result.current.handlers.onGroupingChange([]);
    });

    expect(result.current.tableState.grouping).toEqual([]);
  });

  it('should expose grouping inside fetchTrigger', () => {
    const initialGrouping: MRT_GroupingState = ['category'];
    const { result } = renderHook(() =>
      useServerTableState<TestRowData>({
        initialState: { grouping: initialGrouping },
      }),
    );
    expect(result.current.fetchTrigger.grouping).toEqual(initialGrouping);
  });

  it('should update fetchTrigger.grouping when grouping changes', () => {
    const { result } = renderHook(() => useServerTableState<TestRowData>({}));

    act(() => {
      result.current.handlers.onGroupingChange(['region']);
    });

    expect(result.current.fetchTrigger.grouping).toEqual(['region']);
  });

  describe('debounced saveState behaviour', () => {
    // Enable fake timers so vi.advanceTimersByTime controls the debounce delay
    beforeEach(() => {
      vi.useFakeTimers();
    });

    // Restore real timers after each test to avoid affecting other test suites
    afterEach(() => {
      vi.useRealTimers();
    });

    it('should call saveState with the updated grouping after debounce', () => {
      const saveState = vi.fn();

      const { result } = renderHook(() =>
        useServerTableState<TestRowData>({ saveState }),
      );

      const newGrouping: MRT_GroupingState = ['age'];

      act(() => {
        result.current.handlers.onGroupingChange(newGrouping);
      });

      act(() => {
        vi.advanceTimersByTime(DEFAULT_SAVE_DEBOUNCE_MS);
      });

      expect(saveState).toHaveBeenCalledTimes(1);
      expect(saveState).toHaveBeenCalledWith(
        expect.objectContaining({ grouping: newGrouping }),
      );
    });
  });
});
