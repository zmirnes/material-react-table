import type { MRT_Row, MRT_TableInstance } from '../../types';
import type { Action } from '../../types/actions.types';

// Minimal row shape shared across all action-related tests
export type TestRowData = { id: string; name: string };

// Builds a partial MRT_Row mock that contains only the fields action utilities read
export const buildMockRow = (id: string): MRT_Row<TestRowData> =>
  ({ original: { id, name: 'Test User' } }) as MRT_Row<TestRowData>;

/**
 * Builds a partial MRT_TableInstance mock that exposes getSelectedRowModel.
 * Pass selectedIds to simulate a table with pre-selected rows.
 * Defaults to an empty selection when no argument is provided.
 */
export const buildMockTable = (
  selectedIds: string[] = [],
): MRT_TableInstance<TestRowData> =>
  ({
    getSelectedRowModel: () => ({
      rows: selectedIds.map((id) => buildMockRow(id)),
      flatRows: [],
      rowsById: {},
    }),
  }) as unknown as MRT_TableInstance<TestRowData>;

/**
 * Builds a partial MRT_TableInstance mock that only exposes table.options.actions —
 * the sole slice of the table that RowActionsCell reads
 */
export const buildMockTableWithActions = (
  actions: Action<TestRowData>[] | undefined,
): MRT_TableInstance<TestRowData> =>
  ({ options: { actions } }) as unknown as MRT_TableInstance<TestRowData>;
