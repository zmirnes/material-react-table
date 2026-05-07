import {
  type MRT_Row,
  type MRT_RowData,
  type MRT_TableInstance,
} from '../types';

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

export const getSelectedReorderRowIds = (
  rowReorderingSelection?: Record<string, boolean>,
): string[] => {
  return Object.entries(rowReorderingSelection ?? {})
    .filter(([, isSelected]) => isSelected)
    .map(([rowId]) => rowId);
};

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
