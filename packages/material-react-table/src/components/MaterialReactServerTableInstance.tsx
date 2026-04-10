import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMaterialReactTable } from '../hooks/useMaterialReactTable';
import { useServerTableState } from '../hooks/useServerTableState';
import { MRT_Localization_HR } from '../locales/hr';
import {
  MRT_RowData,
  MRT_TableConfig,
  MRT_TableData,
  MRT_TableInstance,
  MRT_TableState,
} from '../types';
import { createColumnDefs } from '../utils/columns/createColumnDef';
import { MaterialReactTable } from './MaterialReactTable';

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
};

export const MaterialReactServerTableInstance = <
  TData extends MRT_RowData & { id: string },
>({
  config,
  loadData,
  saveState,
  getAllSelectableRowIds,
  getTotalRows,
}: MaterialReactServerTableInstanceProps<TData>) => {
  const [data, setData] = useState<TData[]>([]);
  const [pageCount, setPageCount] = useState<number | undefined>(undefined);
  const [rowCount, setRowCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const { tableState, handlers, fetchTrigger } = useServerTableState<TData>({
    initialState: config.initialState,
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

  const table = useMaterialReactTable<TData>({
    columns,
    data,
    localization: MRT_Localization_HR,
    rowCount,
    pageCount,
    manualPagination: true,
    manualSorting: true,
    manualGrouping: true,
    getRowId: (originalRow) => originalRow.id,
    state: {
      showSkeletons: isLoading,
      ...tableState,
    },
    getAllSelectableRowIds,
    getTotalRows: wrappedGetTotalRows,
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
  }, [fetchTrigger.pagination, fetchTrigger.sorting, fetchTrigger.grouping]);

  return <MaterialReactTable table={table} />;
};
