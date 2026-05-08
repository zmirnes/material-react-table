import { RowActionsCell } from '../../../components/actions/RowActionsCell';
import {
  buildMockRow,
  buildMockTableWithActions,
  type TestRowData,
} from '../../helpers/actionMockBuilders';
import type { Action } from '../../../types/actions-types';
import { describe, expect, it, vi } from 'vitest';

// Invokes RowActionsCell as a plain function to get the React element without mounting into a DOM
const renderRowActionsCell = (
  props: Parameters<typeof RowActionsCell<TestRowData>>[0],
) => RowActionsCell(props);

describe('RowActionsCell', () => {
  describe('when no actions are configured', () => {
    it('does not throw when table.options.actions is undefined', () => {
      const mockTable = buildMockTableWithActions(undefined);
      const mockRow = buildMockRow('row-1');

      // Optional chaining on actions?.map must handle undefined gracefully
      expect(() =>
        renderRowActionsCell({ row: mockRow, table: mockTable }),
      ).not.toThrow();
    });

    it('does not throw when table.options.actions is an empty array', () => {
      const mockTable = buildMockTableWithActions([]);
      const mockRow = buildMockRow('row-1');

      expect(() =>
        renderRowActionsCell({ row: mockRow, table: mockTable }),
      ).not.toThrow();
    });
  });

  describe('when actions are configured', () => {
    it('calls renderRow with the correct row and table context for a single action', () => {
      const mockRow = buildMockRow('row-10');
      const mockRenderRow = vi.fn().mockReturnValue(null);
      const singleAction: Action<TestRowData> = {
        name: 'delete',
        renderRow: mockRenderRow,
      };
      const mockTable = buildMockTableWithActions([singleAction]);

      renderRowActionsCell({ row: mockRow, table: mockTable });

      // renderRow must receive exactly the row and table passed into the cell
      expect(mockRenderRow).toHaveBeenCalledOnce();
      expect(mockRenderRow).toHaveBeenCalledWith({
        row: mockRow,
        table: mockTable,
      });
    });

    it('calls renderRow for every action when multiple actions are provided', () => {
      const mockRow = buildMockRow('row-20');
      const mockRenderRowDelete = vi.fn().mockReturnValue(null);
      const mockRenderRowEdit = vi.fn().mockReturnValue(null);
      const twoActions: Action<TestRowData>[] = [
        { name: 'delete', renderRow: mockRenderRowDelete },
        { name: 'edit', renderRow: mockRenderRowEdit },
      ];
      const mockTable = buildMockTableWithActions(twoActions);

      renderRowActionsCell({ row: mockRow, table: mockTable });

      // Each action's renderRow must be invoked exactly once
      expect(mockRenderRowDelete).toHaveBeenCalledOnce();
      expect(mockRenderRowEdit).toHaveBeenCalledOnce();
    });

    it('does not throw when an action does not define renderRow', () => {
      const mockRow = buildMockRow('row-30');
      // Action without renderRow — optional chaining in the component must handle this
      const actionWithoutRenderRow: Action<TestRowData> = { name: 'view' };
      const mockTable = buildMockTableWithActions([actionWithoutRenderRow]);

      expect(() =>
        renderRowActionsCell({ row: mockRow, table: mockTable }),
      ).not.toThrow();
    });
  });
});
