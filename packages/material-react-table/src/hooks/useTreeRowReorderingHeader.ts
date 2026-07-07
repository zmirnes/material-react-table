import { useCallback } from 'react';
import { useMRT_SliceValue } from './useMRT_SliceValue';
import {
  buildSelectedRowsArray,
  getSelectedReorderRowIds,
} from '../fns/treeRowReorderingFns';
import {
  type MRT_RowData,
  type MRT_TableInstance,
  type MRT_TreeRowReorderEvent,
} from '../types';

interface UseTreeRowReorderingHeaderProps<TData extends MRT_RowData> {
  table: MRT_TableInstance<TData>;
  enableRowReordering?: boolean;
  onTreeRowReorder?: (event: MRT_TreeRowReorderEvent<TData>) => void;
}

export interface TreeRowReorderingHeaderLogic {
  shouldShowMoveToTopLevelAction: boolean;
  handleMoveToTopLevelActionClick: () => void;
}

export const useTreeRowReorderingHeader = <TData extends MRT_RowData>({
  table,
  enableRowReordering,
  onTreeRowReorder,
}: UseTreeRowReorderingHeaderProps<TData>): TreeRowReorderingHeaderLogic => {
  const rowReorderingSelection = useMRT_SliceValue(
    table._uiStore,
    (s) => s.rowReorderingSelection,
  );
  const selectedReorderRowIds = getSelectedReorderRowIds(
    rowReorderingSelection,
  );

  const selectedRowsForReorder = buildSelectedRowsArray(
    selectedReorderRowIds,
    table,
  );

  const shouldShowMoveToTopLevelAction =
    !!enableRowReordering &&
    selectedRowsForReorder.length > 0 &&
    selectedRowsForReorder.some((selectedRow) => selectedRow.depth > 0);

  const handleMoveToTopLevelActionClick = useCallback(() => {
    if (!onTreeRowReorder) {
      console.warn('[MRT] onTreeRowReorder callback is not defined');
      return;
    }

    try {
      const treeRowReorderEvent: MRT_TreeRowReorderEvent<TData> = {
        selectedRowIds: selectedReorderRowIds,
        selectedRows: selectedRowsForReorder,
        table,
        targetRow: null,
      };

      onTreeRowReorder(treeRowReorderEvent);
    } catch (error) {
      console.error('[MRT] Error during tree row reorder to top level:', error);
    }
  }, [onTreeRowReorder, selectedReorderRowIds, selectedRowsForReorder, table]);

  return {
    shouldShowMoveToTopLevelAction,
    handleMoveToTopLevelActionClick,
  };
};
