import { useId, useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
import { MRT_AggregationFns } from '../fns/aggregationFns';
import { MRT_FilterFns } from '../fns/filterFns';
import { MRT_SortingFns } from '../fns/sortingFns';
import { MRT_Default_Icons } from '../icons';
import { MRT_Localization_EN } from '../locales/en';
import {
  type MRT_DefinedTableOptions,
  type MRT_RowData,
  type MRT_TableOptions,
} from '../types';
import { createExportAction } from '../utils/actions/createExportAction';
import { getMRTTheme } from '../utils/style.utils';

export const MRT_DefaultColumn = {
  filterVariant: 'text',
  maxSize: 1000,
  minSize: 40,
  size: 180,
} as const;

export const MRT_DefaultDisplayColumn = {
  columnDefType: 'display',
  enableClickToCopy: false,
  enableColumnActions: false,
  enableColumnDragging: false,
  enableColumnFilter: false,
  enableColumnOrdering: false,
  enableEditing: false,
  enableGlobalFilter: false,
  enableGrouping: false,
  enableHiding: false,
  enableResizing: false,
  enableSorting: false,
} as const;

export const useMRT_TableOptions: <TData extends MRT_RowData>(
  tableOptions: MRT_TableOptions<TData>,
) => MRT_DefinedTableOptions<TData> = <TData extends MRT_RowData>({
  aggregationFns,
  autoResetExpanded = false,
  columnFilterDisplayMode = 'subheader',
  columnResizeDirection,
  columnResizeMode = 'onChange',
  createDisplayMode = 'modal',
  defaultColumn,
  defaultDisplayColumn,
  editDisplayMode = 'modal',
  enableBatchRowSelection = true,
  enableBottomToolbar = true,
  enableColumnActions = true,
  enableColumnFilters = true,
  enableColumnOrdering = true,
  enableColumnPinning = true,
  enableColumnResizing = true,
  enableColumnVirtualization,
  enableDensityToggle = true,
  enableExpandAll = true,
  maxDepth,
  enableExpanding,
  enableRowReordering,
  enableFacetedValues = false,
  enableFilterMatchHighlighting = true,
  enableFilters = false,
  enableAdvancedFilters = true,
  enableGlobalFilter = false,
  enableGlobalFilterRankedResults = true,
  enableGrouping = true,
  enableHiding = true,
  enableKeyboardShortcuts = true,
  enableMultiRowSelection = true,
  enableMultiSort = true,
  enablePagination = true,
  enableRowPinning = true,
  enableRowSelection = true,
  enableRowVirtualization = false,
  enableSelectAll = true,
  enableSorting = true,
  enableStickyHeader = true,
  enableTableFooter = true,
  enableTableHead = true,
  enableToolbarInternalActions = true,
  enableTopToolbar = true,
  filterFns,
  icons,
  id = useId(),
  layoutMode,
  localization,
  manualFiltering,
  manualGrouping,
  manualPagination,
  manualSorting,
  mrtTheme,
  paginationDisplayMode = 'default',
  positionActionsColumn = 'first',
  positionCreatingRow = 'top',
  positionExpandColumn = 'first',
  positionGlobalFilter = 'right',
  positionPagination = 'bottom',
  positionToolbarAlertBanner = 'top',
  positionToolbarDropZone = 'top',
  rowNumberDisplayMode = 'static',
  rowPinningDisplayMode = 'sticky',
  selectAllMode = 'page',
  sortingFns,
  actions,
  availableExports,
  ...rest
}: MRT_TableOptions<TData>) => {
  const theme = useTheme();

  // When availableExports is configured and the user has not supplied their own
  // 'export' action, inject the default export action automatically.
  const effectiveActions = useMemo(() => {
    if (!availableExports) return actions;
    const hasUserExportAction = actions?.some((a) => a.name === 'export');
    if (hasUserExportAction) return actions;
    return [createExportAction<TData>(), ...(actions ?? [])];
  }, [actions, availableExports]);

  icons = useMemo(() => ({ ...MRT_Default_Icons, ...icons }), [icons]);
  localization = useMemo(
    () => ({
      ...MRT_Localization_EN,
      ...localization,
    }),
    [localization],
  );
  mrtTheme = useMemo(() => getMRTTheme(mrtTheme, theme), [mrtTheme, theme]);
  aggregationFns = useMemo(
    () => ({ ...MRT_AggregationFns, ...aggregationFns }),
    [],
  );
  filterFns = useMemo(() => ({ ...MRT_FilterFns, ...filterFns }), []);
  sortingFns = useMemo(() => ({ ...MRT_SortingFns, ...sortingFns }), []);
  defaultColumn = useMemo(
    () => ({ ...MRT_DefaultColumn, ...defaultColumn }),
    [defaultColumn],
  );
  defaultDisplayColumn = useMemo(
    () => ({
      ...MRT_DefaultDisplayColumn,
      ...defaultDisplayColumn,
    }),
    [defaultDisplayColumn],
  );
  //cannot be changed after initialization
  [enableColumnVirtualization, enableRowVirtualization] = useMemo(
    () => [enableColumnVirtualization, enableRowVirtualization],
    [],
  );

  if (!columnResizeDirection) {
    columnResizeDirection = theme.direction || 'ltr';
  }

  layoutMode =
    layoutMode || (enableColumnResizing ? 'grid-no-grow' : 'semantic');
  if (
    layoutMode === 'semantic' &&
    (enableRowVirtualization || enableColumnVirtualization)
  ) {
    layoutMode = 'grid';
  }

  if (enableRowVirtualization) {
    enableStickyHeader = true;
  }

  if (enablePagination === false && manualPagination === undefined) {
    manualPagination = true;
  }

  if (!rest.data?.length) {
    manualFiltering = true;
    manualPagination = true;
    manualSorting = true;
  }

  return {
    aggregationFns,
    autoResetExpanded,
    columnFilterDisplayMode,
    columnResizeDirection,
    columnResizeMode,
    createDisplayMode,
    defaultColumn,
    defaultDisplayColumn,
    editDisplayMode,
    enableBatchRowSelection,
    enableBottomToolbar,
    enableColumnActions,
    enableColumnFilters,
    enableColumnOrdering,
    enableColumnPinning,
    enableColumnResizing,
    enableColumnVirtualization,
    enableDensityToggle,
    enableExpandAll,
    maxDepth,
    enableExpanding,
    enableRowReordering,
    enableFacetedValues,
    enableFilterMatchHighlighting,
    enableFilters,
    enableGlobalFilter,
    enableGlobalFilterRankedResults,
    enableGrouping,
    enableHiding,
    enableKeyboardShortcuts,
    enableMultiRowSelection,
    enableMultiSort,
    enablePagination,
    enableRowPinning,
    enableRowSelection,
    enableRowVirtualization,
    enableSelectAll,
    enableSorting,
    enableStickyHeader,
    enableTableFooter,
    enableTableHead,
    enableToolbarInternalActions,
    enableTopToolbar,
    filterFns,
    getSubRows: (row) => row?.subRows,
    icons,
    id,
    layoutMode,
    localization,
    manualFiltering,
    manualGrouping,
    manualPagination,
    manualSorting,
    mrtTheme,
    paginationDisplayMode,
    positionActionsColumn,
    positionCreatingRow,
    positionExpandColumn,
    positionGlobalFilter,
    positionPagination,
    positionToolbarAlertBanner,
    positionToolbarDropZone,
    rowNumberDisplayMode,
    rowPinningDisplayMode,
    selectAllMode,
    sortingFns,
    enableAdvancedFilters,
    actions: effectiveActions,
    availableExports,
    ...rest,
  } as MRT_DefinedTableOptions<TData>;
};
