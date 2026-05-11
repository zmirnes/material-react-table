import { type ReactNode, type JSX } from 'react';
import {
  createRow as _createRow,
  flexRender as _flexRender,
  type AccessorFn,
  type DeepKeys,
  type Renderable,
} from '@tanstack/react-table';
import { getAllLeafColumnDefs, getColumnId } from './column.utils';
import {
  type MRT_ColumnHelper,
  type MRT_DisplayColumnDef,
  type MRT_GroupColumnDef,
  type MRT_Row,
  type MRT_RowData,
  type MRT_TableInstance,
} from '../types';

export const flexRender = _flexRender as (
  Comp: Renderable<unknown>,
  props: unknown,
) => JSX.Element | ReactNode;

export function createMRTColumnHelper<
  TData extends MRT_RowData,
>(): MRT_ColumnHelper<TData> {
  return {
    accessor: (
      accessor: AccessorFn<TData> | DeepKeys<TData>,
      column: MRT_DisplayColumnDef<TData>,
    ) => {
      return typeof accessor === 'function'
        ? { ...column, accessorFn: accessor }
        : { ...column, accessorKey: accessor };
    },
    display: (column: MRT_DisplayColumnDef<TData>) =>
      column as MRT_DisplayColumnDef<TData>,
    group: (column: MRT_GroupColumnDef<TData>) =>
      column as MRT_GroupColumnDef<TData>,
  } as unknown as MRT_ColumnHelper<TData>;
}

export const createRow = <TData extends MRT_RowData>(
  table: MRT_TableInstance<TData>,
  originalRow?: TData,
  rowIndex = -1,
  depth = 0,
  subRows?: MRT_Row<TData>[],
  parentId?: string,
): MRT_Row<TData> =>
  _createRow(
    table as unknown as Parameters<typeof _createRow>[0],
    'mrt-row-create',
    originalRow ??
      Object.assign(
        {},
        ...getAllLeafColumnDefs(table.options.columns).map((col) => ({
          [getColumnId(col)]: '',
        })),
      ),
    rowIndex,
    depth,
    subRows as unknown as Parameters<typeof _createRow>[5],
    parentId,
  ) as MRT_Row<TData>;
