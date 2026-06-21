import {
  forwardRef,
  useImperativeHandle,
  type ForwardedRef,
  type ReactElement,
  type Ref,
} from 'react';
import { MaybeSnackbarProvider } from './MaybeSnackbarProvider';
import { MRT_TablePaper } from './table/MRT_TablePaper';
import { useMaterialReactTable } from '../hooks/useMaterialReactTable';
import {
  type MRT_RowData,
  type MRT_TableInstance,
  type MRT_TableOptions,
  type Xor,
} from '../types';

type TableInstanceProp<TData extends MRT_RowData> = {
  table: MRT_TableInstance<TData>;
};

export type MaterialReactTableProps<TData extends MRT_RowData> = Xor<
  TableInstanceProp<TData>,
  MRT_TableOptions<TData>
>;

const isTableInstanceProp = <TData extends MRT_RowData>(
  props: MaterialReactTableProps<TData>,
): props is TableInstanceProp<TData> =>
  (props as TableInstanceProp<TData>).table !== undefined;

const MaterialReactTableComponent = <TData extends MRT_RowData>(
  props: MaterialReactTableProps<TData>,
  ref: ForwardedRef<MRT_TableInstance<TData>>,
) => {
  const table = isTableInstanceProp(props)
    ? props.table
    : useMaterialReactTable(props);

  useImperativeHandle(ref, () => table, [table]);

  return (
    <MaybeSnackbarProvider>
      <MRT_TablePaper table={table} />
    </MaybeSnackbarProvider>
  );
};

export const MaterialReactTable = forwardRef(MaterialReactTableComponent) as <
  TData extends MRT_RowData,
>(
  props: MaterialReactTableProps<TData> & {
    ref?: Ref<MRT_TableInstance<TData>>;
  },
) => ReactElement;
