import { MaterialReactServerTable } from '../../../../components/MaterialReactServerTable';
import { MRT_Localization_HR } from '../../../../locales/hr';
import {
  type MRT_ExportDefinition,
  type MRT_ExportParams,
} from '../../../../types';
import {
  DEFAULT_TEST_COLUMNS,
  DEFAULT_TEST_DATA,
  type MockRowData,
} from '../../../data/mock-data';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

// Prevent jsdom crash — URL.createObjectURL and anchor.click are not available in jsdom
vi.mock('../../../../utils/exports/download-files', () => ({
  downloadExportFiles: vi.fn(),
}));

// HR localization keys used in assertions — avoids magic strings
const { exportButton, exportDownload } = MRT_Localization_HR;

// 'Bob' is unique in DEFAULT_TEST_DATA — used as a load-complete signal
const LOAD_TIMEOUT_MS = 5_000;
const waitForTableToLoad = () =>
  screen.findByText('Bob', {}, { timeout: LOAD_TIMEOUT_MS });

// Two export types sharing a single format — buildInitialExportState auto-selects
// 'xlsx' as the format and 'fullReport' as the first export type.
// This means no manual selector interaction is needed in tests.
const AVAILABLE_EXPORTS: Record<string, MRT_ExportDefinition> = {
  fullReport: {
    name: 'fullReport',
    label: 'Puni izvještaj',
    formats: ['xlsx'],
  },
  summary: { name: 'summary', label: 'Sažetak', formats: ['xlsx'] },
};

// Pre-select two rows via initialState so the export button is enabled from the start.
// The export button is disabled when no rows are selected (isNoRowsSelected === true).
const PRE_SELECTED_ROW_SELECTION: Record<string, true> = {
  '1': true,
  '2': true,
};

// Expected selected row IDs in the same order as Object.keys(rowSelection).filter(Boolean)
const PRE_SELECTED_ROW_IDS = ['1', '2'];

const renderExportTable = (
  loadExport: (params: MRT_ExportParams) => Promise<[]>,
) => {
  const user = userEvent.setup();

  render(
    <MaterialReactServerTable<MockRowData>
      loadConfig={async () => ({
        columns: DEFAULT_TEST_COLUMNS,
        availableExports: AVAILABLE_EXPORTS,
        initialState: {
          rowSelection: PRE_SELECTED_ROW_SELECTION,
        },
      })}
      loadData={async () => ({
        data: DEFAULT_TEST_DATA,
        rowCount: DEFAULT_TEST_DATA.length,
      })}
      saveState={async () => {}}
      loadExport={loadExport}
    />,
  );

  return { user };
};

describe('MRT_ExportsToolbarFlow — integration', () => {
  describe('export button visibility', () => {
    it('should render the export button when availableExports and loadExport are configured', async () => {
      const loadExport = vi.fn().mockResolvedValue([]);
      renderExportTable(loadExport);

      await waitForTableToLoad();

      expect(
        screen.getByRole('button', { name: exportButton }),
      ).toBeInTheDocument();
    });

    it('should NOT render the export button when loadExport is not provided', async () => {
      render(
        <MaterialReactServerTable<MockRowData>
          loadConfig={async () => ({
            columns: DEFAULT_TEST_COLUMNS,
            availableExports: AVAILABLE_EXPORTS,
          })}
          loadData={async () => ({
            data: DEFAULT_TEST_DATA,
            rowCount: DEFAULT_TEST_DATA.length,
          })}
          saveState={async () => {}}
        />,
      );

      await waitForTableToLoad();

      // No loadExport prop → toolbar condition fails → button not rendered
      expect(
        screen.queryByRole('button', { name: exportButton }),
      ).not.toBeInTheDocument();
    });
  });

  describe('export button disabled state', () => {
    it('should not show the export button when no rows are selected', async () => {
      const loadExport = vi.fn().mockResolvedValue([]);

      render(
        <MaterialReactServerTable<MockRowData>
          loadConfig={async () => ({
            columns: DEFAULT_TEST_COLUMNS,
            availableExports: AVAILABLE_EXPORTS,
            // No initialState.rowSelection → no rows pre-selected
          })}
          loadData={async () => ({
            data: DEFAULT_TEST_DATA,
            rowCount: DEFAULT_TEST_DATA.length,
          })}
          saveState={async () => {}}
          loadExport={loadExport}
        />,
      );

      await waitForTableToLoad();

      // Export action is rendered inside the selection overlay (ToolbarActions),
      // which is hidden via display:none when no rows are selected.
      // The button is therefore not accessible in the DOM.
      expect(
        screen.queryByRole('button', { name: exportButton }),
      ).not.toBeInTheDocument();
    });

    it('should enable the export button when rows are pre-selected via initialState', async () => {
      const loadExport = vi.fn().mockResolvedValue([]);
      renderExportTable(loadExport);

      await waitForTableToLoad();

      expect(screen.getByRole('button', { name: exportButton })).toBeEnabled();
    });
  });

  describe('loadExport call params', () => {
    it('should call loadExport with correct params when download is triggered', async () => {
      const loadExport = vi.fn().mockResolvedValue([]);
      const { user } = renderExportTable(loadExport);

      await waitForTableToLoad();

      // Click export button — menu opens
      await user.click(screen.getByRole('button', { name: exportButton }));

      // Format ('xlsx') and export type ('fullReport') are auto-selected by
      // buildInitialExportState because there is only one unique format.
      // The download button is therefore immediately enabled.
      await user.click(screen.getByRole('button', { name: exportDownload }));

      const expectedParams: MRT_ExportParams = {
        format: 'xlsx',
        exports: ['fullReport'],
        // separated_files = !grouped = !false = true
        separated_files: true,
        download: false,
        // ids is JSON.stringify of selected row ID keys
        ids: JSON.stringify(PRE_SELECTED_ROW_IDS),
        type: 'download',
      };

      expect(loadExport).toHaveBeenCalledTimes(1);
      expect(loadExport).toHaveBeenCalledWith(expectedParams);
    });
  });
});
