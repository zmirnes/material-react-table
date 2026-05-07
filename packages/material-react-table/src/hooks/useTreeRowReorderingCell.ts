import { useCallback, useState } from 'react';
import {
  buildSelectedRowsArray,
  canInsertSelectedRowsWithoutExceedingMaxDepth,
  canSelectRowForReorder,
  getFirstSelectedReorderRowDepth,
  getSelectedReorderRowIds,
  isValidInsertTarget,
} from '../fns/treeRowReorderingFns';
import {
  type MRT_Row,
  type MRT_RowData,
  type MRT_TableInstance,
  type MRT_TreeRowReorderEvent,
} from '../types';

export interface UseTreeRowReorderingCellProps<TData extends MRT_RowData> {
  row: MRT_Row<TData>;
  table: MRT_TableInstance<TData>;
  rowReorderingSelection?: Record<string, boolean>;
  maxDepth?: number;
  onTreeRowReorder?: (event: MRT_TreeRowReorderEvent<TData>) => void;
}

export interface TreeRowReorderingCellLogic {
  isRowHovered: boolean;
  shouldShowReorderCheckbox: boolean;
  shouldShowInsertHereAction: boolean;
  handleRowHoverEnter: () => void;
  handleRowHoverLeave: () => void;
  handleReorderCheckboxChange: (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => void;
  handleInsertHereActionClick: () => void;
  isReorderCheckboxSelected: boolean;
}

export const useTreeRowReorderingCell = <TData extends MRT_RowData>({
  row,
  table,
  rowReorderingSelection,
  maxDepth,
  onTreeRowReorder,
}: UseTreeRowReorderingCellProps<TData>): TreeRowReorderingCellLogic => {
  const [isRowHovered, setIsRowHovered] = useState(false);

  const firstSelectedReorderRowDepth = getFirstSelectedReorderRowDepth({
    rowReorderingSelection,
    table,
  });

  const canSelectForReorder = canSelectRowForReorder({
    rowId: row.id,
    rowDepth: row.depth,
    rowReorderingSelection,
    firstSelectedReorderRowDepth,
  });

  const hasAnyReorderSelection = Object.values(
    rowReorderingSelection ?? {},
  ).some(Boolean);

  const selectedReorderRowIds = getSelectedReorderRowIds(
    rowReorderingSelection,
  );

  const selectedRowsForReorder = buildSelectedRowsArray(
    selectedReorderRowIds,
    table,
  );

  const shouldShowReorderCheckbox =
    canSelectForReorder && (isRowHovered || hasAnyReorderSelection);

  const shouldShowInsertHereAction =
    selectedReorderRowIds.length > 0 &&
    isValidInsertTarget({
      targetRowId: row.id,
      selectedRowIds: selectedReorderRowIds,
      table,
    }) &&
    canInsertSelectedRowsWithoutExceedingMaxDepth({
      hasAnyReorderSelection,
      maxDepth,
      selectedRows: selectedRowsForReorder,
      targetRowDepth: row.depth,
    });

  const handleReorderCheckboxChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const checked = event.target.checked;
      table.setRowReorderingSelection((prev) => ({
        ...prev,
        [row.id]: checked,
      }));
    },
    [row.id, table],
  );

  const handleInsertHereActionClick = useCallback(() => {
    if (!onTreeRowReorder) {
      console.warn('[MRT] onTreeRowReorder callback is not defined');
      return;
    }

    try {
      const treeRowReorderEvent: MRT_TreeRowReorderEvent<TData> = {
        selectedRowIds: selectedReorderRowIds,
        selectedRows: selectedRowsForReorder,
        table,
        targetRow: row as MRT_Row<TData>,
      };

      onTreeRowReorder(treeRowReorderEvent);
    } catch (error) {
      console.error('[MRT] Error during tree row reorder:', error);
    }
  }, [
    onTreeRowReorder,
    selectedReorderRowIds,
    selectedRowsForReorder,
    table,
    row,
  ]);

  return {
    isRowHovered,
    shouldShowReorderCheckbox,
    shouldShowInsertHereAction,
    handleRowHoverEnter: () => setIsRowHovered(true),
    handleRowHoverLeave: () => setIsRowHovered(false),
    handleReorderCheckboxChange,
    handleInsertHereActionClick,
    isReorderCheckboxSelected: !!rowReorderingSelection?.[row.id],
  };
};
