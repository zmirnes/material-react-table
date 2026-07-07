import React, { type DragEvent, useCallback, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import { type Theme, useTheme } from '@mui/material/styles';
import TableCell, { type TableCellProps } from '@mui/material/TableCell';
import Tooltip from '@mui/material/Tooltip';
import { MRT_TableHeadCellColumnActionsButton } from './MRT_TableHeadCellColumnActionsButton';
import { MRT_TableHeadCellFilterLabel } from './MRT_TableHeadCellFilterLabel';
import { MRT_TableHeadCellGrabHandle } from './MRT_TableHeadCellGrabHandle';
import { MRT_TableHeadCellResizeHandle } from './MRT_TableHeadCellResizeHandle';
import { MRT_TableHeadCellSortLabel } from './MRT_TableHeadCellSortLabel';
import {
  type MRT_ColumnVirtualizer,
  type MRT_Header,
  type MRT_RowData,
  type MRT_TableInstance,
} from '../../types';
import { cellKeyboardShortcuts } from '../../utils/cell.utils';
import {
  getCommonMRTCellStyles,
  getCommonTooltipProps,
} from '../../utils/style.utils';
import { parseFromValuesOrFunc } from '../../utils/utils';

export interface MRT_TableHeadCellProps<TData extends MRT_RowData>
  extends TableCellProps {
  columnVirtualizer?: MRT_ColumnVirtualizer;
  header: MRT_Header<TData>;
  staticColumnIndex?: number;
  table: MRT_TableInstance<TData>;
}

export const MRT_TableHeadCell = <TData extends MRT_RowData>({
  columnVirtualizer,
  header,
  staticColumnIndex,
  table,
  ...rest
}: MRT_TableHeadCellProps<TData>) => {
  const theme = useTheme();
  const {
    getState,
    options: {
      columnResizeDirection,
      columnResizeMode,
      enableKeyboardShortcuts,
      enableColumnActions,
      enableColumnDragging,
      enableColumnOrdering,
      enableColumnPinning,
      enableGrouping,
      enableMultiSort,
      layoutMode,
      mrtTheme: { draggingBorderColor },
      muiTableHeadCellProps,
    },
    refs: { isResizingRef, tableHeadCellRefs },
    setHoveredColumn,
  } = table;
  const [isColumnCellHovered, setIsColumnCellHovered] = useState(false);
  const {
    columnSizingInfo,
    draggingColumn,
    grouping,
    hoveredColumn,
    showColumnFilters,
  } = getState();
  const { column } = header;
  const { columnDef } = column;
  const { columnDefType } = columnDef;

  const tableCellProps = {
    ...parseFromValuesOrFunc(muiTableHeadCellProps, { column, table }),
    ...parseFromValuesOrFunc(columnDef.muiTableHeadCellProps, {
      column,
      table,
    }),
    ...rest,
  };

  const isColumnPinned =
    enableColumnPinning &&
    columnDef.columnDefType !== 'group' &&
    column.getIsPinned();

  const showColumnActions =
    (enableColumnActions || columnDef.enableColumnActions) &&
    columnDef.enableColumnActions !== false;

  const showDragHandle =
    enableColumnDragging !== false &&
    columnDef.enableColumnDragging !== false &&
    (enableColumnDragging ||
      (enableColumnOrdering && columnDef.enableColumnOrdering !== false) ||
      (enableGrouping &&
        columnDef.enableGrouping !== false &&
        !grouping.includes(column.id)));

  const headerPL = useMemo(() => {
    let pl = 0;
    if (column.getCanSort()) pl += 1;
    if (showColumnActions) pl += 1.75;
    if (showDragHandle) pl += 1.5;
    return pl;
  }, [showColumnActions, showDragHandle]);

  const draggingBorders = useMemo(() => {
    const showResizeBorder =
      columnSizingInfo.isResizingColumn === column.id &&
      columnResizeMode === 'onChange' &&
      !header.subHeaders.length;

    const borderStyle = showResizeBorder
      ? `2px solid ${draggingBorderColor} !important`
      : draggingColumn?.id === column.id
        ? `1px dashed ${theme.palette.grey[500]}`
        : hoveredColumn?.id === column.id
          ? `2px dashed ${draggingBorderColor}`
          : undefined;

    if (showResizeBorder) {
      return columnResizeDirection === 'ltr'
        ? { borderRight: borderStyle }
        : { borderLeft: borderStyle };
    }
    return borderStyle
      ? {
          borderLeft: borderStyle,
          borderRight: borderStyle,
          borderTop: borderStyle,
        }
      : undefined;
  }, [draggingColumn, hoveredColumn, columnSizingInfo.isResizingColumn]);

  const handleDragEnter = (_e: DragEvent) => {
    if (enableGrouping && hoveredColumn?.id === 'drop-zone') {
      setHoveredColumn(null);
    }
    if (enableColumnOrdering && draggingColumn && columnDefType !== 'group') {
      setHoveredColumn(
        columnDef.enableColumnOrdering !== false ? column : null,
      );
    }
  };

  const handleDragOver = (e: DragEvent) => {
    if (columnDef.enableColumnOrdering !== false) {
      e.preventDefault();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTableCellElement>) => {
    tableCellProps?.onKeyDown?.(event);
    cellKeyboardShortcuts({
      event,
      cellValue: header.column.columnDef.header,
      table,
      header,
    });
  };

  // Toggle the column cell hover state, but only when not actively resizing a column
  const handleColumnCellHoverToggle = (isHovered: boolean) => {
    if (!isResizingRef.current) {
      setIsColumnCellHovered(isHovered);
    }
  };

  const handleRef = useCallback(
    (node: HTMLTableCellElement) => {
      if (node) {
        if (tableHeadCellRefs.current) {
          tableHeadCellRefs.current[column.id] = node;
        }
        if (columnDefType !== 'group') {
          columnVirtualizer?.measureElement?.(node);
        }
      }
    },
    [column.id, columnDefType, columnVirtualizer, tableHeadCellRefs],
  );

  const HeaderElement =
    parseFromValuesOrFunc(columnDef.Header, {
      column,
      header,
      table,
    }) ?? columnDef.header;

  return (
    <TableCell
      align={
        columnDefType === 'group'
          ? 'center'
          : theme.direction === 'rtl'
            ? 'right'
            : 'left'
      }
      aria-sort={
        column.getIsSorted()
          ? column.getIsSorted() === 'asc'
            ? 'ascending'
            : 'descending'
          : 'none'
      }
      colSpan={header.colSpan}
      data-can-sort={column.getCanSort() || undefined}
      data-index={staticColumnIndex}
      data-pinned={!!isColumnPinned || undefined}
      data-testid={`header-cell-${column.id}`}
      data-sort={column.getIsSorted() || undefined}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onMouseEnter={() => handleColumnCellHoverToggle(true)}
      onMouseLeave={() => handleColumnCellHoverToggle(false)}
      ref={handleRef}
      tabIndex={enableKeyboardShortcuts ? 0 : undefined}
      {...tableCellProps}
      onKeyDown={handleKeyDown}
      sx={(theme: Theme) => ({
        flexDirection: layoutMode?.startsWith('grid') ? 'column' : undefined,
        fontWeight: 'bold',
        overflow: 'hidden',
        color: theme.palette.text.primary,
        p:
          columnDefType === 'display'
            ? 'var(--mrt-head-display-cell-p)'
            : 'var(--mrt-cell-p)',
        pb:
          columnDefType === 'display'
            ? 0
            : showColumnFilters
              ? '0.4rem'
              : 'var(--mrt-head-cell-pb)',
        pt: columnDefType === 'group' ? '0.25rem' : 'var(--mrt-head-cell-pt)',
        userSelect: enableMultiSort && column.getCanSort() ? 'none' : undefined,
        verticalAlign: 'top',
        borderBottom: 'none',
        paddingBottom: 'none',
        ...getCommonMRTCellStyles({
          column,
          header,
          table,
          tableCellProps,
          theme,
        }),
        ...draggingBorders,
      })}
    >
      {header.isPlaceholder
        ? null
        : (tableCellProps.children ?? (
            <Box
              className="Mui-TableHeadCell-Content"
              sx={{
                alignItems: 'center',
                display: 'flex',
                flexDirection:
                  tableCellProps?.align === 'right' ? 'row-reverse' : 'row',
                justifyContent:
                  columnDefType === 'group' ||
                  tableCellProps?.align === 'center'
                    ? 'center'
                    : column.getCanResize()
                      ? 'space-between'
                      : 'flex-start',
                position: 'relative',
                width: '100%',
              }}
            >
              <Box
                className="Mui-TableHeadCell-Content-Labels"
                onClick={column.getToggleSortingHandler()}
                sx={{
                  alignItems: 'center',
                  cursor:
                    column.getCanSort() && columnDefType !== 'group'
                      ? 'pointer'
                      : undefined,
                  display: 'flex',
                  flexDirection:
                    tableCellProps?.align === 'right' ? 'row-reverse' : 'row',
                  overflow: columnDefType === 'data' ? 'hidden' : undefined,
                  pl:
                    tableCellProps?.align === 'center'
                      ? `${headerPL}rem`
                      : undefined,
                }}
              >
                <Tooltip
                  {...getCommonTooltipProps('top')}
                  title={
                    typeof HeaderElement === 'string'
                      ? HeaderElement
                      : undefined
                  }
                >
                  <Box
                    className="Mui-TableHeadCell-Content-Wrapper"
                    sx={{
                      '&:hover': {
                        textOverflow: 'clip',
                      },
                      overflow: columnDefType === 'data' ? 'hidden' : undefined,
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {HeaderElement}
                  </Box>
                </Tooltip>
                {column.getCanFilter() && (
                  <MRT_TableHeadCellFilterLabel header={header} table={table} />
                )}
                {column.getCanSort() && (
                  <MRT_TableHeadCellSortLabel
                    header={header}
                    table={table}
                    sx={{
                      // Show sort label when the cell is hovered or the column is actively sorted
                      visibility:
                        isColumnCellHovered || column.getIsSorted()
                          ? 'visible'
                          : 'hidden',
                    }}
                  />
                )}
              </Box>
              {columnDefType !== 'group' && (
                <Box
                  className="Mui-TableHeadCell-Content-Actions"
                  sx={{
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: '0.5rem',
                    width: isColumnCellHovered ? 'auto' : 0,
                    visibility: isColumnCellHovered ? 'visible' : 'hidden',
                    px: isColumnCellHovered ? '0.2rem' : 0,
                  }}
                >
                  {showColumnActions && (
                    <MRT_TableHeadCellColumnActionsButton
                      header={header}
                      table={table}
                    />
                  )}
                  {showDragHandle && (
                    <MRT_TableHeadCellGrabHandle
                      column={column}
                      table={table}
                      tableHeadCellRef={{
                        current: tableHeadCellRefs.current?.[column.id]!,
                      }}
                    />
                  )}
                </Box>
              )}
              {column.getCanResize() && (
                <MRT_TableHeadCellResizeHandle header={header} table={table} />
              )}
            </Box>
          ))}
    </TableCell>
  );
};
