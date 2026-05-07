import {
  type MRT_Row,
  type MRT_RowData,
  type MRT_TableInstance,
} from '../types';

/**
 * Finds the maximum depth in the hierarchy of a given row (recursively searches all descendants).
 * Used to determine the "size" of the tree being moved.
 * Example: Row at depth 1 with a child at depth 3 → returns 3
 */
export const getDeepestSubRowDepth = <TData extends MRT_RowData>(
  row: MRT_Row<TData>,
): number => {
  if (!row.subRows?.length) {
    return row.depth;
  }

  return row.subRows.reduce(
    (maxDepth, subRow) => Math.max(maxDepth, getDeepestSubRowDepth(subRow)),
    row.depth,
  );
};

/**
 * Extracts an array of IDs of only the selected rows from the selection object.
 * Filters the record where the value is true and maps only the keys (IDs).
 * Example: { row1: true, row2: false, row3: true } → ['row1', 'row3']
 */
export const getSelectedReorderRowIds = (
  rowReorderingSelection?: Record<string, boolean>,
): string[] => {
  return Object.entries(rowReorderingSelection ?? {})
    .filter(([, isSelected]) => isSelected)
    .map(([rowId]) => rowId);
};

/**
 * Checks WHETHER we can move selected rows as children of target row
 * without exceeding the maximum allowed depth.
 * Directly calculates the final maximum depth after the move.
 * Example: selectedRows at depth 1-2 with descendants to depth 4, target depth 1, maxDepth 5
 *          → new max depth = 1 + 1 + (4 - 1) = 5, which equals maxDepth, so returns false
 */
export const canInsertSelectedRowsWithoutExceedingMaxDepth = <
  TData extends MRT_RowData,
>({
  maxDepth,
  selectedRows,
  targetRowDepth,
}: {
  maxDepth?: number;
  selectedRows: MRT_Row<TData>[];
  targetRowDepth: number;
}): boolean => {
  // Cannot insert if there are no selected rows to move
  if (selectedRows.length === 0) {
    return false;
  }

  // No depth restriction - can insert anywhere
  if (maxDepth === undefined) {
    return true;
  }

  // Find the deepest descendant among all selected rows
  const maxDeepestDescendantDepth = selectedRows.reduce((max, row) => {
    return Math.max(max, getDeepestSubRowDepth(row));
  }, 0);

  // Find the minimum depth of selected rows (to calculate relative depth)
  const minSelectedRowDepth = Math.min(...selectedRows.map((r) => r.depth));

  // Calculate the maximum depth after moving rows as children of target
  // newMaxDepth = target.depth + 1 (as children) + relative depth of selected rows
  const newMaxDepth =
    targetRowDepth + 1 + (maxDeepestDescendantDepth - minSelectedRowDepth);

  return newMaxDepth < maxDepth;
};

/**
 * Finds the depth of the FIRST selected row in the selection object.
 * Used to enforce constraint: can only select rows at the SAME depth.
 * Example: If I select a row at depth 2, I cannot select a row at depth 3
 */
export const getFirstSelectedReorderRowDepth = <TData extends MRT_RowData>({
  rowReorderingSelection,
  table,
}: {
  rowReorderingSelection?: Record<string, boolean>;
  table: MRT_TableInstance<TData>;
}): number | undefined => {
  const firstSelectedRowId = Object.entries(rowReorderingSelection ?? {}).find(
    ([, isSelected]) => isSelected,
  )?.[0];

  if (!firstSelectedRowId) {
    return undefined;
  }

  return table.getRow(firstSelectedRowId, true)?.depth;
};

/**
 * Checks WHETHER we can select a specific row.
 * Rule: If a selection already exists, new row MUST be at the SAME depth as the first selected.
 * Without this, you could move rows from different levels which would break the hierarchy.
 */
export const canSelectRowForReorder = ({
  rowId,
  rowDepth,
  rowReorderingSelection,
  firstSelectedReorderRowDepth,
}: {
  rowId: string;
  rowDepth: number;
  rowReorderingSelection?: Record<string, boolean>;
  firstSelectedReorderRowDepth?: number;
}): boolean => {
  const isCurrentRowSelected = !!rowReorderingSelection?.[rowId];
  if (isCurrentRowSelected) {
    return true;
  }

  const hasAnySelection = Object.values(rowReorderingSelection ?? {}).some(
    Boolean,
  );
  if (!hasAnySelection) {
    return true;
  }

  return rowDepth === firstSelectedReorderRowDepth;
};

/**
 * Creates an array of MRT_Row objects from an array of IDs.
 * Finds each row from the table and collects it in the result.
 * Used to prepare data for the onTreeRowReorder callback.
 */
export const buildSelectedRowsArray = <TData extends MRT_RowData>(
  selectedRowIds: string[],
  table: MRT_TableInstance<TData>,
): MRT_Row<TData>[] => {
  return selectedRowIds.reduce<MRT_Row<TData>[]>(
    (selectedRows, selectedRowId) => {
      const selectedRow = table.getRow(selectedRowId, true);

      if (selectedRow) {
        selectedRows.push(selectedRow as MRT_Row<TData>);
      }

      return selectedRows;
    },
    [],
  );
};

/**
 * Helper function to check if a row is a descendant of another row.
 * Recursively searches through all subRows to find if targetRowId exists.
 * Used to prevent circular references (parent cannot become child of its own child).
 */
const isRowInSubtreeOf = <TData extends MRT_RowData>(
  targetRowId: string,
  parentRow: MRT_Row<TData>,
): boolean => {
  if (!parentRow.subRows?.length) {
    return false;
  }

  for (const subRow of parentRow.subRows) {
    if (subRow.id === targetRowId) {
      return true;
    }

    if (isRowInSubtreeOf(targetRowId, subRow as MRT_Row<TData>)) {
      return true;
    }
  }

  return false;
};

/**
 * Checks if a row can be used as a valid insert target for selected rows.
 * Rules: Target row must NOT be already selected AND must NOT be a descendant of any selected row.
 * This prevents circular references where a parent becomes a child of its own descendants.
 * Example: If you select "Department", you cannot insert it under "Project" (which is its descendant)
 */
export const isValidInsertTarget = <TData extends MRT_RowData>({
  targetRowId,
  selectedRowIds,
  table,
}: {
  targetRowId: string;
  selectedRowIds: string[];
  table: MRT_TableInstance<TData>;
}): boolean => {
  // Rule 1: Target row cannot be already selected
  if (selectedRowIds.includes(targetRowId)) {
    return false;
  }

  // Rule 2: Target row cannot be a descendant of any selected row
  // (prevents parent from becoming child of its own descendants)
  for (const selectedRowId of selectedRowIds) {
    const selectedRow = table.getRow(selectedRowId, true);

    if (
      selectedRow &&
      isRowInSubtreeOf(targetRowId, selectedRow as MRT_Row<TData>)
    ) {
      return false;
    }
  }

  return true;
};
