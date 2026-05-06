import { useMemo } from 'react';
import Typography from '@mui/material/Typography';
import { type MRT_RowData, type MRT_TableInstance } from '../../types';

export interface MRT_SelectionCountBadgeProps<TData extends MRT_RowData> {
  table: MRT_TableInstance<TData>;
}

/**
 * Displays the number of currently selected rows.
 *
 * Responsibilities:
 * - Compute the selected row count from `rowSelection` state (server-side
 *   compatible — counts truthy values in the map directly).
 * - Render an accessible label using the `rowsSelected` localization string.
 * - Return null when there are no selected rows so it takes no space.
 */
export const MRT_SelectionCountBadge = <TData extends MRT_RowData>({
  table,
}: MRT_SelectionCountBadgeProps<TData>) => {
  const {
    options: { enableRowSelection, localization },
  } = table;

  const selectedRows = table.getSelectedRowModel().rows;
  const selectedCount = useMemo(
    () => table.getSelectedRowModel().rows.length,
    [selectedRows],
  );

  if (!enableRowSelection || selectedCount === 0) return null;

  return (
    <Typography
      color="text.secondary"
      sx={{ alignSelf: 'center', pl: '0.5rem', whiteSpace: 'nowrap' }}
      variant="body2"
    >
      {localization.rowsSelected.replace(
        '{count}',
        selectedCount.toLocaleString(localization.language),
      )}
    </Typography>
  );
};
