import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { useReactTable } from '@tanstack/react-table';
import { getMRT_RowActionsColumnDef } from './display-columns/getMRT_RowActionsColumnDef';
import { getMRT_RowDragColumnDef } from './display-columns/getMRT_RowDragColumnDef';
import { getMRT_RowExpandColumnDef } from './display-columns/getMRT_RowExpandColumnDef';
import { getMRT_RowNumbersColumnDef } from './display-columns/getMRT_RowNumbersColumnDef';
import { getMRT_RowPinningColumnDef } from './display-columns/getMRT_RowPinningColumnDef';
import { getMRT_RowSelectColumnDef } from './display-columns/getMRT_RowSelectColumnDef';
import { getMRT_RowSpacerColumnDef } from './display-columns/getMRT_RowSpacerColumnDef';
import { useMRT_Effects } from './useMRT_Effects';
import {
  handleAddRow,
  handleRemoveRow,
  handleSetRows,
  handleUpdateRow,
  handleUpsertRow,
} from '../fns/tableCrudFns';
import {
  type MRT_Cell,
  type MRT_Column,
  type MRT_ColumnDef,
  type MRT_ColumnFilterFnsState,
  type MRT_ColumnOrderState,
  type MRT_ColumnSizingInfoState,
  type MRT_DefinedTableOptions,
  type MRT_DensityState,
  type MRT_FilterOption,
  type MRT_FiltersState,
  type MRT_GroupingState,
  type MRT_NewEntryModalState,
  type MRT_PaginationState,
  type MRT_Row,
  type MRT_RowData,
  type MRT_RowReorderingSelectionState,
  type MRT_SavedFilters,
  type MRT_StatefulTableOptions,
  type MRT_TableInstance,
  type MRT_TableState,
  type MRT_Updater,
} from '../types';
import {
  getAllLeafColumnDefs,
  getColumnId,
  getDefaultColumnFilterFn,
  prepareColumns,
} from '../utils/column.utils';
import {
  getDefaultColumnOrderIds,
  getDefaultColumnPinningState,
  showRowActionsColumn,
  showRowDragColumn,
  showRowExpandColumn,
  showRowNumbersColumn,
  showRowPinningColumn,
  showRowSelectionColumn,
  showRowSpacerColumn,
} from '../utils/displayColumn.utils';
import { createSliceStore } from '../utils/mrtStore';
import { createRow } from '../utils/tanstack.helpers';

/**
 * The MRT hook that wraps the TanStack useReactTable hook and adds additional functionality
 * @param definedTableOptions - table options with proper defaults set
 * @returns the MRT table instance
 */
export const useMRT_TableInstance = <TData extends MRT_RowData>(
  definedTableOptions: MRT_DefinedTableOptions<TData>,
): MRT_TableInstance<TData> => {
  const lastSelectedRowId = useRef<null | string>(null);
  const allSelectableRowIdsRef = useRef<string[]>([]);
  const actionCellRef = useRef<HTMLTableCellElement>(null);
  const bottomToolbarRef = useRef<HTMLDivElement>(null);
  const editInputRefs = useRef<Record<string, HTMLInputElement>>({});
  const filterInputRefs = useRef<Record<string, HTMLInputElement>>({});
  const searchInputRef = useRef<HTMLInputElement>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const tableHeadCellRefs = useRef<Record<string, HTMLTableCellElement>>({});
  const tablePaperRef = useRef<HTMLDivElement>(null);
  const topToolbarRef = useRef<HTMLDivElement>(null);
  const tableHeadRef = useRef<HTMLTableSectionElement>(null);
  const tableFooterRef = useRef<HTMLTableSectionElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const isResizingRef = useRef<false | string>(false);
  const resizeIndicatorRef = useRef<HTMLDivElement>(null);

  //transform initial state with proper column order
  const initialState: Partial<MRT_TableState<TData>> = useMemo(() => {
    const initState = definedTableOptions.initialState ?? {};
    // Resolve the merged options snapshot used for display-column helpers
    const mergedOptionsSnapshot = {
      ...definedTableOptions,
      state: {
        ...definedTableOptions.initialState,
        ...definedTableOptions.state,
      },
    } as MRT_StatefulTableOptions<TData>;

    initState.columnOrder =
      initState.columnOrder ?? getDefaultColumnOrderIds(mergedOptionsSnapshot);

    // Ensure the checkbox column is always the leftmost sticky column when
    // row selection is enabled, regardless of what the user pinned initially.
    // The checkbox is pinned for positioning only — visual styles are overridden
    // in style.utils.ts so it looks like a regular center column.
    initState.columnPinning = getDefaultColumnPinningState(
      mergedOptionsSnapshot,
      initState.columnPinning ?? {},
    );

    initState.globalFilterFn = definedTableOptions.globalFilterFn ?? 'fuzzy';
    initState.showAdvancedFilters = initState.showAdvancedFilters ?? false;
    return initState;
  }, []);

  definedTableOptions.initialState = initialState;

  const [creatingRow, _setCreatingRow] = useState<MRT_Row<TData> | null>(
    initialState.creatingRow ?? null,
  );
  const [columnFilterFns, setColumnFilterFns] =
    useState<MRT_ColumnFilterFnsState>(() =>
      Object.assign(
        {},
        ...getAllLeafColumnDefs(
          definedTableOptions.columns as MRT_ColumnDef<TData>[],
        ).map((col) => ({
          [getColumnId(col)]:
            col.filterFn instanceof Function
              ? (col.filterFn.name ?? 'custom')
              : (col.filterFn ??
                initialState?.columnFilterFns?.[getColumnId(col)] ??
                getDefaultColumnFilterFn(col)),
        })),
      ),
    );
  const [columnOrder, onColumnOrderChange] = useState<MRT_ColumnOrderState>(
    initialState.columnOrder ?? [],
  );
  // Hover/drag are UI-feedback-only and change at very high frequency during a drag
  // gesture (every cell crossed) — kept in slice stores instead of useState so
  // subscribers can select just the boolean they need instead of re-rendering the tree.
  const [dragStore] = useState(() =>
    createSliceStore({
      draggingColumn: (initialState.draggingColumn ??
        null) as MRT_Column<TData> | null,
      draggingRow: (initialState.draggingRow ?? null) as MRT_Row<TData> | null,
    }),
  );
  const [filters, setFilters] = useState<MRT_FiltersState>(
    initialState.filters ?? {
      logicOperator: 'and',
      rules: [],
      pinnedFilters: [],
    },
  );
  const [globalFilterFn, setGlobalFilterFn] = useState<MRT_FilterOption>(
    initialState.globalFilterFn ?? 'fuzzy',
  );
  const [grouping, onGroupingChange] = useState<MRT_GroupingState>(
    initialState.grouping ?? [],
  );
  const [hoverStore] = useState(() =>
    createSliceStore({
      hoveredColumn: (initialState.hoveredColumn ?? null) as Partial<
        MRT_Column<TData>
      > | null,
      hoveredRow: (initialState.hoveredRow ?? null) as Partial<
        MRT_Row<TData>
      > | null,
    }),
  );
  // Everything below is UI-only feedback state that never influences the TanStack row/
  // column model (unlike filters/pagination/grouping/columnOrder/creatingRow/rows) —
  // kept in one combined store instead of 13 separate useState hooks so none of it
  // triggers a root re-render; consumers select just the field(s) they need via
  // useMRT_SliceValue.
  const [uiStore] = useState(() =>
    createSliceStore({
      actionCell: (initialState.actionCell ?? null) as MRT_Cell<TData> | null,
      columnSizingInfo: (initialState.columnSizingInfo ??
        {}) as MRT_ColumnSizingInfoState,
      density: (initialState?.density ?? 'compact') as MRT_DensityState,
      editingCell: (initialState.editingCell ?? null) as MRT_Cell<TData> | null,
      editingRow: (initialState.editingRow ?? null) as MRT_Row<TData> | null,
      newEntryModal: (initialState?.newEntryModal ?? {
        open: false,
      }) as MRT_NewEntryModalState,
      rowReorderingSelection: (initialState?.rowReorderingSelection ??
        {}) as MRT_RowReorderingSelectionState,
      // Saved filter presets — initialised from the dedicated option so the consumer
      // can hydrate them from the server response before rendering.
      savedFilters: (definedTableOptions.initialSavedFilters ??
        {}) as MRT_SavedFilters,
      showAlertBanner: (initialState?.showAlertBanner ?? false) as boolean,
      showColumnFilters: (initialState?.showColumnFilters ?? false) as boolean,
      showGlobalFilter: (initialState?.showGlobalFilter ?? false) as boolean,
      showProgressBars: (initialState?.showProgressBars ?? false) as boolean,
      showToolbarDropZone: (initialState?.showToolbarDropZone ??
        false) as boolean,
    }),
  );
  // columnSizingInfo isn't an MRT-level `table.setX` wrapper — TanStack auto-generates
  // `table.setColumnSizingInfo` bound to whatever `onColumnSizingInfoChange` we pass into
  // useReactTable below, so redirecting it here is enough for every internal call
  // (column.resetSize(), the resize-handle double-click reset, etc.) to land in the store.
  const onColumnSizingInfoChange = (
    updater: MRT_Updater<MRT_ColumnSizingInfoState>,
  ) =>
    uiStore.set((prev) => ({
      ...prev,
      columnSizingInfo:
        updater instanceof Function ? updater(prev.columnSizingInfo) : updater,
    }));
  const [pagination, onPaginationChange] = useState<MRT_PaginationState>(
    initialState?.pagination ?? { pageIndex: 0, pageSize: 10 },
  );
  const showAdvancedFiltersSetterRef = useRef<Dispatch<
    SetStateAction<boolean>
  > | null>(null);
  const [rows, setRowsState] = useState<TData[]>(
    definedTableOptions.data ?? [],
  );

  definedTableOptions.state = {
    columnFilterFns,
    columnOrder,
    creatingRow,
    filters,
    globalFilterFn,
    grouping,
    pagination,
    ...definedTableOptions.state,
  };

  // Sync a controlled consumer's state.draggingColumn/draggingRow/hoveredColumn/
  // hoveredRow into the slice stores — rare (these are usually left uncontrolled), but
  // since they no longer flow through definedTableOptions.state -> useReactTable, an
  // externally-controlled value needs an explicit bridge into the store.
  useEffect(() => {
    if (definedTableOptions.state?.draggingColumn !== undefined) {
      dragStore.set((prev) => ({
        ...prev,
        draggingColumn: definedTableOptions.state!.draggingColumn!,
      }));
    }
  }, [definedTableOptions.state?.draggingColumn]);
  useEffect(() => {
    if (definedTableOptions.state?.draggingRow !== undefined) {
      dragStore.set((prev) => ({
        ...prev,
        draggingRow: definedTableOptions.state!.draggingRow!,
      }));
    }
  }, [definedTableOptions.state?.draggingRow]);
  useEffect(() => {
    if (definedTableOptions.state?.hoveredColumn !== undefined) {
      hoverStore.set((prev) => ({
        ...prev,
        hoveredColumn: definedTableOptions.state!.hoveredColumn!,
      }));
    }
  }, [definedTableOptions.state?.hoveredColumn]);
  useEffect(() => {
    if (definedTableOptions.state?.hoveredRow !== undefined) {
      hoverStore.set((prev) => ({
        ...prev,
        hoveredRow: definedTableOptions.state!.hoveredRow!,
      }));
    }
  }, [definedTableOptions.state?.hoveredRow]);

  // Same bridge as above, for the 12 UI-only fields in uiStore (columnSizingInfo is
  // deliberately excluded — it isn't part of the table.setX = onXChange ?? ... pattern,
  // see onColumnSizingInfoChange above).
  useEffect(() => {
    if (definedTableOptions.state?.actionCell !== undefined) {
      uiStore.set((prev) => ({
        ...prev,
        actionCell: definedTableOptions.state!.actionCell!,
      }));
    }
  }, [definedTableOptions.state?.actionCell]);
  useEffect(() => {
    if (definedTableOptions.state?.density !== undefined) {
      uiStore.set((prev) => ({
        ...prev,
        density: definedTableOptions.state!.density!,
      }));
    }
  }, [definedTableOptions.state?.density]);
  useEffect(() => {
    if (definedTableOptions.state?.editingCell !== undefined) {
      uiStore.set((prev) => ({
        ...prev,
        editingCell: definedTableOptions.state!.editingCell!,
      }));
    }
  }, [definedTableOptions.state?.editingCell]);
  useEffect(() => {
    if (definedTableOptions.state?.editingRow !== undefined) {
      uiStore.set((prev) => ({
        ...prev,
        editingRow: definedTableOptions.state!.editingRow!,
      }));
    }
  }, [definedTableOptions.state?.editingRow]);
  useEffect(() => {
    if (definedTableOptions.state?.newEntryModal !== undefined) {
      uiStore.set((prev) => ({
        ...prev,
        newEntryModal: definedTableOptions.state!.newEntryModal!,
      }));
    }
  }, [definedTableOptions.state?.newEntryModal]);
  useEffect(() => {
    if (definedTableOptions.state?.rowReorderingSelection !== undefined) {
      uiStore.set((prev) => ({
        ...prev,
        rowReorderingSelection:
          definedTableOptions.state!.rowReorderingSelection!,
      }));
    }
  }, [definedTableOptions.state?.rowReorderingSelection]);
  useEffect(() => {
    if (definedTableOptions.state?.savedFilters !== undefined) {
      uiStore.set((prev) => ({
        ...prev,
        savedFilters: definedTableOptions.state!.savedFilters!,
      }));
    }
  }, [definedTableOptions.state?.savedFilters]);
  useEffect(() => {
    if (definedTableOptions.state?.showAlertBanner !== undefined) {
      uiStore.set((prev) => ({
        ...prev,
        showAlertBanner: definedTableOptions.state!.showAlertBanner!,
      }));
    }
  }, [definedTableOptions.state?.showAlertBanner]);
  useEffect(() => {
    if (definedTableOptions.state?.showColumnFilters !== undefined) {
      uiStore.set((prev) => ({
        ...prev,
        showColumnFilters: definedTableOptions.state!.showColumnFilters!,
      }));
    }
  }, [definedTableOptions.state?.showColumnFilters]);
  useEffect(() => {
    if (definedTableOptions.state?.showGlobalFilter !== undefined) {
      uiStore.set((prev) => ({
        ...prev,
        showGlobalFilter: definedTableOptions.state!.showGlobalFilter!,
      }));
    }
  }, [definedTableOptions.state?.showGlobalFilter]);
  useEffect(() => {
    if (definedTableOptions.state?.showProgressBars !== undefined) {
      uiStore.set((prev) => ({
        ...prev,
        showProgressBars: definedTableOptions.state!.showProgressBars!,
      }));
    }
  }, [definedTableOptions.state?.showProgressBars]);
  useEffect(() => {
    if (definedTableOptions.state?.showToolbarDropZone !== undefined) {
      uiStore.set((prev) => ({
        ...prev,
        showToolbarDropZone: definedTableOptions.state!.showToolbarDropZone!,
      }));
    }
  }, [definedTableOptions.state?.showToolbarDropZone]);

  // Normalize controlled columnPinning state: if the user passes state.columnPinning
  // directly (controlled mode), we still need to ensure that the checkbox column
  // is always at the front of the left-pinned group, just like we do for initialState.
  const assembledColumnPinning = definedTableOptions.state.columnPinning;
  if (assembledColumnPinning && !!definedTableOptions.enableRowSelection) {
    definedTableOptions.state = {
      ...definedTableOptions.state,
      columnPinning: getDefaultColumnPinningState(
        definedTableOptions,
        assembledColumnPinning,
      ),
    };
  }

  //The table options now include all state needed to help determine column visibility and order logic
  const statefulTableOptions =
    definedTableOptions as MRT_StatefulTableOptions<TData>;

  const resolveRowId =
    statefulTableOptions.getRowId ??
    ((_originalRow: TData, index: number, _parentRow?: MRT_Row<TData>) =>
      String(index));

  //keep the prepared column tree referentially stable so TanStack's
  //getAllColumns/getAllLeafColumns/row.getAllCells memo chain doesn't
  //recompute (and recreate every cell of every row) on unrelated renders
  //like hover, menu open/close, or density toggle
  const rawColumns = statefulTableOptions.columns;
  const {
    aggregationFns,
    createDisplayMode,
    defaultDisplayColumn,
    displayColumnDefOptions,
    editDisplayMode,
    enableEditing,
    enableExpanding,
    enableGrouping,
    enableRowActions,
    enableRowDragging,
    enableRowNumbers,
    enableRowOrdering,
    enableRowPinning,
    enableRowSelection,
    filterFns,
    layoutMode,
    localization,
    renderDetailPanel,
    rowNumberDisplayMode,
    rowPinningDisplayMode,
    sortingFns,
  } = statefulTableOptions;
  //read from the final merged state (consumers/MaterialReactServerTableInstance
  //may control these via the `state` option, which overrides the internal
  //useState values above)
  const {
    columnFilterFns: stateColumnFilterFns,
    creatingRow: stateCreatingRow,
    grouping: stateGrouping,
  } = statefulTableOptions.state;

  statefulTableOptions.columns = useMemo(
    () =>
      prepareColumns({
        columnDefs: [
          ...([
            showRowPinningColumn(statefulTableOptions) &&
              getMRT_RowPinningColumnDef(statefulTableOptions),
            showRowDragColumn(statefulTableOptions) &&
              getMRT_RowDragColumnDef(statefulTableOptions),
            showRowActionsColumn(statefulTableOptions) &&
              getMRT_RowActionsColumnDef(statefulTableOptions),
            showRowExpandColumn(statefulTableOptions) &&
              getMRT_RowExpandColumnDef(statefulTableOptions),
            showRowSelectionColumn(statefulTableOptions) &&
              getMRT_RowSelectColumnDef(statefulTableOptions),
            showRowNumbersColumn(statefulTableOptions) &&
              getMRT_RowNumbersColumnDef(statefulTableOptions),
          ].filter(Boolean) as MRT_ColumnDef<TData>[]),
          ...rawColumns,
          ...([
            showRowSpacerColumn(statefulTableOptions) &&
              getMRT_RowSpacerColumnDef(statefulTableOptions),
          ].filter(Boolean) as MRT_ColumnDef<TData>[]),
        ],
        tableOptions: statefulTableOptions,
      }),
    [
      rawColumns,
      aggregationFns,
      createDisplayMode,
      defaultDisplayColumn,
      displayColumnDefOptions,
      editDisplayMode,
      enableEditing,
      enableExpanding,
      enableGrouping,
      enableRowActions,
      enableRowDragging,
      enableRowNumbers,
      enableRowOrdering,
      enableRowPinning,
      enableRowSelection,
      filterFns,
      layoutMode,
      localization,
      renderDetailPanel,
      rowNumberDisplayMode,
      rowPinningDisplayMode,
      sortingFns,
      stateColumnFilterFns,
      stateCreatingRow,
      stateGrouping,
    ],
  );

  //if loading, generate blank rows to show skeleton loaders
  statefulTableOptions.data = useMemo(
    () =>
      (statefulTableOptions.state.isLoading ||
        statefulTableOptions.state.showSkeletons) &&
      !rows.length
        ? [
            ...Array(
              Math.min(statefulTableOptions.state.pagination.pageSize, 20),
            ).fill(null),
          ].map(() =>
            Object.assign(
              {},
              ...getAllLeafColumnDefs(statefulTableOptions.columns).map(
                (col) => ({
                  [getColumnId(col)]: null,
                }),
              ),
            ),
          )
        : rows,
    [
      rows,
      statefulTableOptions.state.isLoading,
      statefulTableOptions.state.showSkeletons,
    ],
  );

  //@ts-expect-error
  const table = useReactTable({
    onColumnOrderChange,
    onColumnSizingInfoChange,
    onGroupingChange,
    onPaginationChange,
    ...statefulTableOptions,
    globalFilterFn: statefulTableOptions.filterFns?.[globalFilterFn ?? 'fuzzy'],
  }) as MRT_TableInstance<TData>;

  table.refs = {
    actionCellRef,
    allSelectableRowIdsRef,
    bottomToolbarRef,
    editInputRefs,
    filterInputRefs,
    isResizingRef,
    lastSelectedRowId,
    resizeIndicatorRef,
    searchInputRef,
    tableContainerRef,
    tableFooterRef,
    tableHeadCellRefs,
    tableHeadRef,
    tablePaperRef,
    tableRef,
    topToolbarRef,
  };

  table._dragStore = dragStore;
  table._hoverStore = hoverStore;
  table._uiStore = uiStore;

  // Merge the slice stores back into getState() so every existing/external
  // `table.getState().hoveredColumn`-style read keeps working unchanged.
  const originalGetState = table.getState;
  table.getState = () => ({
    ...originalGetState(),
    ...dragStore.get(),
    ...hoverStore.get(),
    ...uiStore.get(),
  });

  table.setActionCell =
    statefulTableOptions.onActionCellChange ??
    ((updater) =>
      uiStore.set((prev) => ({
        ...prev,
        actionCell:
          updater instanceof Function ? updater(prev.actionCell) : updater,
      })));
  table.setCreatingRow = (row: MRT_Updater<MRT_Row<TData> | null | true>) => {
    let _row = row;
    if (row === true) {
      _row = createRow(table);
    }
    statefulTableOptions?.onCreatingRowChange?.(
      _row as MRT_Row<TData> | null,
    ) ?? _setCreatingRow(_row as MRT_Row<TData> | null);
  };
  table.setColumnFilterFns =
    statefulTableOptions.onColumnFilterFnsChange ?? setColumnFilterFns;
  table.setDensity =
    statefulTableOptions.onDensityChange ??
    ((updater) =>
      uiStore.set((prev) => ({
        ...prev,
        density: updater instanceof Function ? updater(prev.density) : updater,
      })));
  table.setDraggingColumn =
    statefulTableOptions.onDraggingColumnChange ??
    ((updater) =>
      dragStore.set((prev) => ({
        ...prev,
        draggingColumn:
          updater instanceof Function ? updater(prev.draggingColumn) : updater,
      })));
  table.setDraggingRow =
    statefulTableOptions.onDraggingRowChange ??
    ((updater) =>
      dragStore.set((prev) => ({
        ...prev,
        draggingRow:
          updater instanceof Function ? updater(prev.draggingRow) : updater,
      })));
  table.setEditingCell =
    statefulTableOptions.onEditingCellChange ??
    ((updater) =>
      uiStore.set((prev) => ({
        ...prev,
        editingCell:
          updater instanceof Function ? updater(prev.editingCell) : updater,
      })));
  table.setEditingRow =
    statefulTableOptions.onEditingRowChange ??
    ((updater) =>
      uiStore.set((prev) => ({
        ...prev,
        editingRow:
          updater instanceof Function ? updater(prev.editingRow) : updater,
      })));
  table.setFilters = statefulTableOptions.onFiltersChange ?? setFilters;
  table.setGlobalFilterFn =
    statefulTableOptions.onGlobalFilterFnChange ?? setGlobalFilterFn;
  table.setHoveredColumn =
    statefulTableOptions.onHoveredColumnChange ??
    ((updater) =>
      hoverStore.set((prev) => ({
        ...prev,
        hoveredColumn:
          updater instanceof Function ? updater(prev.hoveredColumn) : updater,
      })));
  table.setHoveredRow =
    statefulTableOptions.onHoveredRowChange ??
    ((updater) =>
      hoverStore.set((prev) => ({
        ...prev,
        hoveredRow:
          updater instanceof Function ? updater(prev.hoveredRow) : updater,
      })));
  table.setSavedFilters = (updater) =>
    uiStore.set((prev) => ({
      ...prev,
      savedFilters:
        updater instanceof Function ? updater(prev.savedFilters) : updater,
    }));
  table.setShowAlertBanner =
    statefulTableOptions.onShowAlertBannerChange ??
    ((updater) =>
      uiStore.set((prev) => ({
        ...prev,
        showAlertBanner:
          updater instanceof Function ? updater(prev.showAlertBanner) : updater,
      })));
  table._showAdvancedFiltersSetterRef = showAdvancedFiltersSetterRef;
  table.setShowAdvancedFilters =
    statefulTableOptions.onShowAdvancedFiltersChange ??
    ((updater) => showAdvancedFiltersSetterRef.current?.(updater));
  table.setShowColumnFilters =
    statefulTableOptions.onShowColumnFiltersChange ??
    ((updater) =>
      uiStore.set((prev) => ({
        ...prev,
        showColumnFilters:
          updater instanceof Function
            ? updater(prev.showColumnFilters)
            : updater,
      })));
  table.setShowGlobalFilter =
    statefulTableOptions.onShowGlobalFilterChange ??
    ((updater) =>
      uiStore.set((prev) => ({
        ...prev,
        showGlobalFilter:
          updater instanceof Function
            ? updater(prev.showGlobalFilter)
            : updater,
      })));
  table.setShowProgressBars = (updater) =>
    uiStore.set((prev) => ({
      ...prev,
      showProgressBars:
        updater instanceof Function ? updater(prev.showProgressBars) : updater,
    }));
  table.setShowToolbarDropZone =
    statefulTableOptions.onShowToolbarDropZoneChange ??
    ((updater) =>
      uiStore.set((prev) => ({
        ...prev,
        showToolbarDropZone:
          updater instanceof Function
            ? updater(prev.showToolbarDropZone)
            : updater,
      })));
  table.setNewEntryModal = (updater) =>
    uiStore.set((prev) => ({
      ...prev,
      newEntryModal:
        updater instanceof Function ? updater(prev.newEntryModal) : updater,
    }));
  table.setRowReorderingSelection =
    statefulTableOptions.onRowReorderingSelectionChange ??
    ((updater) =>
      uiStore.set((prev) => ({
        ...prev,
        rowReorderingSelection:
          updater instanceof Function
            ? updater(prev.rowReorderingSelection)
            : updater,
      })));
  table.addRow = handleAddRow({
    setRowsState,
    getRowId: resolveRowId,
  });
  table.updateRow = handleUpdateRow({
    setRowsState,
    getRowId: resolveRowId,
  });
  table.setRows = handleSetRows({
    setRowsState,
    getRowId: resolveRowId,
  });
  table.upsertRow = handleUpsertRow({
    setRowsState,
    getRowId: resolveRowId,
  });
  table.removeRow = handleRemoveRow({
    setRowsState,
    getRowId: resolveRowId,
  });
  useMRT_Effects(table);

  return table;
};
