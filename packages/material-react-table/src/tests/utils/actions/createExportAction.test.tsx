import { type ReactNode } from 'react';
import { useMaterialReactTable } from '../../../hooks/useMaterialReactTable';
import { createExportAction } from '../../../utils/actions/createExportAction';
import { render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event/dist/cjs/index.js';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../../utils/exports/download-files', () => ({
  downloadExportFiles: vi.fn(),
}));

vi.mock('../../../utils/exports/print-pdf', () => ({
  printExportFiles: vi.fn(),
}));

const { mockEnqueueSnackbar, mockCloseSnackbar } = vi.hoisted(() => ({
  mockEnqueueSnackbar: vi.fn().mockReturnValue('snackbar-key'),
  mockCloseSnackbar: vi.fn(),
}));

vi.mock('notistack', () => ({
  enqueueSnackbar: mockEnqueueSnackbar,
  closeSnackbar: mockCloseSnackbar,
  useSnackbar: vi.fn().mockReturnValue({
    enqueueSnackbar: mockEnqueueSnackbar,
    closeSnackbar: mockCloseSnackbar,
  }),
  SnackbarProvider: ({ children }: { children: ReactNode }) => children,
}));

type TestRow = { id: string };

const user = userEvent.setup();

const PDF_AVAILABLE_EXPORTS = {
  report: { name: 'report', label: 'Report', formats: ['pdf'] as string[] },
};

const PDF_ACTIVE_EXPORTS = {
  selectedFormat: 'pdf',
  selectedExports: ['report'],
  grouped: false,
};

const XLSX_AVAILABLE_EXPORTS = {
  report: { name: 'report', label: 'Report', formats: ['xlsx'] as string[] },
};

const XLSX_ACTIVE_EXPORTS = {
  selectedFormat: 'xlsx',
  selectedExports: ['report'],
  grouped: false,
};

describe('createExportAction', () => {
  const { result: baseResult } = renderHook(() =>
    useMaterialReactTable<TestRow>({
      columns: [{ accessorKey: 'id', header: 'ID', type: 'string' }],
      data: [{ id: 'row-1' }],
    }),
  );
  const baseTable = baseResult.current;
  const baseRow = baseTable.getRowModel().rows[0];

  describe('action name', () => {
    it('should return action name equal to "export"', () => {
      const action = createExportAction<TestRow>();
      expect(action.name).toBe('export');
    });
  });

  describe('renderRow — default renderer', () => {
    it('should render a download button when no renderRow is provided', () => {
      const action = createExportAction<TestRow>();
      render(action.renderRow!({ table: baseTable, row: baseRow }));
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should NOT render a print button when no pdf format is available', () => {
      // Table with xlsx-only exports and no pdf — isPrintAvailable returns false
      const { result } = renderHook(() =>
        useMaterialReactTable<TestRow>({
          columns: [{ accessorKey: 'id', header: 'ID', type: 'string' }],
          data: [{ id: 'row-1' }],
          availableExports: XLSX_AVAILABLE_EXPORTS,
          state: { activeExports: XLSX_ACTIVE_EXPORTS },
          loadExport: vi.fn().mockResolvedValue([]),
        }),
      );
      const table = result.current;
      const row = table.getRowModel().rows[0];

      const action = createExportAction<TestRow>();
      render(action.renderRow!({ table, row }));

      // Only one button — download; no print button
      expect(screen.getAllByRole('button')).toHaveLength(1);
    });

    it('should render a print button alongside download when pdf is selected and conditions are met', () => {
      const { result } = renderHook(() =>
        useMaterialReactTable<TestRow>({
          columns: [{ accessorKey: 'id', header: 'ID', type: 'string' }],
          data: [{ id: 'row-1' }],
          availableExports: PDF_AVAILABLE_EXPORTS,
          state: { activeExports: PDF_ACTIVE_EXPORTS },
          loadExport: vi.fn().mockResolvedValue([]),
        }),
      );
      const table = result.current;
      const row = table.getRowModel().rows[0];

      const action = createExportAction<TestRow>();
      render(action.renderRow!({ table, row }));

      // Two buttons — download + print
      expect(screen.getAllByRole('button')).toHaveLength(2);
    });

    it('should NOT render a print button when multiple exports are selected without grouped', () => {
      // isPrintAvailable: grouped=false AND selectedExports.length > 1 → false
      const { result } = renderHook(() =>
        useMaterialReactTable<TestRow>({
          columns: [{ accessorKey: 'id', header: 'ID', type: 'string' }],
          data: [{ id: 'row-1' }],
          availableExports: PDF_AVAILABLE_EXPORTS,
          state: {
            activeExports: {
              selectedFormat: 'pdf',
              selectedExports: ['report', 'summary'],
              grouped: false,
            },
          },
          loadExport: vi.fn().mockResolvedValue([]),
        }),
      );
      const table = result.current;
      const row = table.getRowModel().rows[0];

      const action = createExportAction<TestRow>();
      render(action.renderRow!({ table, row }));

      expect(screen.getAllByRole('button')).toHaveLength(1);
    });
  });

  describe('renderRow — custom renderer', () => {
    it('should render custom renderRow when provided', () => {
      const action = createExportAction<TestRow>({
        renderRow: () => <button>Custom export row</button>,
      });
      render(action.renderRow!({ table: baseTable, row: baseRow }));
      expect(
        screen.getByRole('button', { name: 'Custom export row' }),
      ).toBeInTheDocument();
    });

    it('should call onExport when the custom renderRow button is clicked', async () => {
      const onExportMock = vi.fn();

      // Needs active exports so hasActiveExports passes and onExport is reached.
      const { result } = renderHook(() =>
        useMaterialReactTable<TestRow>({
          columns: [{ accessorKey: 'id', header: 'ID', type: 'string' }],
          data: [{ id: 'row-1' }],
          availableExports: XLSX_AVAILABLE_EXPORTS,
          state: { activeExports: XLSX_ACTIVE_EXPORTS },
          loadExport: vi.fn().mockResolvedValue([]),
        }),
      );
      const table = result.current;
      const row = table.getRowModel().rows[0];

      const action = createExportAction<TestRow>({
        onExport: onExportMock,
        renderRow: ({ onExport }) => (
          <button onClick={onExport}>Custom export row</button>
        ),
      });

      render(action.renderRow!({ table, row }));
      await user.click(
        screen.getByRole('button', { name: 'Custom export row' }),
      );

      expect(onExportMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('renderRow — warning when no exports selected', () => {
    it('should show warning snackbar when download clicked and no exports are configured', async () => {
      mockEnqueueSnackbar.mockClear();

      // Table with no activeExports state — hasActiveExports returns false
      const action = createExportAction<TestRow>();
      render(action.renderRow!({ table: baseTable, row: baseRow }));

      const [downloadButton] = screen.getAllByRole('button');
      await user.click(downloadButton);

      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ variant: 'warning' }),
      );
    });
  });

  describe('renderToolbar — default renderer', () => {
    it('should return null when availableExports is not configured', () => {
      const action = createExportAction<TestRow>();
      const result = action.renderToolbar!({ table: baseTable });
      expect(result).toBeNull();
    });

    it('should render MRT_ExportsToolbar when availableExports and loadExport are configured', () => {
      // onActiveExportsChange is required by renderToolbarAction — pass a mock.
      const { result } = renderHook(() =>
        useMaterialReactTable<TestRow>({
          columns: [{ accessorKey: 'id', header: 'ID', type: 'string' }],
          data: [{ id: 'row-1' }],
          availableExports: XLSX_AVAILABLE_EXPORTS,
          state: { activeExports: XLSX_ACTIVE_EXPORTS },
          loadExport: vi.fn().mockResolvedValue([]),
          onActiveExportsChange: vi.fn(),
        }),
      );
      const table = result.current;

      const action = createExportAction<TestRow>();
      render(action.renderToolbar!({ table }));

      // MRT_ExportsToolbar renders the Export button (HR locale via MaterialReactServerTable
      // default, but unit tests use EN locale since useMaterialReactTable defaults to EN).
      expect(
        screen.getByRole('button', { name: /export/i }),
      ).toBeInTheDocument();
    });
  });

  describe('renderToolbar — custom renderer', () => {
    it('should render custom renderToolbar when provided', () => {
      const action = createExportAction<TestRow>({
        renderToolbar: () => <button>Custom export toolbar</button>,
      });
      render(action.renderToolbar!({ table: baseTable }));
      expect(
        screen.getByRole('button', { name: 'Custom export toolbar' }),
      ).toBeInTheDocument();
    });

    it('should call onExport when the custom renderToolbar button is clicked', async () => {
      const onExportMock = vi.fn();

      const action = createExportAction<TestRow>({
        onExport: onExportMock,
        renderToolbar: ({ onExport }) => (
          <button onClick={onExport}>Custom export toolbar</button>
        ),
      });

      render(action.renderToolbar!({ table: baseTable }));
      await user.click(
        screen.getByRole('button', { name: 'Custom export toolbar' }),
      );

      expect(onExportMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('auto-injection via useMRT_TableOptions', () => {
    it('should auto-inject export action when availableExports is configured', () => {
      const { result } = renderHook(() =>
        useMaterialReactTable<TestRow>({
          columns: [{ accessorKey: 'id', header: 'ID', type: 'string' }],
          data: [{ id: 'row-1' }],
          availableExports: XLSX_AVAILABLE_EXPORTS,
          loadExport: vi.fn().mockResolvedValue([]),
        }),
      );
      const table = result.current;

      expect(table.options.actions?.some((a) => a.name === 'export')).toBe(
        true,
      );
    });

    it('should NOT auto-inject export action when availableExports is not set', () => {
      const { result } = renderHook(() =>
        useMaterialReactTable<TestRow>({
          columns: [{ accessorKey: 'id', header: 'ID', type: 'string' }],
          data: [{ id: 'row-1' }],
        }),
      );
      const table = result.current;

      expect(
        table.options.actions?.some((a) => a.name === 'export'),
      ).toBeFalsy();
    });

    it('should use the user-provided export action when name is "export"', () => {
      const customExportAction = createExportAction<TestRow>({
        renderRow: () => <button>My custom export</button>,
      });

      const { result } = renderHook(() =>
        useMaterialReactTable<TestRow>({
          columns: [{ accessorKey: 'id', header: 'ID', type: 'string' }],
          data: [{ id: 'row-1' }],
          availableExports: XLSX_AVAILABLE_EXPORTS,
          loadExport: vi.fn().mockResolvedValue([]),
          actions: [customExportAction],
        }),
      );
      const table = result.current;

      const exportActions = table.options.actions?.filter(
        (a) => a.name === 'export',
      );
      // Exactly one — user's, not the auto-injected one
      expect(exportActions).toHaveLength(1);
      expect(exportActions?.[0]).toBe(customExportAction);
    });
  });
});
