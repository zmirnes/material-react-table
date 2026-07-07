import React, {
  type DragEvent,
  memo,
  type MouseEvent,
  type RefObject,
  useEffect,
  useMemo,
  useState,
} from 'react';
import Skeleton from '@mui/material/Skeleton';
import { type Theme } from '@mui/material/styles';
import TableCell, { type TableCellProps } from '@mui/material/TableCell';
import { useMRT_SliceValue } from '../../hooks/useMRT_SliceValue';
import { MRT_CopyButton } from '../buttons/MRT_CopyButton';
import { MRT_EditCellTextField } from '../inputs/MRT_EditCellTextField';
import { MRT_DisplayColumnCellRenderer } from './MRT_DisplayColumnCellRenderer';
import { MRT_TableBodyCellValue } from './MRT_TableBodyCellValue';
import {
  type MRT_Cell,
  type MRT_RowData,
  type MRT_TableInstance,
} from '../../types';
import {
  cellKeyboardShortcuts,
  isCellEditable,
  openEditingCell,
} from '../../utils/cell.utils';
import { getCommonMRTCellStyles } from '../../utils/style.utils';
import { parseFromValuesOrFunc } from '../../utils/utils';

export interface MRT_TableBodyCellProps<TData extends MRT_RowData>
  extends TableCellProps {
  cell: MRT_Cell<TData>;
  numRows?: number;
  rowRef: RefObject<HTMLTableRowElement | null>;
  staticColumnIndex?: number;
  staticRowIndex: number;
  table: MRT_TableInstance<TData>;
  theme: Theme;
}

export const MRT_TableBodyCell = <TData extends MRT_RowData>({
  cell,
  numRows,
  rowRef,
  staticColumnIndex,
  staticRowIndex,
  table,
  theme,
  ...rest
}: MRT_TableBodyCellProps<TData>) => {
  const {
    getState,
    options: {
      columnResizeDirection,
      columnResizeMode,
      createDisplayMode,
      editDisplayMode,
      enableCellActions,
      enableClickToCopy,
      enableColumnOrdering,
      enableColumnPinning,
      enableGrouping,
      enableKeyboardShortcuts,
      layoutMode,
      mrtTheme: { draggingBorderColor },
      muiSkeletonProps,
      muiTableBodyCellProps,
    },
    setHoveredColumn,
  } = table;
  const { creatingRow, isLoading, showSkeletons } = getState();
  const density = useMRT_SliceValue(table._uiStore, (s) => s.density);
  const { column, row } = cell;
  const { columnDef } = column;
  const { columnDefType } = columnDef;

  const isResizingThisColumn = useMRT_SliceValue(
    table._uiStore,
    (s) => s.columnSizingInfo.isResizingColumn === column.id,
  );
  const isEditingRow = useMRT_SliceValue(
    table._uiStore,
    (s) => s.editingRow?.id === row.id,
  );
  const isActionCell = useMRT_SliceValue(
    table._uiStore,
    (s) => s.actionCell?.id === cell.id,
  );
  const isEditingCell = useMRT_SliceValue(
    table._uiStore,
    (s) => s.editingCell?.id === cell.id,
  );
  const isDraggingColumn = useMRT_SliceValue(
    table._dragStore,
    (s) => s.draggingColumn?.id === column.id,
  );
  const isDraggingRow = useMRT_SliceValue(
    table._dragStore,
    (s) => s.draggingRow?.id === row.id,
  );
  const isHoveredColumn = useMRT_SliceValue(
    table._hoverStore,
    (s) => s.hoveredColumn?.id === column.id,
  );
  const isHoveredRow = useMRT_SliceValue(
    table._hoverStore,
    (s) => s.hoveredRow?.id === row.id,
  );

  const args = { cell, column, row, table };
  const tableCellProps = {
    ...parseFromValuesOrFunc(muiTableBodyCellProps, args),
    ...parseFromValuesOrFunc(columnDef.muiTableBodyCellProps, args),
    ...rest,
  };

  const skeletonProps = parseFromValuesOrFunc(muiSkeletonProps, {
    cell,
    column,
    row,
    table,
  });

  const [skeletonWidth, setSkeletonWidth] = useState(100);
  useEffect(() => {
    if ((!isLoading && !showSkeletons) || skeletonWidth !== 100) return;
    const size = column.getSize();
    setSkeletonWidth(
      columnDefType === 'display'
        ? size / 2
        : Math.round(Math.random() * (size - size / 3) + size / 3),
    );
  }, [isLoading, showSkeletons]);

  const draggingBorders = useMemo(() => {
    const isFirstColumn = column.getIsFirstColumn();
    const isLastColumn = column.getIsLastColumn();
    const isLastRow = numRows && staticRowIndex === numRows - 1;
    const isResizingColumn = isResizingThisColumn;
    const showResizeBorder =
      isResizingColumn && columnResizeMode === 'onChange';

    const borderStyle = showResizeBorder
      ? `2px solid ${draggingBorderColor} !important`
      : isDraggingColumn || isDraggingRow
        ? `1px dashed ${theme.palette.grey[500]} !important`
        : isHoveredColumn || isHoveredRow || isResizingColumn
          ? `2px dashed ${draggingBorderColor} !important`
          : undefined;

    if (showResizeBorder) {
      return columnResizeDirection === 'ltr'
        ? { borderRight: borderStyle }
        : { borderLeft: borderStyle };
    }

    return borderStyle
      ? {
          borderBottom:
            isDraggingRow || isHoveredRow || (isLastRow && !isResizingColumn)
              ? borderStyle
              : undefined,
          borderLeft:
            isDraggingColumn ||
            isHoveredColumn ||
            ((isDraggingRow || isHoveredRow) && isFirstColumn)
              ? borderStyle
              : undefined,
          borderRight:
            isDraggingColumn ||
            isHoveredColumn ||
            ((isDraggingRow || isHoveredRow) && isLastColumn)
              ? borderStyle
              : undefined,
          borderTop: isDraggingRow || isHoveredRow ? borderStyle : undefined,
        }
      : undefined;
  }, [
    isResizingThisColumn,
    isDraggingColumn,
    isDraggingRow,
    isHoveredColumn,
    isHoveredRow,
    staticRowIndex,
  ]);

  const isColumnPinned =
    enableColumnPinning &&
    columnDef.columnDefType !== 'group' &&
    column.getIsPinned();

  const isEditable = isCellEditable({ cell, table });

  const isEditing =
    isEditable &&
    !['custom', 'modal'].includes(editDisplayMode as string) &&
    (editDisplayMode === 'table' || isEditingRow || isEditingCell) &&
    !row.getIsGrouped();

  const isCreating =
    isEditable && createDisplayMode === 'row' && creatingRow?.id === row.id;

  const showClickToCopyButton =
    (parseFromValuesOrFunc(enableClickToCopy, cell) === true ||
      parseFromValuesOrFunc(columnDef.enableClickToCopy, cell) === true) &&
    !['context-menu', false].includes(
      // @ts-expect-error
      parseFromValuesOrFunc(columnDef.enableClickToCopy, cell),
    );

  const isRightClickable = parseFromValuesOrFunc(enableCellActions, cell);

  const cellValueProps = {
    cell,
    table,
    staticColumnIndex,
    staticRowIndex,
  };

  const handleDoubleClick = (event: MouseEvent<HTMLTableCellElement>) => {
    tableCellProps?.onDoubleClick?.(event);
    openEditingCell({ cell, table });
  };

  const handleDragEnter = (e: DragEvent<HTMLTableCellElement>) => {
    tableCellProps?.onDragEnter?.(e);
    if (
      enableGrouping &&
      table._hoverStore.get().hoveredColumn?.id === 'drop-zone'
    ) {
      setHoveredColumn(null);
    }
    if (enableColumnOrdering && table._dragStore.get().draggingColumn) {
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

  const handleContextMenu = (e: MouseEvent<HTMLTableCellElement>) => {
    tableCellProps?.onContextMenu?.(e);
    if (isRightClickable) {
      e.preventDefault();
      table.setActionCell(cell);
      table.refs.actionCellRef.current = e.currentTarget;
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTableCellElement>) => {
    tableCellProps?.onKeyDown?.(event);
    cellKeyboardShortcuts({
      cell,
      cellValue: cell.getValue<string>(),
      event,
      table,
    });
  };

  return (
    <TableCell
      align={theme.direction === 'rtl' ? 'right' : 'left'}
      data-index={staticColumnIndex}
      data-pinned={!!isColumnPinned || undefined}
      tabIndex={enableKeyboardShortcuts ? 0 : undefined}
      {...tableCellProps}
      onKeyDown={handleKeyDown}
      onContextMenu={handleContextMenu}
      onDoubleClick={handleDoubleClick}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      sx={(theme) => ({
        '&:hover': {
          outline:
            isActionCell ||
            (editDisplayMode === 'cell' && isEditable) ||
            (editDisplayMode === 'table' && (isCreating || isEditing))
              ? `1px solid ${theme.palette.grey[500]}`
              : undefined,
          textOverflow: 'clip',
        },
        alignItems: layoutMode?.startsWith('grid') ? 'center' : undefined,
        cursor: isRightClickable
          ? 'context-menu'
          : isEditable && editDisplayMode === 'cell'
            ? 'pointer'
            : 'inherit',
        outline: isActionCell
          ? `1px solid ${theme.palette.grey[500]}`
          : undefined,
        outlineOffset: '-1px',
        overflow: 'hidden',
        p:
          columnDefType === 'display'
            ? 'var(--mrt-display-cell-p)'
            : 'var(--mrt-cell-p)',

        textOverflow: columnDefType !== 'display' ? 'ellipsis' : undefined,
        whiteSpace:
          row.getIsPinned() || density === 'compact' ? 'nowrap' : 'normal',
        ...getCommonMRTCellStyles({
          column,
          isDraggingColumn,
          isHoveredColumn,
          table,
          tableCellProps,
          theme,
        }),
        ...draggingBorders,
      })}
    >
      {tableCellProps.children ?? (
        <>
          {cell.getIsPlaceholder() ? (
            (columnDef.PlaceholderCell?.({ cell, column, row, table }) ?? null)
          ) : showSkeletons !== false && (isLoading || showSkeletons) ? (
            <Skeleton
              animation="wave"
              height={20}
              width={skeletonWidth}
              {...skeletonProps}
            />
          ) : columnDefType === 'display' &&
            (['mrt-row-expand', 'mrt-row-numbers', '__check__'].includes(
              column.id,
            ) ||
              !row.getIsGrouped()) ? (
            <MRT_DisplayColumnCellRenderer
              cell={cell}
              rowRef={rowRef}
              staticColumnIndex={staticColumnIndex}
              staticRowIndex={staticRowIndex}
              table={table}
            />
          ) : isCreating || isEditing ? (
            <MRT_EditCellTextField cell={cell} table={table} />
          ) : showClickToCopyButton && columnDef.enableClickToCopy !== false ? (
            <MRT_CopyButton cell={cell} table={table}>
              <MRT_TableBodyCellValue {...cellValueProps} />
            </MRT_CopyButton>
          ) : (
            <span
              data-testid={cell.getIsGrouped() ? 'group-cell-value' : undefined}
            >
              <MRT_TableBodyCellValue {...cellValueProps} />
            </span>
          )}
          {cell.getIsGrouped() && !columnDef.GroupedCell && (
            <>
              (<span data-testid="group-cell-count">{row.subRows?.length}</span>
              )
            </>
          )}
        </>
      )}
    </TableCell>
  );
};

export const Memo_MRT_TableBodyCell = memo(
  MRT_TableBodyCell,
  (prev, next) => next.cell === prev.cell,
) as typeof MRT_TableBodyCell;
