import { type Dispatch, type SetStateAction, useMemo, useState } from 'react';
import { functionalUpdate } from '@tanstack/react-table';
import type {
  MRT_ActiveExportsState,
  MRT_ColumnOrderState,
  MRT_ColumnPinningState,
  MRT_ColumnSizingState,
  MRT_DensityState,
  MRT_ExpandedState,
  MRT_FiltersState,
  MRT_GroupingState,
  MRT_PaginationState,
  MRT_RowData,
  MRT_RowSelectionState,
  MRT_SortingState,
  MRT_TableState,
  MRT_VisibilityState,
  UseServerTableStateOptions,
  UseServerTableStateReturn,
} from '../types';
import { useDebouncedCallback } from 'use-debounce';

export const useServerTableState = <TData extends MRT_RowData>({
  initialState,
  saveState,
  saveDebounceMs = 500,
}: UseServerTableStateOptions<TData>): UseServerTableStateReturn => {
  // --- State that triggers a data fetch ---
  const [pagination, setPagination] = useState<MRT_PaginationState>(
    initialState?.pagination ?? { pageIndex: 0, pageSize: 10 },
  );
  const [sorting, setSorting] = useState<MRT_SortingState>(
    initialState?.sorting ?? [],
  );
  const [grouping, setGrouping] = useState<MRT_GroupingState>(
    initialState?.grouping ?? [],
  );
  const [filters, setFilters] = useState<MRT_FiltersState>(
    initialState?.filters ?? {
      logicOperator: 'and',
      rules: [],
      pinnedFilters: [],
    },
  );

  // --- State that is only persisted (does not trigger a fetch) ---
  const [columnSizing, setColumnSizing] = useState<MRT_ColumnSizingState>(
    initialState?.columnSizing ?? {},
  );
  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>(
    initialState?.columnVisibility ?? {},
  );
  // Counter that increments only when a column transitions from hidden to visible (false → true)
  const [columnVisibilityShowTrigger, setColumnVisibilityShowTrigger] =
    useState(0);
  const [columnOrder, setColumnOrder] = useState<MRT_ColumnOrderState | null>(
    initialState?.columnOrder ?? null,
  );
  const [columnPinning, setColumnPinning] = useState<MRT_ColumnPinningState>(
    initialState?.columnPinning ?? { left: [], right: [] },
  );
  const [density, setDensity] = useState<MRT_DensityState>(
    initialState?.density ?? 'compact',
  );
  const [expanded, setExpanded] = useState<MRT_ExpandedState>(
    initialState?.expanded ?? {},
  );
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>(
    initialState?.rowSelection ?? {},
  );
  const [activeExports, setActiveExports] = useState<
    MRT_ActiveExportsState | undefined
  >(initialState?.activeExports);

  // --- Debounced save ---
  // saveState is optional — if not provided, do nothing
  const debouncedSave = useDebouncedCallback(
    (partial: Partial<MRT_TableState<TData>>) => {
      if (!saveState) return;

      // Use functional update pattern to always work with the latest values
      saveState({
        filters,
        pagination,
        sorting,
        grouping,
        columnSizing,
        columnVisibility,
        ...(columnOrder !== null && { columnOrder }),
        columnPinning,
        density,
        expanded,
        rowSelection,
        ...(activeExports !== undefined && { activeExports }),
        ...partial, // override with the latest values
      } as MRT_TableState<TData>);
    },
    saveDebounceMs,
  );

  // --- Internal helper: creates a handler that updates state and debounced-saves ---
  const makePersistentHandler = <T>(
    setter: Dispatch<SetStateAction<T>>,
    currentValue: T,
    stateKey: keyof MRT_TableState<TData>,
  ) => {
    return (updater: SetStateAction<T>) => {
      setter(updater);
      debouncedSave({
        [stateKey]: functionalUpdate(updater, currentValue),
      } as Partial<MRT_TableState<TData>>);
    };
  };

  const filterRules = useMemo(
    () => ({ rules: filters.rules, logicOperator: filters.logicOperator }),
    [filters.rules, filters.logicOperator],
  );

  return {
    tableState: {
      filters,
      pagination,
      sorting,
      grouping,
      columnSizing,
      columnVisibility,
      ...(columnOrder !== null && { columnOrder }),
      columnPinning,
      density,
      expanded,
      rowSelection,
      ...(activeExports !== undefined && { activeExports }),
    },

    handlers: {
      // Fetch triggers — only update state, do not persist
      // Exception: pinnedFilters changes are UI-only (no fetch) and must be saved
      onFiltersChange: (updater) => {
        const newFilters = functionalUpdate(updater, filters);
        setFilters(newFilters);
        if (newFilters.pinnedFilters !== filters.pinnedFilters) {
          debouncedSave({ filters: newFilters });
        }
      },
      onPaginationChange: setPagination,
      onSortingChange: setSorting,
      onGroupingChange: setGrouping,

      // Persistent handlers — update state and debounced-save
      onColumnSizingChange: makePersistentHandler(
        setColumnSizing,
        columnSizing,
        'columnSizing',
      ),
      onColumnVisibilityChange: (updater) => {
        const newVisibility = functionalUpdate(updater, columnVisibility);
        setColumnVisibility(newVisibility);
        debouncedSave({ columnVisibility: newVisibility });

        // Trigger a fetch only when at least one column transitions from hidden (false) to visible (true)
        const hasNewlyVisibleColumn = Object.entries(newVisibility).some(
          ([colId, isVisible]) =>
            isVisible && columnVisibility[colId] === false,
        );
        if (hasNewlyVisibleColumn) {
          setColumnVisibilityShowTrigger((prev) => prev + 1);
        }
      },
      onColumnOrderChange: (updater) => {
        const newValue = functionalUpdate(updater, columnOrder ?? []);
        setColumnOrder(newValue);
        debouncedSave({ columnOrder: newValue });
      },
      onColumnPinningChange: makePersistentHandler(
        setColumnPinning,
        columnPinning,
        'columnPinning',
      ),
      onDensityChange: makePersistentHandler(setDensity, density, 'density'),
      onExpandedChange: makePersistentHandler(
        setExpanded,
        expanded,
        'expanded',
      ),
      onRowSelectionChange: makePersistentHandler(
        setRowSelection,
        rowSelection,
        'rowSelection',
      ),
      onActiveExportsChange: (
        updater: SetStateAction<MRT_ActiveExportsState | undefined>,
      ) => {
        const newValue = functionalUpdate(updater, activeExports);
        setActiveExports(newValue);
        debouncedSave({ activeExports: newValue });
      },
    },

    // Only these go into useEffect deps for the data fetch
    fetchTrigger: {
      filterRules,
      pagination,
      sorting,
      grouping,
      columnVisibilityShowTrigger,
    },
  };
};
