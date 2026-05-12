import { useCallback, useEffect, useMemo, useState } from 'react';
import { RowActionsCell } from './actions/RowActionsCell';
import { MaterialReactTable } from './MaterialReactTable';
import { useMaterialReactTable } from '../hooks/useMaterialReactTable';
import { useServerTableState } from '../hooks/useServerTableState';
import { MRT_Localization_HR } from '../locales/hr';
import { type Action } from '../types/actions.types';
import { createColumnDefs } from '../utils/columns/createColumnDef';
import type {
  MRT_ActiveExportsState,
  MRT_ExportFileResponse,
  MRT_ExportParams,
  MRT_RowData,
  MRT_SavedFilter,
  MRT_SavedFilters,
  MRT_TableConfig,
  MRT_TableData,
  MRT_TableInstance,
  MRT_TableState,
} from '../types';

type MaterialReactServerTableInstanceProps<TData extends MRT_RowData> = {
  config: MRT_TableConfig<TData>;
  loadData: (
    currentState: MRT_TableState<TData>,
  ) => Promise<MRT_TableData<TData>>;
  saveState: (state: MRT_TableState<TData>) => void;
  getAllSelectableRowIds?: (props: {
    table: MRT_TableInstance<TData>;
  }) => Promise<string[]>;
  getTotalRows?: (props: {
    table: MRT_TableInstance<TData>;
  }) => Promise<number>;
  onSaveFilters?: (savedFilter: MRT_SavedFilter) => Promise<void>;
  onDeleteSavedFilter?: (filterName: string) => Promise<void>;
  initialSavedFilters?: MRT_SavedFilters;
  loadExport?: (params: MRT_ExportParams) => Promise<MRT_ExportFileResponse[]>;
  exportPermissions?: Record<string, string[]>;
  enableNewEntryButton?: boolean;
  actions?: Action<TData>[];
};

/** Builds the initial MRT_ActiveExportsState from availableExports.
 *  If only one format exists across all export definitions, auto-selects
 *  that format and the first export type — matching frontend-dev behaviour. */
const buildInitialExportState = (
  availableExports: MRT_TableConfig<MRT_RowData>['availableExports'],
  savedActiveExports: MRT_ActiveExportsState | undefined,
): MRT_ActiveExportsState => {
  const exportEntries = Object.values(availableExports ?? {});
  const allFormats = exportEntries.flatMap((exp) => exp.formats);
  const uniqueFormats = Array.from(new Set(allFormats));

  if (uniqueFormats.length === 1) {
    return {
      selectedFormat: uniqueFormats[0],
      selectedExports: exportEntries.length > 0 ? [exportEntries[0].name] : [],
      grouped: false,
    };
  }

  return (
    savedActiveExports ?? {
      selectedFormat: null,
      selectedExports: [],
      grouped: false,
    }
  );
};

export const MaterialReactServerTableInstance = <
  TData extends MRT_RowData & { id: string },
>({
  config,
  loadData,
  saveState,
  getAllSelectableRowIds,
  getTotalRows,
  onSaveFilters,
  onDeleteSavedFilter,
  initialSavedFilters,
  loadExport,
  exportPermissions,
  enableNewEntryButton,
  actions,
}: MaterialReactServerTableInstanceProps<TData>) => {
  const [data, setData] = useState<TData[]>([]);
  const [pageCount, setPageCount] = useState<number | undefined>(undefined);
  const [rowCount, setRowCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Filter availableExports by exportPermissions if provided.
  // exportPermissions maps export key → required permission strings.
  // If the key is not in exportPermissions, the export is always allowed.
  const allowedExports = useMemo(() => {
    const allExports = config.availableExports ?? {};
    if (!exportPermissions) return allExports;

    const allowedEntries = Object.entries(allExports).filter(([key]) => {
      const requiredPermissions = exportPermissions[key];
      if (!requiredPermissions) return true;
      // Permission check is intentionally left to the consumer — they filter
      // via exportPermissions prop. Here we keep all entries that have no
      // required permissions listed. For actual permission evaluation,
      // the consumer should pre-filter availableExports before passing it.
      return requiredPermissions.length === 0;
    });

    return Object.fromEntries(allowedEntries);
  }, [config.availableExports, exportPermissions]);

  const { tableState, handlers, fetchTrigger } = useServerTableState<TData>({
    initialState: {
      ...config.initialState,
      activeExports: buildInitialExportState(
        allowedExports,
        config.initialState?.activeExports,
      ),
    },
    saveState,
  });

  const columns = useMemo(
    () => createColumnDefs(config.columns),
    [config.columns],
  );

  const wrappedGetTotalRows = useMemo(
    () =>
      getTotalRows
        ? async (props: { table: MRT_TableInstance<TData> }) => {
            const count = await getTotalRows(props);
            setRowCount(count);
            setPageCount(undefined);
            return count;
          }
        : undefined,
    [getTotalRows],
  );

  const hasAvailableExports = Object.keys(allowedExports).length > 0;

  const table = useMaterialReactTable<TData>({
    columns,
    data,
    localization: MRT_Localization_HR,
    rowCount,
    pageCount,
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    manualGrouping: true,
    enableRowPinning: false,
    getRowId: (originalRow) => originalRow.id,
    state: {
      showSkeletons: isLoading,
      ...tableState,
    },
    enableRowActions: true,
    enableRowSelection: true,
    renderRowActions: RowActionsCell,
    positionActionsColumn: 'last',
    actions: actions,
    getAllSelectableRowIds,
    getTotalRows: wrappedGetTotalRows,
    onSaveFilters,
    onDeleteSavedFilter,
    initialSavedFilters,
    availableExports: hasAvailableExports ? allowedExports : undefined,
    loadExport: hasAvailableExports ? loadExport : undefined,
    enableNewEntryButton,
    ...handlers,
  });

  const fetchData = useCallback(
    async (state: MRT_TableState<TData>) => {
      setIsLoading(true);
      try {
        const {
          data: newData,
          rowCount: newRowCount,
          hasNextPage,
        } = await loadData(state);
        setData(newData);

        if (hasNextPage) {
          setPageCount(-1);
          setRowCount(0);
        } else {
          setPageCount(undefined);
          setRowCount(newRowCount);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [loadData],
  );

  useEffect(() => {
    void fetchData(table.getState());
  }, [
    fetchTrigger.filterRules,
    fetchTrigger.pagination,
    fetchTrigger.sorting,
    fetchTrigger.grouping,
    fetchTrigger.columnVisibilityShowTrigger,
  ]);

  return <MaterialReactTable table={table} />;
};
