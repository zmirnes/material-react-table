import { useEffect, useState } from 'react';
import { MaterialReactServerTableInstance } from './MaterialReactServerTableInstance';
import {
  type MRT_ExportFileResponse,
  type MRT_ExportParams,
  type MRT_SavedFilter,
  type MRT_SavedFilters,
  type MRT_TableInstance,
  type MRT_RowData,
  type MRT_TableConfig,
  type MRT_TableData,
  type MRT_TableState,
} from '../types';

export interface MaterialReactServerTableProps<TData extends MRT_RowData> {
  loadConfig: () => Promise<MRT_TableConfig<TData>>;
  loadData: (
    currentState: MRT_TableState<TData>,
  ) => Promise<MRT_TableData<TData>>;
  saveState: (state: MRT_TableState<TData>) => Promise<void>;
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
  // When true, renders a built-in "Add" button in the top toolbar that opens the new entry modal.
  enableNewEntryButton?: boolean;
}

export const MaterialReactServerTable = <
  TData extends MRT_RowData & { id: string },
>({
  loadConfig,
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
}: MaterialReactServerTableProps<TData>) => {
  const [configLoading, setConfigLoading] = useState(true);
  const [config, setConfig] = useState<MRT_TableConfig<TData> | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadTableConfig = async () => {
      try {
        const loadedConfig = await loadConfig();
        if (!isMounted) return;
        setConfig(loadedConfig);
      } catch {
        if (!isMounted) return;
        setConfig(null);
      } finally {
        if (isMounted) {
          setConfigLoading(false);
        }
      }
    };

    void loadTableConfig();

    return () => {
      isMounted = false;
    };
  }, [loadConfig]);

  if (configLoading) {
    return <div>Loading...</div>;
  }

  if (!config) {
    return <div>Error loading table configuration.</div>;
  }

  return (
    <MaterialReactServerTableInstance<TData>
      config={config}
      loadData={loadData}
      saveState={saveState}
      getAllSelectableRowIds={getAllSelectableRowIds}
      getTotalRows={getTotalRows}
      onSaveFilters={onSaveFilters}
      onDeleteSavedFilter={onDeleteSavedFilter}
      initialSavedFilters={initialSavedFilters}
      loadExport={loadExport}
      exportPermissions={exportPermissions}
      enableNewEntryButton={enableNewEntryButton}
    />
  );
};
