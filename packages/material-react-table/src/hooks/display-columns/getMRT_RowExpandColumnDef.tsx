import { type ReactNode } from 'react';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { MRT_ExpandAllButton } from '../../components/buttons/MRT_ExpandAllButton';
import { MRT_ExpandButton } from '../../components/buttons/MRT_ExpandButton';
import { MRT_InsertHereAction } from '../../components/buttons/MRT_InsertHereAction';
import { MRT_MoveToTopAction } from '../../components/buttons/MRT_MoveToTopAction';
import { MRT_ReorderRowCheckbox } from '../../components/buttons/MRT_ReorderRowCheckbox';
import {
  type MRT_ColumnDef,
  type MRT_RowData,
  type MRT_StatefulTableOptions,
} from '../../types';
import { defaultDisplayColumnProps } from '../../utils/displayColumn.utils';
import { getCommonTooltipProps } from '../../utils/style.utils';
import { useTreeRowReorderingCell } from '../useTreeRowReorderingCell';
import { useTreeRowReorderingHeader } from '../useTreeRowReorderingHeader';

const TREE_REORDER_ICON_SPACING = '0.25rem';

export const getMRT_RowExpandColumnDef = <TData extends MRT_RowData>(
  tableOptions: MRT_StatefulTableOptions<TData>,
): MRT_ColumnDef<TData> => {
  const {
    defaultColumn,
    enableRowReordering,
    enableExpandAll,
    groupedColumnMode,
    maxDepth,
    onTreeRowReorder,
    positionExpandColumn,
    renderDetailPanel,
    state: { grouping, rowReorderingSelection },
  } = tableOptions;

  const alignProps =
    positionExpandColumn === 'last'
      ? ({
          align: 'right',
        } as const)
      : undefined;

  return {
    Cell: ({ cell, column, row, staticRowIndex, table }) => {
      const cellLogic = useTreeRowReorderingCell({
        row,
        table,
        rowReorderingSelection,
        maxDepth,
        onTreeRowReorder,
      });

      const expandButtonProps = { row, staticRowIndex, table };
      const subRowsLength = row.subRows?.length;
      const customGroupedCell = column.columnDef.GroupedCell?.({
        cell,
        column,
        row,
        table,
        staticRowIndex,
      });

      if (groupedColumnMode === 'remove' && row.groupingColumnId) {
        const defaultGroupedCell = (
          <Tooltip
            {...getCommonTooltipProps('right')}
            title={table.getColumn(row.groupingColumnId).columnDef.header}
          >
            <span>{row.groupingValue as ReactNode}</span>
          </Tooltip>
        );

        return (
          <Stack
            alignItems="center"
            flexDirection="row"
            gap={TREE_REORDER_ICON_SPACING}
            onMouseEnter={cellLogic.handleRowHoverEnter}
            onMouseLeave={cellLogic.handleRowHoverLeave}
            width="100%"
          >
            <MRT_ExpandButton {...expandButtonProps} />
            {column.columnDef.GroupedCell
              ? customGroupedCell
              : defaultGroupedCell}
            {cellLogic.shouldShowReorderCheckbox && (
              <MRT_ReorderRowCheckbox
                isSelected={cellLogic.isReorderCheckboxSelected}
                onChange={cellLogic.handleReorderCheckboxChange}
              />
            )}
            {cellLogic.shouldShowInsertHereAction && (
              <MRT_InsertHereAction
                onClick={cellLogic.handleInsertHereActionClick}
              />
            )}
            {!!subRowsLength && <span>({subRowsLength})</span>}
          </Stack>
        );
      }

      return (
        <Stack
          alignItems="center"
          flexDirection="row"
          gap={TREE_REORDER_ICON_SPACING}
          onMouseEnter={cellLogic.handleRowHoverEnter}
          onMouseLeave={cellLogic.handleRowHoverLeave}
          width="100%"
        >
          <MRT_ExpandButton {...expandButtonProps} />
          {customGroupedCell}
          {cellLogic.shouldShowReorderCheckbox && (
            <MRT_ReorderRowCheckbox
              isSelected={cellLogic.isReorderCheckboxSelected}
              onChange={cellLogic.handleReorderCheckboxChange}
            />
          )}
          {cellLogic.shouldShowInsertHereAction && (
            <MRT_InsertHereAction
              onClick={cellLogic.handleInsertHereActionClick}
            />
          )}
        </Stack>
      );
    },
    Header: enableExpandAll
      ? ({ table }) => {
          const headerLogic = useTreeRowReorderingHeader({
            table,
            enableRowReordering,
            onTreeRowReorder,
          });

          return (
            <Stack
              alignItems="center"
              flexDirection="row"
              gap={TREE_REORDER_ICON_SPACING}
            >
              <MRT_ExpandAllButton table={table} />
              {headerLogic.shouldShowMoveToTopLevelAction && (
                <MRT_MoveToTopAction
                  onClick={headerLogic.handleMoveToTopLevelActionClick}
                />
              )}
              {groupedColumnMode === 'remove' &&
                grouping
                  ?.map(
                    (groupedColumnId) =>
                      table.getColumn(groupedColumnId).columnDef.header,
                  )
                  ?.join(', ')}
            </Stack>
          );
        }
      : undefined,
    muiTableBodyCellProps: alignProps,
    muiTableHeadCellProps: alignProps,
    ...defaultDisplayColumnProps({
      header: 'expand',
      id: 'mrt-row-expand',
      size:
        groupedColumnMode === 'remove'
          ? (defaultColumn?.size ?? 180)
          : renderDetailPanel
            ? enableExpandAll
              ? 60
              : 70
            : 100,
      tableOptions,
    }),
    enableResizing: true,
  };
};
