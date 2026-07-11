import {
  forwardRef,
  useEffect,
  useState,
  type ForwardedRef,
  type ReactElement,
  type Ref,
} from 'react';
import { MaterialReactServerTableError } from './MaterialReactServerTableError';
import {
  MaterialReactServerTableInstance,
  type MaterialReactServerTableHandle,
  type MaterialReactServerTableInstanceProps,
} from './MaterialReactServerTableInstance';
import { MaterialReactServerTableSkeleton } from './MaterialReactServerTableSkeleton';
import { MRT_Localization_HR } from '../locales/hr';
import { type MRT_RowData, type MRT_TableConfig } from '../types';

// Extends all Instance props — adds async loadConfig (replaces sync config)
// and overrides saveState to be async (Instance uses sync internally).
// All other props (formConfig, actions, loadExport, etc.) are inherited automatically.
export type MaterialReactServerTableProps<TData extends MRT_RowData> = Omit<
  MaterialReactServerTableInstanceProps<TData>,
  'config'
> & {
  loadConfig: () => Promise<MRT_TableConfig<TData>>;
};

const MaterialReactServerTableComponent = <
  TData extends MRT_RowData & { id: string },
>(
  {
    loadConfig,
    saveState,
    localization,
    ...instanceProps
  }: MaterialReactServerTableProps<TData>,
  ref: ForwardedRef<MaterialReactServerTableHandle<TData>>,
) => {
  const mergedLocalization = { ...MRT_Localization_HR, ...localization };
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
    return <MaterialReactServerTableSkeleton />;
  }

  if (!config) {
    return (
      <MaterialReactServerTableError
        description={mergedLocalization.serverTableErrorMessage}
      />
    );
  }

  return (
    <MaterialReactServerTableInstance<TData>
      ref={ref}
      config={config}
      saveState={saveState}
      {...instanceProps}
    />
  );
};

export const MaterialReactServerTable = forwardRef(
  MaterialReactServerTableComponent,
) as <TData extends MRT_RowData & { id: string }>(
  props: MaterialReactServerTableProps<TData> & {
    ref?: Ref<MaterialReactServerTableHandle<TData>>;
  },
) => ReactElement;
