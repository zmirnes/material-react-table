import { useMemo, useRef, useState } from 'react';
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

  const [actionCell, setActionCell] = useState<MRT_Cell<TData> | null>(
    initialState.actionCell ?? null,
  );
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
  const [columnSizingInfo, onColumnSizingInfoChange] =
    useState<MRT_ColumnSizingInfoState>(
      initialState.columnSizingInfo ?? ({} as MRT_ColumnSizingInfoState),
    );
  const [density, setDensity] = useState<MRT_DensityState>(
    initialState?.density ?? 'compact',
  );
  const [draggingColumn, setDraggingColumn] =
    useState<MRT_Column<TData> | null>(initialState.draggingColumn ?? null);
  const [draggingRow, setDraggingRow] = useState<MRT_Row<TData> | null>(
    initialState.draggingRow ?? null,
  );
  const [editingCell, setEditingCell] = useState<MRT_Cell<TData> | null>(
    initialState.editingCell ?? null,
  );
  const [editingRow, setEditingRow] = useState<MRT_Row<TData> | null>(
    initialState.editingRow ?? null,
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
  const [hoveredColumn, setHoveredColumn] = useState<Partial<
    MRT_Column<TData>
  > | null>(initialState.hoveredColumn ?? null);
  const [hoveredRow, setHoveredRow] = useState<Partial<MRT_Row<TData>> | null>(
    initialState.hoveredRow ?? null,
  );
  const [isFullScreen, setIsFullScreen] = useState<boolean>(
    initialState?.isFullScreen ?? false,
  );
  const [pagination, onPaginationChange] = useState<MRT_PaginationState>(
    initialState?.pagination ?? { pageIndex: 0, pageSize: 10 },
  );
  const [showAlertBanner, setShowAlertBanner] = useState<boolean>(
    initialState?.showAlertBanner ?? false,
  );
  const [showColumnFilters, setShowColumnFilters] = useState<boolean>(
    initialState?.showColumnFilters ?? false,
  );
  const [showGlobalFilter, setShowGlobalFilter] = useState<boolean>(
    initialState?.showGlobalFilter ?? false,
  );
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(
    initialState?.showAdvancedFilters ??
      Boolean(
        definedTableOptions.enableAdvancedFilters &&
          definedTableOptions.manualFiltering,
      ),
  );
  const [showToolbarDropZone, setShowToolbarDropZone] = useState<boolean>(
    initialState?.showToolbarDropZone ?? false,
  );
  const [newEntryModal, setNewEntryModal] = useState<MRT_NewEntryModalState>(
    initialState?.newEntryModal ?? { open: false },
  );
  const [showProgressBars, setShowProgressBars] = useState<boolean>(
    initialState?.showProgressBars ?? false,
  );
  // Saved filter presets — initialised from the dedicated option so the consumer
  // can hydrate them from the server response before rendering.
  const [savedFilters, setSavedFilters] = useState<MRT_SavedFilters>(
    definedTableOptions.initialSavedFilters ?? {},
  );

  definedTableOptions.state = {
    actionCell,
    columnFilterFns,
    columnOrder,
    columnSizingInfo,
    creatingRow,
    density,
    draggingColumn,
    draggingRow,
    editingCell,
    editingRow,
    filters,
    globalFilterFn,
    grouping,
    hoveredColumn,
    hoveredRow,
    isFullScreen,
    pagination,
    savedFilters,
    showAlertBanner,
    showColumnFilters,
    showGlobalFilter,
    showAdvancedFilters,
    showProgressBars,
    showToolbarDropZone,
    newEntryModal,
    ...definedTableOptions.state,
  };

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

  //don't recompute columnDefs while resizing column or dragging column/row
  const columnDefsRef = useRef<MRT_ColumnDef<TData>[]>([]);
  statefulTableOptions.columns =
    statefulTableOptions.state.columnSizingInfo.isResizingColumn ||
    statefulTableOptions.state.draggingColumn ||
    statefulTableOptions.state.draggingRow
      ? columnDefsRef.current
      : prepareColumns({
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
            ...statefulTableOptions.columns,
            ...([
              showRowSpacerColumn(statefulTableOptions) &&
                getMRT_RowSpacerColumnDef(statefulTableOptions),
            ].filter(Boolean) as MRT_ColumnDef<TData>[]),
          ],
          tableOptions: statefulTableOptions,
        });
  columnDefsRef.current = statefulTableOptions.columns;

  //if loading, generate blank rows to show skeleton loaders
  statefulTableOptions.data = useMemo(
    () =>
      (statefulTableOptions.state.isLoading ||
        statefulTableOptions.state.showSkeletons) &&
      !statefulTableOptions.data.length
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
        : statefulTableOptions.data,
    [
      statefulTableOptions.data,
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
    lastSelectedRowId,
    searchInputRef,
    tableContainerRef,
    tableFooterRef,
    tableHeadCellRefs,
    tableHeadRef,
    tablePaperRef,
    topToolbarRef,
  };

  table.setActionCell =
    statefulTableOptions.onActionCellChange ?? setActionCell;
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
  table.setDensity = statefulTableOptions.onDensityChange ?? setDensity;
  table.setDraggingColumn =
    statefulTableOptions.onDraggingColumnChange ?? setDraggingColumn;
  table.setDraggingRow =
    statefulTableOptions.onDraggingRowChange ?? setDraggingRow;
  table.setEditingCell =
    statefulTableOptions.onEditingCellChange ?? setEditingCell;
  table.setEditingRow =
    statefulTableOptions.onEditingRowChange ?? setEditingRow;
  table.setFilters = statefulTableOptions.onFiltersChange ?? setFilters;
  table.setGlobalFilterFn =
    statefulTableOptions.onGlobalFilterFnChange ?? setGlobalFilterFn;
  table.setHoveredColumn =
    statefulTableOptions.onHoveredColumnChange ?? setHoveredColumn;
  table.setHoveredRow =
    statefulTableOptions.onHoveredRowChange ?? setHoveredRow;
  table.setIsFullScreen =
    statefulTableOptions.onIsFullScreenChange ?? setIsFullScreen;
  table.setSavedFilters = setSavedFilters;
  table.setShowAlertBanner =
    statefulTableOptions.onShowAlertBannerChange ?? setShowAlertBanner;
  table.setShowAdvancedFilters =
    statefulTableOptions.onShowAdvancedFiltersChange ?? setShowAdvancedFilters;
  table.setShowColumnFilters =
    statefulTableOptions.onShowColumnFiltersChange ?? setShowColumnFilters;
  table.setShowGlobalFilter =
    statefulTableOptions.onShowGlobalFilterChange ?? setShowGlobalFilter;
  table.setShowProgressBars = setShowProgressBars;
  table.setShowToolbarDropZone =
    statefulTableOptions.onShowToolbarDropZoneChange ?? setShowToolbarDropZone;
  table.setNewEntryModal = setNewEntryModal;
  useMRT_Effects(table);

  return table;
};
