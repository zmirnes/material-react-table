import type { ReactElement } from 'react';
import MRT_DeleteRowButton from '../../../components/buttons/MRT_DeleteRowButton';
import DeleteRowAction from '../../../components/actions/DeleteRowAction';
import {
  buildMockRow,
  buildMockTable,
  type TestRowData,
} from '../../helpers/actionMockBuilders';
import type { DeleteActionConfig } from '../../../types/actions-types';
import { describe, expect, it, vi } from 'vitest';

// Helper: invokes DeleteRowAction as a plain function to obtain the returned React element
// without mounting the component into a DOM — consistent with the pattern used in createDeleteAction.test.tsx
const renderDeleteRowAction = (
  props: Parameters<typeof DeleteRowAction<TestRowData>>[0],
): ReactElement => DeleteRowAction(props) as ReactElement;

describe('DeleteRowAction', () => {
  describe('toolbar branch — no row provided', () => {
    it('calls config.renderToolbar and returns its result when row is absent and renderToolbar is defined', () => {
      const mockTable = buildMockTable();
      const mockOnDelete = vi.fn();
      // Sentinel element used to verify renderToolbar return value is passed through
      const sentinelElement = <span data-testid="toolbar-sentinel" />;
      const mockRenderToolbar = vi.fn().mockReturnValue(sentinelElement);
      const config: DeleteActionConfig<TestRowData> = {
        renderToolbar: mockRenderToolbar,
      };

      const result = renderDeleteRowAction({
        table: mockTable,
        delete: mockOnDelete,
        config,
      });

      // renderToolbar must be called with the correct context object
      expect(mockRenderToolbar).toHaveBeenCalledOnce();
      expect(mockRenderToolbar).toHaveBeenCalledWith({
        table: mockTable,
        onDelete: mockOnDelete,
      });
      // The component must return exactly what renderToolbar returned
      expect(result).toBe(sentinelElement);
    });

    it('does not invoke config.renderRow when row is absent, even if renderRow is defined', () => {
      const mockTable = buildMockTable();
      const mockOnDelete = vi.fn();
      const mockRenderRow = vi.fn();
      const mockRenderToolbar = vi.fn().mockReturnValue(null);
      const config: DeleteActionConfig<TestRowData> = {
        renderToolbar: mockRenderToolbar,
        renderRow: mockRenderRow,
      };

      renderDeleteRowAction({
        table: mockTable,
        delete: mockOnDelete,
        config,
      });

      // renderRow must never be called when row is not provided
      expect(mockRenderRow).not.toHaveBeenCalled();
    });
  });

  describe('row branch — specific row provided', () => {
    it('calls config.renderRow and returns its result when row is present and renderRow is defined', () => {
      const mockTable = buildMockTable();
      const mockRow = buildMockRow('row-42');
      const mockOnDelete = vi.fn();
      // Sentinel element used to verify renderRow return value is passed through
      const sentinelElement = <span data-testid="row-sentinel" />;
      const mockRenderRow = vi.fn().mockReturnValue(sentinelElement);
      const config: DeleteActionConfig<TestRowData> = {
        renderRow: mockRenderRow,
      };

      const result = renderDeleteRowAction({
        table: mockTable,
        row: mockRow,
        delete: mockOnDelete,
        config,
      });

      // renderRow must be called with the correct context object including the specific row
      expect(mockRenderRow).toHaveBeenCalledOnce();
      expect(mockRenderRow).toHaveBeenCalledWith({
        table: mockTable,
        row: mockRow,
        onDelete: mockOnDelete,
      });
      // The component must return exactly what renderRow returned
      expect(result).toBe(sentinelElement);
    });
  });

  describe('default fallback branch — no custom render functions provided', () => {
    it('renders MRT_DeleteRowButton when no config is provided', () => {
      const mockTable = buildMockTable();
      const mockOnDelete = vi.fn();

      const result = renderDeleteRowAction({
        table: mockTable,
        delete: mockOnDelete,
      });

      // The default element must be the MRT_DeleteRowButton component
      expect(result.type).toBe(MRT_DeleteRowButton);
    });

    it('renders MRT_DeleteRowButton when row is provided but renderRow is not defined in config', () => {
      const mockTable = buildMockTable();
      const mockRow = buildMockRow('row-5');
      const mockOnDelete = vi.fn();
      // Config exists but renderRow is intentionally absent
      const configWithoutRenderRow: DeleteActionConfig<TestRowData> = {};

      const result = renderDeleteRowAction({
        table: mockTable,
        row: mockRow,
        delete: mockOnDelete,
        config: configWithoutRenderRow,
      });

      // Must fall through to the default button when renderRow is not provided
      expect(result.type).toBe(MRT_DeleteRowButton);
    });
  });
});
