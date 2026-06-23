import React from 'react';
import { useTheme } from '@mui/material/styles';
import TableCell, { type TableCellProps } from '@mui/material/TableCell';
import {
  type MRT_Header,
  type MRT_RowData,
  type MRT_TableInstance,
} from '../../types';
import { cellKeyboardShortcuts } from '../../utils/cell.utils';
import { getCommonMRTCellStyles } from '../../utils/style.utils';
import { parseFromValuesOrFunc } from '../../utils/utils';

export interface MRT_TableFooterCellProps<TData extends MRT_RowData>
  extends TableCellProps {
  footer: MRT_Header<TData>;
  staticColumnIndex?: number;
  table: MRT_TableInstance<TData>;
}

export const MRT_TableFooterCell = <TData extends MRT_RowData>({
  footer,
  staticColumnIndex,
  table,
  ...rest
}: MRT_TableFooterCellProps<TData>) => {
  const theme = useTheme();
  const {
    getState,
    options: {
      enableColumnPinning,
      muiTableFooterCellProps,
      enableKeyboardShortcuts,
    },
  } = table;
  const { density } = getState();
  const { column } = footer;
  const { columnDef } = column;
  const { columnDefType } = columnDef;

  const isColumnPinned =
    enableColumnPinning &&
    columnDef.columnDefType !== 'group' &&
    column.getIsPinned();

  const args = { column, table };
  const tableCellProps = {
    ...parseFromValuesOrFunc(muiTableFooterCellProps, args),
    ...parseFromValuesOrFunc(columnDef.muiTableFooterCellProps, args),
    ...rest,
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTableCellElement>) => {
    tableCellProps?.onKeyDown?.(event);
    cellKeyboardShortcuts({
      event,
      cellValue: footer.column.columnDef.footer,
      table,
    });
  };

  return (
    <TableCell
      align={
        columnDefType === 'group'
          ? 'center'
          : theme.direction === 'rtl'
            ? 'right'
            : 'left'
      }
      colSpan={footer.colSpan}
      data-index={staticColumnIndex}
      data-pinned={!!isColumnPinned || undefined}
      tabIndex={enableKeyboardShortcuts ? 0 : undefined}
      variant="footer"
      {...tableCellProps}
      onKeyDown={handleKeyDown}
      sx={(theme) => ({
        fontWeight: 'bold',
        p:
          density === 'compact'
            ? '0.5rem'
            : density === 'spacious'
              ? '1rem'
              : '1.5rem',
        verticalAlign: 'top',
        ...getCommonMRTCellStyles({
          column,
          header: footer,
          table,
          tableCellProps,
          theme,
        }),
        ...(parseFromValuesOrFunc(tableCellProps?.sx, theme) as Record<
          string,
          unknown
        >),
      })}
    >
      {tableCellProps.children ??
        (footer.isPlaceholder
          ? null
          : (parseFromValuesOrFunc(columnDef.Footer, {
              column,
              footer,
              table,
            }) ??
            columnDef.footer ??
            null))}
    </TableCell>
  );
};
