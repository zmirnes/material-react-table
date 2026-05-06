import SubdirectoryArrowLeftIcon from '@mui/icons-material/SubdirectoryArrowLeft';
import { Checkbox, IconButton } from '@mui/material';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { useState, type ReactNode } from 'react';
import { MRT_ExpandAllButton } from '../../components/buttons/MRT_ExpandAllButton';
import { MRT_ExpandButton } from '../../components/buttons/MRT_ExpandButton';
import {
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_RowData,
  type MRT_StatefulTableOptions,
  type MRT_TableInstance,
} from '../../types';
import { defaultDisplayColumnProps } from '../../utils/displayColumn.utils';
import { getCommonTooltipProps } from '../../utils/style.utils';

interface reorderRowCheckboxActionProps {
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isSelected: boolean;
}

const reorderRowCheckboxAction = ({
  onChange,
  isSelected,
}: reorderRowCheckboxActionProps) => {
  return (
    <Checkbox
      checked={isSelected}
      color="warning"
      disableRipple
      onChange={onChange}
      sx={{
        color: (theme) => theme.palette.warning.main,
        '&.Mui-checked': {
          color: (theme) => theme.palette.warning.main,
        },
      }}
    />
  );
};

const insertHereAction = () => {
  return (
    <Tooltip title="Insert here" disableInteractive>
      <IconButton size="small">
        <SubdirectoryArrowLeftIcon color="warning" />
      </IconButton>
    </Tooltip>
  );
};

const getDeepestSubRowDepth = <TData extends MRT_RowData>(
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

const getSelectedReorderRowIds = (
  rowReorderingSelection?: Record<string, boolean>,
): string[] => {
  return Object.entries(rowReorderingSelection ?? {})
    .filter(([, isSelected]) => isSelected)
    .map(([rowId]) => rowId);
};

const getSelectedRowsMaxRelativeDepth = <TData extends MRT_RowData>({
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

const canInsertSelectedRowsWithoutExceedingMaxDepth = ({
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

  // maxDepth counts levels (depth 0..maxDepth-1), and insert action places
  // selected rows as children of target row.
  const maxAllowedDepth = maxDepth - 1;
  const insertedRootDepth = targetRowDepth + 1;
  const movedSubTreeMaxDepth = insertedRootDepth + selectedRowsMaxRelativeDepth;

  return movedSubTreeMaxDepth <= maxAllowedDepth;
};

const getFirstSelectedReorderRowDepth = <TData extends MRT_RowData>({
  rowReorderingSelection,
  table,
}: {
  rowReorderingSelection?: Record<string, boolean>;
  table: MRT_TableInstance<TData>;
}): number | undefined => {
  const firstSelectedRowId = Object.entries(rowReorderingSelection ?? {}).find(
    ([, isSelected]) => isSelected,
  )?.[0];

  if (!firstSelectedRowId) return undefined;

  return table.getRow(firstSelectedRowId, true)?.depth;
};

const canSelectRowForReorder = ({
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
  if (isCurrentRowSelected) return true;

  const hasAnySelection = Object.values(rowReorderingSelection ?? {}).some(
    Boolean,
  );
  if (!hasAnySelection) return true;

  return rowDepth === firstSelectedReorderRowDepth;
};

export const getMRT_RowExpandColumnDef = <TData extends MRT_RowData>(
  tableOptions: MRT_StatefulTableOptions<TData>,
): MRT_ColumnDef<TData> => {
  const {
    defaultColumn,
    enableExpandAll,
    groupedColumnMode,
    maxDepth,
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
      // Keep tree/group rendering on existing expand/grouping APIs for this
      // iteration to avoid introducing parallel alias names.
      const [isRowHovered, setIsRowHovered] = useState(false);
      const expandButtonProps = { row, staticRowIndex, table };
      const subRowsLength = row.subRows?.length;
      const customGroupedCell = column.columnDef.GroupedCell?.({
        cell,
        column,
        row,
        table,
        staticRowIndex,
      });

      // Can insert: If first selected row is eg. on depth 2, then only depth 2 rows can be selected for reordering
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
      ).some((selection) => selection);
      const selectedReorderRowIds = getSelectedReorderRowIds(
        rowReorderingSelection,
      );
      const selectedRowsMaxRelativeDepth = getSelectedRowsMaxRelativeDepth({
        selectedRowIds: selectedReorderRowIds,
        table,
      });

      const shouldShowReorderCheckbox =
        canSelectForReorder && (isRowHovered || hasAnyReorderSelection);
      const shouldShowInsertHereAction =
        selectedReorderRowIds.length > 0 &&
        canInsertSelectedRowsWithoutExceedingMaxDepth({
          hasAnyReorderSelection,
          maxDepth,
          selectedRowsMaxRelativeDepth,
          targetRowDepth: row.depth,
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
            gap="0.25rem"
            onMouseEnter={() => setIsRowHovered(true)}
            onMouseLeave={() => setIsRowHovered(false)}
            width="100%"
          >
            <MRT_ExpandButton {...expandButtonProps} />
            {column.columnDef.GroupedCell
              ? customGroupedCell
              : defaultGroupedCell}
            {shouldShowReorderCheckbox &&
              reorderRowCheckboxAction({
                onChange: (event) => {
                  const checked = event.target.checked;
                  table.setRowReorderingSelection((prev) => ({
                    ...prev,
                    [row.id]: checked,
                  }));
                },
                isSelected: !!rowReorderingSelection?.[row.id],
              })}
            {shouldShowInsertHereAction && insertHereAction()}

            {!!subRowsLength && <span>({subRowsLength})</span>}
          </Stack>
        );
      } else {
        return (
          <Stack
            alignItems="center"
            flexDirection="row"
            onMouseEnter={() => setIsRowHovered(true)}
            onMouseLeave={() => setIsRowHovered(false)}
            width="100%"
          >
            <MRT_ExpandButton {...expandButtonProps} />
            {customGroupedCell}
            {shouldShowReorderCheckbox &&
              reorderRowCheckboxAction({
                onChange: (event) => {
                  const checked = event.target.checked;
                  table.setRowReorderingSelection((prev) => ({
                    ...prev,
                    [row.id]: checked,
                  }));
                },
                isSelected: !!rowReorderingSelection?.[row.id],
              })}
            {shouldShowInsertHereAction && insertHereAction()}
          </Stack>
        );
      }
    },
    Header: enableExpandAll
      ? ({ table }) => {
          return (
            <>
              <MRT_ExpandAllButton table={table} />
              {groupedColumnMode === 'remove' &&
                grouping
                  ?.map(
                    (groupedColumnId) =>
                      table.getColumn(groupedColumnId).columnDef.header,
                  )
                  ?.join(', ')}
            </>
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
