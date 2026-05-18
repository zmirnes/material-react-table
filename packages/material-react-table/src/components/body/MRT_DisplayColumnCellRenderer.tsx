import { type ReactNode, type RefObject } from 'react';
import {
  type MRT_Cell,
  type MRT_RowData,
  type MRT_TableInstance,
} from '../../types';

interface MRT_DisplayColumnCellRendererProps<TData extends MRT_RowData> {
  cell: MRT_Cell<TData>;
  rowRef: RefObject<HTMLTableRowElement | null>;
  staticColumnIndex?: number;
  staticRowIndex: number;
  table: MRT_TableInstance<TData>;
}
export const MRT_DisplayColumnCellRenderer = <TData extends MRT_RowData>({
  cell,
  rowRef,
  staticColumnIndex,
  staticRowIndex,
  table,
}: MRT_DisplayColumnCellRendererProps<TData>): ReactNode => {
  const { column, row } = cell;
  const { columnDef } = column;

  return (
    <>
      {columnDef.Cell?.({
        cell,
        column,
        renderedCellValue: cell.renderValue() as ReactNode,
        row,
        rowRef,
        staticColumnIndex,
        staticRowIndex,
        table,
      }) ?? null}
    </>
  );
};
