import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMaterialReactTable } from '../hooks/useMaterialReactTable';
import { useServerTableState } from '../hooks/useServerTableState';
import {
  MRT_RowData,
  MRT_TableConfig,
  MRT_TableData,
  MRT_TableInstance,
  MRT_TableState,
} from '../types';
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
};

export const MaterialReactServerTableInstance = <
  TData extends MRT_RowData & { id: string },
>({
  config,
  loadData,
  saveState,
  getAllSelectableRowIds,
}: MaterialReactServerTableInstanceProps<TData>) => {
  const [data, setData] = useState<TData[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const { tableState, handlers, fetchTrigger } = useServerTableState<TData>({
    initialState: config.initialState,
    saveState,
  });

  const columns = useMemo(() => config.columns, [config.columns]);

  const table = useMaterialReactTable<TData>({
    columns,
    data,
    rowCount,
    manualPagination: true,
    manualSorting: true,
    manualGrouping: true,
    getRowId: (originalRow) => originalRow.id,
    state: {
      showSkeletons: isLoading,
      ...tableState,
    },
    getAllSelectableRowIds,
    ...handlers,
  });

  const fetchData = useCallback(
    async (state: MRT_TableState<TData>) => {
      setIsLoading(true);
      try {
        const { data: newData, rowCount: newRowCount } = await loadData(state);
        setData(newData);
        setRowCount(newRowCount);
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
