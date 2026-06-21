import { MRT_ExportsToolbar } from '../../components/toolbar/MRT_ExportsToolbar';
import ExportRowAction from '../../components/actions/ExportRowAction';
import { downloadExportFiles } from '../../utils/exports/download-files';
import { printExportFiles } from '../../utils/exports/print-pdf';
import type {
  MRT_ExportFileResponse,
  MRT_ExportParams,
  MRT_RowData,
  MRT_TableInstance,
} from '../../types';
import type {
  Action,
  ActionRowRenderContext,
  ActionToolbarRenderContext,
  CreateExportActionOptions,
  OnExportActionContext,
} from '../../types/actions/actions.types';
import { closeSnackbar, enqueueSnackbar } from 'notistack';

const hasActiveExports = <TData extends MRT_RowData>(
  table: MRT_TableInstance<TData>,
) => {
  const { activeExports } = table.getState();
  return !!(
    activeExports?.selectedFormat && activeExports.selectedExports.length > 0
  );
};

// Same conditions as MRT_ExportsToolbar: pdf format selected, at least one export type,
// and either grouped or exactly one export type selected.
const isPrintAvailable = <TData extends MRT_RowData>(
  table: MRT_TableInstance<TData>,
) => {
  const allFormats = Object.values(
    table.options.availableExports ?? {},
  ).flatMap((e) => e.formats);
  if (!allFormats.includes('pdf')) return false;

  const { activeExports } = table.getState();
  if (!activeExports) return false;

  const { selectedFormat, selectedExports, grouped } = activeExports;
  return (
    selectedFormat === 'pdf' &&
    selectedExports.length >= 1 &&
    (grouped || selectedExports.length === 1)
  );
};

export const createExportAction = <TData extends MRT_RowData>({
  onExport,
  renderRow: customRenderRow,
  renderToolbar: customRenderToolbar,
  ...rest
}: CreateExportActionOptions<TData> = {}): Action<TData> => {
  // Pure download logic — no notifications. Throws on failure so callers can handle it.
  const defaultOnExport = async ({
    rowsToExport,
    table,
  }: OnExportActionContext<TData>) => {
    if (!rowsToExport.length) return;

    const { loadExport } = table.options;
    const { activeExports } = table.getState();
    if (!loadExport || !activeExports) return;

    const response = await loadExport({
      format: activeExports.selectedFormat,
      exports: activeExports.selectedExports,
      separated_files: !activeExports.grouped,
      download: false,
      ids: JSON.stringify(rowsToExport.map((r) => r.id)),
      type: 'download',
    });

    downloadExportFiles(response);
  };

  // Pure print logic — no notifications. Throws on failure so callers can handle it.
  const defaultOnPrint = async ({
    rowsToExport,
    table,
  }: OnExportActionContext<TData>) => {
    if (!rowsToExport.length) return;

    const { loadExport } = table.options;
    const { activeExports } = table.getState();
    if (!loadExport || !activeExports) return;

    const response = await loadExport({
      format: activeExports.selectedFormat,
      exports: activeExports.selectedExports,
      separated_files: !activeExports.grouped,
      download: false,
      ids: JSON.stringify(rowsToExport.map((r) => r.id)),
      type: 'print',
    });

    printExportFiles(response);
  };

  // Single execution pipeline for every export flow (row or toolbar).
  // If a custom handler exists, it receives defaultOnExport and decides when to call it.
  const executeExport = (context: OnExportActionContext<TData>) => {
    const executeDefaultExport = () => defaultOnExport(context);
    if (onExport) {
      return onExport({ ...context, defaultOnExport: executeDefaultExport });
    }
    return executeDefaultExport();
  };

  // Row download: checks for active exports, then wraps with loading/success/error notifications.
  const handleSingleRowExport = async ({
    table,
    row,
  }: ActionRowRenderContext<TData>) => {
    const { localization } = table.options;

    if (!hasActiveExports(table)) {
      enqueueSnackbar(localization.exportNoExportsSelected, {
        variant: 'warning',
      });
      return;
    }

    const loadingKey = enqueueSnackbar(localization.exportInProgress, {
      variant: 'info',
      persist: true,
    });
    try {
      await executeExport({ table, rowsToExport: [row] });
      closeSnackbar(loadingKey);
      enqueueSnackbar(localization.exportSuccess, { variant: 'success' });
    } catch {
      closeSnackbar(loadingKey);
      enqueueSnackbar(localization.exportError, { variant: 'error' });
    }
  };

  // Row print: same guard + notification pattern as download, but calls defaultOnPrint.
  const handleSingleRowPrint = async ({
    table,
    row,
  }: ActionRowRenderContext<TData>) => {
    const { localization } = table.options;

    if (!hasActiveExports(table)) {
      enqueueSnackbar(localization.exportNoExportsSelected, {
        variant: 'warning',
      });
      return;
    }

    const loadingKey = enqueueSnackbar(localization.exportInProgress, {
      variant: 'info',
      persist: true,
    });
    try {
      await defaultOnPrint({ table, rowsToExport: [row] });
      closeSnackbar(loadingKey);
      enqueueSnackbar(localization.exportSuccess, { variant: 'success' });
    } catch {
      closeSnackbar(loadingKey);
      enqueueSnackbar(localization.exportError, { variant: 'error' });
    }
  };

  // Resolves selected rows from table state for toolbar-triggered export (custom renderToolbar only).
  const handleMultipleRowExport = ({
    table,
  }: ActionToolbarRenderContext<TData>) => {
    const rowsToExport = table.getSelectedRowModel().rows;
    return executeExport({ table, rowsToExport });
  };

  const createRowExportExecutor =
    (context: ActionRowRenderContext<TData>) => () => {
      void handleSingleRowExport(context);
    };

  const createRowPrintExecutor =
    (context: ActionRowRenderContext<TData>) => () => {
      void handleSingleRowPrint(context);
    };

  const createToolbarExportExecutor =
    (context: ActionToolbarRenderContext<TData>) => () => {
      void handleMultipleRowExport(context);
    };

  // Renders download + optional print button. Print is shown under the same conditions
  // as in MRT_ExportsToolbar: pdf format selected, active exports, grouped or single type.
  const renderRowAction = (context: ActionRowRenderContext<TData>) => {
    const onRowExport = createRowExportExecutor(context);
    const onRowPrint = isPrintAvailable(context.table)
      ? createRowPrintExecutor(context)
      : undefined;

    if (customRenderRow) {
      return customRenderRow({ ...context, onExport: onRowExport });
    }

    return <ExportRowAction onExport={onRowExport} onPrint={onRowPrint} />;
  };

  // Uses custom toolbar renderer when provided; otherwise renders MRT_ExportsToolbar.
  // loadExport is always wrapped with notifications so that loading/success/error are shown
  // regardless of whether a custom onExport handler was provided.
  // When onExport is provided, it intercepts the call and returns [] so MRT_ExportsToolbar
  // does not attempt a second download from an empty response.
  const renderToolbarAction = (context: ActionToolbarRenderContext<TData>) => {
    const { table } = context;
    const {
      availableExports,
      loadExport,
      onActiveExportsChange,
      localization,
    } = table.options;
    const { activeExports } = table.getState();

    if (customRenderToolbar) {
      return customRenderToolbar({
        ...context,
        onExport: createToolbarExportExecutor(context),
      });
    }

    if (
      !availableExports ||
      !loadExport ||
      !onActiveExportsChange ||
      !activeExports
    ) {
      return null;
    }

    const notifiedLoadExport = async (
      params: MRT_ExportParams,
    ): Promise<MRT_ExportFileResponse[]> => {
      const loadingKey = enqueueSnackbar(localization.exportInProgress, {
        variant: 'info',
        persist: true,
      });
      try {
        let response: MRT_ExportFileResponse[];
        if (onExport) {
          const rowsToExport = table.getSelectedRowModel().rows;
          await executeExport({ table, rowsToExport });
          response = [];
        } else {
          response = await loadExport(params);
        }
        closeSnackbar(loadingKey);
        enqueueSnackbar(localization.exportSuccess, { variant: 'success' });
        return response;
      } catch {
        closeSnackbar(loadingKey);
        enqueueSnackbar(localization.exportError, { variant: 'error' });
        return [];
      }
    };

    return (
      <MRT_ExportsToolbar
        table={table}
        availableExports={availableExports}
        exportState={activeExports}
        onExportStateChange={onActiveExportsChange}
        loadExport={notifiedLoadExport}
      />
    );
  };

  return {
    name: 'export',
    renderRow: renderRowAction,
    renderToolbar: renderToolbarAction,
    ...rest,
  };
};
