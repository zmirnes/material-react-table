import { MRT_ColumnDef, MRT_RowData } from '../../types';

export function mergeColumnDef<TData extends MRT_RowData>(
  column: MRT_ColumnDef<TData>,
  defaults: Partial<MRT_ColumnDef<TData>>,
): MRT_ColumnDef<TData> {
  return {
    ...defaults,
    ...column,
    meta: {
      ...(defaults.meta ?? {}),
      ...(column.meta ?? {}),
    },
  };
}
