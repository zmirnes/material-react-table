import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';
import { Checkbox, IconButton } from '@mui/material';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { useState, type ReactNode } from 'react';
import { MRT_ExpandAllButton } from '../../components/buttons/MRT_ExpandAllButton';
import { MRT_ExpandButton } from '../../components/buttons/MRT_ExpandButton';
import {
  type MRT_ColumnDef,
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
        <SubdirectoryArrowRightIcon color="warning" />
      </IconButton>
    </Tooltip>
  );
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
      ).some(Boolean);

      const shouldShowReorderCheckbox =
        canSelectForReorder && (isRowHovered || hasAnyReorderSelection);

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
            {insertHereAction()}

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
            {insertHereAction()}
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
