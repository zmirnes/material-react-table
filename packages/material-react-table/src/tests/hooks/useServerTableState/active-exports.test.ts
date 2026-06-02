import { useServerTableState } from '../../../hooks/useServerTableState';
import { type MRT_ActiveExportsState } from '../../../types';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Debounce delay used by the hook when saveDebounceMs is not explicitly set
const DEFAULT_SAVE_DEBOUNCE_MS = 500;

type TestRowData = { id: string };

// A minimal valid activeExports state — reused across tests to keep them DRY
const INITIAL_EXPORT_STATE: MRT_ActiveExportsState = {
  selectedExports: ['fullReport'],
  selectedFormat: 'xlsx',
  grouped: false,
};

describe('useServerTableState — onActiveExportsChange', () => {
  it('should initialise activeExports as undefined when no initialState is provided', () => {
    const { result } = renderHook(() => useServerTableState<TestRowData>({}));

    // activeExports is optional — undefined means the export toolbar has no saved state
    expect(result.current.tableState.activeExports).toBeUndefined();
  });

  it('should use provided activeExports initial state', () => {
    const { result } = renderHook(() =>
      useServerTableState<TestRowData>({
        initialState: { activeExports: INITIAL_EXPORT_STATE },
      }),
    );

    expect(result.current.tableState.activeExports).toEqual(
      INITIAL_EXPORT_STATE,
    );
  });

  it('should update tableState.activeExports when onActiveExportsChange is called with a new value', () => {
    const { result } = renderHook(() =>
      useServerTableState<TestRowData>({
        initialState: { activeExports: INITIAL_EXPORT_STATE },
      }),
    );

    const updatedState: MRT_ActiveExportsState = {
      selectedExports: ['summary'],
      selectedFormat: 'pdf',
      grouped: false,
    };

    act(() => {
      result.current.handlers.onActiveExportsChange(updatedState);
    });

    expect(result.current.tableState.activeExports).toEqual(updatedState);
  });

  it('should update selectedFormat while keeping other fields unchanged', () => {
    const { result } = renderHook(() =>
      useServerTableState<TestRowData>({
        initialState: { activeExports: INITIAL_EXPORT_STATE },
      }),
    );

    act(() => {
      result.current.handlers.onActiveExportsChange((prev) => ({
        ...(prev ?? INITIAL_EXPORT_STATE),
        selectedFormat: 'pdf',
      }));
    });

    expect(result.current.tableState.activeExports).toEqual({
      ...INITIAL_EXPORT_STATE,
      selectedFormat: 'pdf',
    });
  });

  it('should update selectedExports while keeping selectedFormat unchanged', () => {
    const { result } = renderHook(() =>
      useServerTableState<TestRowData>({
        initialState: { activeExports: INITIAL_EXPORT_STATE },
      }),
    );

    act(() => {
      result.current.handlers.onActiveExportsChange((prev) => ({
        ...(prev ?? INITIAL_EXPORT_STATE),
        selectedExports: ['fullReport', 'summary'],
      }));
    });

    expect(result.current.tableState.activeExports).toEqual({
      ...INITIAL_EXPORT_STATE,
      selectedExports: ['fullReport', 'summary'],
    });
  });

  it('should toggle grouped flag from false to true', () => {
    const { result } = renderHook(() =>
      useServerTableState<TestRowData>({
        initialState: { activeExports: INITIAL_EXPORT_STATE },
      }),
    );

    act(() => {
      result.current.handlers.onActiveExportsChange((prev) => ({
        ...(prev ?? INITIAL_EXPORT_STATE),
        grouped: true,
      }));
    });

    expect(result.current.tableState.activeExports?.grouped).toBe(true);
  });

  it('should support a functional updater that derives new state from previous state', () => {
    const { result } = renderHook(() =>
      useServerTableState<TestRowData>({
        initialState: { activeExports: INITIAL_EXPORT_STATE },
      }),
    );

    // MRT_ExportsToolbar uses functional updaters when toggling individual fields
    act(() => {
      result.current.handlers.onActiveExportsChange((prev) => ({
        ...(prev ?? {
          selectedFormat: null,
          selectedExports: [],
          grouped: false,
        }),
        selectedExports: [...(prev?.selectedExports ?? []), 'detailedLog'],
      }));
    });

    expect(result.current.tableState.activeExports?.selectedExports).toEqual([
      'fullReport',
      'detailedLog',
    ]);
  });

  it('should deselect an export type by filtering it out of selectedExports', () => {
    const { result } = renderHook(() =>
      useServerTableState<TestRowData>({
        initialState: {
          activeExports: {
            selectedExports: ['fullReport', 'summary'],
            selectedFormat: 'xlsx',
            grouped: false,
          },
        },
      }),
    );

    act(() => {
      result.current.handlers.onActiveExportsChange((prev) => ({
        ...(prev ?? { selectedFormat: null, grouped: false }),
        selectedExports: (prev?.selectedExports ?? []).filter(
          (name) => name !== 'summary',
        ),
      }));
    });

    expect(result.current.tableState.activeExports?.selectedExports).toEqual([
      'fullReport',
    ]);
  });

  it('should reset selectedFormat to null and clear selectedExports when format is deselected', () => {
    const { result } = renderHook(() =>
      useServerTableState<TestRowData>({
        initialState: { activeExports: INITIAL_EXPORT_STATE },
      }),
    );

    act(() => {
      result.current.handlers.onActiveExportsChange((prev) => ({
        ...(prev ?? { grouped: false }),
        selectedExports: [],
        selectedFormat: null,
      }));
    });

    expect(result.current.tableState.activeExports).toEqual({
      ...INITIAL_EXPORT_STATE,
      selectedExports: [],
      selectedFormat: null,
    });
  });

  describe('fetchTrigger isolation', () => {
    it('should NOT expose activeExports in fetchTrigger — export state does not trigger a data fetch', () => {
      const { result } = renderHook(() =>
        useServerTableState<TestRowData>({
          initialState: { activeExports: INITIAL_EXPORT_STATE },
        }),
      );

      act(() => {
        result.current.handlers.onActiveExportsChange({
          selectedExports: ['summary'],
          selectedFormat: 'pdf',
          grouped: true,
        });
      });

      expect(
        (result.current.fetchTrigger as Record<string, unknown>).activeExports,
      ).toBeUndefined();
    });

    it('should not change fetchTrigger when activeExports changes', () => {
      const { result } = renderHook(() =>
        useServerTableState<TestRowData>({
          initialState: { activeExports: INITIAL_EXPORT_STATE },
        }),
      );
      const fetchTriggerBefore = result.current.fetchTrigger;

      act(() => {
        result.current.handlers.onActiveExportsChange({
          selectedExports: ['summary'],
          selectedFormat: 'pdf',
          grouped: false,
        });
      });

      expect(result.current.fetchTrigger).toEqual(fetchTriggerBefore);
    });
  });

  describe('tableState — activeExports conditional inclusion', () => {
    it('should not include activeExports in tableState when it is undefined', () => {
      const { result } = renderHook(() => useServerTableState<TestRowData>({}));

      // activeExports must not appear in tableState at all when never initialized
      expect('activeExports' in result.current.tableState).toBe(false);
    });

    it('should include activeExports in tableState once it has been set', () => {
      const { result } = renderHook(() => useServerTableState<TestRowData>({}));

      act(() => {
        result.current.handlers.onActiveExportsChange(INITIAL_EXPORT_STATE);
      });

      expect('activeExports' in result.current.tableState).toBe(true);
      expect(result.current.tableState.activeExports).toEqual(
        INITIAL_EXPORT_STATE,
      );
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

    it('should call saveState with updated activeExports after the debounce delay', () => {
      const saveState = vi.fn();
      const { result } = renderHook(() =>
        useServerTableState<TestRowData>({
          initialState: { activeExports: INITIAL_EXPORT_STATE },
          saveState,
        }),
      );

      const updatedState: MRT_ActiveExportsState = {
        selectedExports: ['summary'],
        selectedFormat: 'pdf',
        grouped: false,
      };

      act(() => {
        result.current.handlers.onActiveExportsChange(updatedState);
      });

      // saveState must not fire before the debounce expires
      expect(saveState).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(DEFAULT_SAVE_DEBOUNCE_MS);
      });

      expect(saveState).toHaveBeenCalledTimes(1);
      expect(saveState).toHaveBeenCalledWith(
        expect.objectContaining({ activeExports: updatedState }),
      );
    });

    it('should NOT call saveState before the debounce delay expires', () => {
      const saveState = vi.fn();
      const { result } = renderHook(() =>
        useServerTableState<TestRowData>({
          initialState: { activeExports: INITIAL_EXPORT_STATE },
          saveState,
        }),
      );

      act(() => {
        result.current.handlers.onActiveExportsChange({
          selectedExports: ['summary'],
          selectedFormat: 'pdf',
          grouped: false,
        });
      });

      act(() => {
        vi.advanceTimersByTime(DEFAULT_SAVE_DEBOUNCE_MS - 1);
      });

      expect(saveState).not.toHaveBeenCalled();
    });

    it('should debounce multiple rapid export state changes into a single saveState call', () => {
      const saveState = vi.fn();
      const { result } = renderHook(() =>
        useServerTableState<TestRowData>({
          initialState: { activeExports: INITIAL_EXPORT_STATE },
          saveState,
        }),
      );

      // Three rapid changes — only the last one should be saved
      act(() => {
        result.current.handlers.onActiveExportsChange((prev) => ({
          ...(prev ?? INITIAL_EXPORT_STATE),
          selectedFormat: 'csv',
        }));
      });
      act(() => {
        result.current.handlers.onActiveExportsChange((prev) => ({
          ...(prev ?? INITIAL_EXPORT_STATE),
          selectedFormat: 'pdf',
        }));
      });
      act(() => {
        result.current.handlers.onActiveExportsChange((prev) => ({
          ...(prev ?? INITIAL_EXPORT_STATE),
          selectedFormat: 'xlsx',
          grouped: true,
        }));
      });

      act(() => {
        vi.advanceTimersByTime(DEFAULT_SAVE_DEBOUNCE_MS);
      });

      expect(saveState).toHaveBeenCalledTimes(1);
      expect(saveState).toHaveBeenCalledWith(
        expect.objectContaining({
          activeExports: expect.objectContaining({
            selectedFormat: 'xlsx',
            grouped: true,
          }),
        }),
      );
    });

    it('should not call saveState when saveState is not provided', () => {
      // No saveState — hook must not throw
      const { result } = renderHook(() =>
        useServerTableState<TestRowData>({
          initialState: { activeExports: INITIAL_EXPORT_STATE },
        }),
      );

      act(() => {
        result.current.handlers.onActiveExportsChange({
          selectedExports: [],
          selectedFormat: null,
          grouped: false,
        });
      });

      act(() => {
        vi.advanceTimersByTime(DEFAULT_SAVE_DEBOUNCE_MS);
      });

      // No assertion on a mock — just verifying no exception was thrown
      expect(
        result.current.tableState.activeExports?.selectedFormat,
      ).toBeNull();
    });
  });
});
