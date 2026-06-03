import { useEffect, useState } from 'react';
import {
  MaterialReactServerTableInstance,
  type MaterialReactServerTableInstanceProps,
} from './MaterialReactServerTableInstance';
import {
  type MRT_RowData,
  type MRT_TableConfig,
  type MRT_TableState,
} from '../types';

// Extends all Instance props — adds async loadConfig (replaces sync config)
// and overrides saveState to be async (Instance uses sync internally).
// All other props (formConfig, actions, loadExport, etc.) are inherited automatically.
export type MaterialReactServerTableProps<TData extends MRT_RowData> = Omit<
  MaterialReactServerTableInstanceProps<TData>,
  'config' | 'saveState'
> & {
  loadConfig: () => Promise<MRT_TableConfig<TData>>;
  saveState: (state: MRT_TableState<TData>) => Promise<void>;
};

export const MaterialReactServerTable = <
  TData extends MRT_RowData & { id: string },
>({
  loadConfig,
  saveState,
  ...instanceProps
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
      saveState={saveState}
      {...instanceProps}
    />
  );
};
