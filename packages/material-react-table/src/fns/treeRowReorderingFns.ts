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
 * Finds the MAXIMUM relative depth among all selected rows.
 * Relative depth = (deepest descendant) - (root row depth).
 * Used to check if there's enough space if we move this row.
 * Example: Row at depth 1 with children up to depth 4 → relative = 4 - 1 = 3
 */
export const getSelectedRowsMaxRelativeDepth = <TData extends MRT_RowData>({
  selectedRowIds,
  table,
}: {
  selectedRowIds: string[];
  table: MRT_TableInstance<TData>;
}): number => {
  return selectedRowIds.reduce((maxRelativeDepth, selectedRowId) => {
    const selectedRow = table.getRow(selectedRowId, true);

    if (!selectedRow) {
      return maxRelativeDepth;
    }

    const selectedRowDeepestDescendantDepth = getDeepestSubRowDepth(
      selectedRow as MRT_Row<TData>,
    );
    const currentRelativeDepth =
      selectedRowDeepestDescendantDepth - selectedRow.depth;

    return Math.max(maxRelativeDepth, currentRelativeDepth);
  }, 0);
};

/**
 * Checks WHETHER we can move selected rows as children of target row
 * without exceeding the maximum allowed depth.
 * Example: maxDepth=5, target.depth=2, relativeDepth=3 → 2+1+3=6 (EXCEEDS!) → false
 */
export const canInsertSelectedRowsWithoutExceedingMaxDepth = ({
  hasAnyReorderSelection,
  maxDepth,
  selectedRowsMaxRelativeDepth,
  targetRowDepth,
}: {
  hasAnyReorderSelection: boolean;
  maxDepth?: number;
  selectedRowsMaxRelativeDepth: number;
  targetRowDepth: number;
}): boolean => {
  if (!hasAnyReorderSelection || maxDepth === undefined) {
    return true;
  }

  // maxDepth counts levels (depth 0..maxDepth-1), insert places rows as children of target row
  const maxAllowedDepth = maxDepth - 1;
  const insertedRootDepth = targetRowDepth + 1;
  const movedSubTreeMaxDepth = insertedRootDepth + selectedRowsMaxRelativeDepth;

  return movedSubTreeMaxDepth <= maxAllowedDepth;
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
