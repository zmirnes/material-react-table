import { MRT_Row, MRT_RowData, MRT_RowId, MRT_TableInstance } from '../../types';

/**
 * Resolves the list of row IDs targeted for deletion.
 * If a specific row is provided, only that row's ID is returned.
 * Otherwise, all currently selected rows from the table state are used.
 */
export const resolveRowsToDelete = <TData extends MRT_RowData>(
  table: MRT_TableInstance<TData>,
  row?: MRT_Row<TData>,
): MRT_RowId[] => {
  if (row !== undefined) {
    return [row.original.id];
  }
  return table
    .getSelectedRowModel()
    .rows.map((selectedRow) => selectedRow.original.id);
};

