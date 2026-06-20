import { columnTypeResolvers } from '../../column-types/registy';
import { type MRT_ColumnDef, type MRT_RowData } from '../../types';

export function createColumnDef<TData extends MRT_RowData>(
  column: MRT_ColumnDef<TData>,
): MRT_ColumnDef<TData> {
  if (column.type === 'object' || column.type === 'actions') {
    return column;
  }
  const resolver = columnTypeResolvers[column.type];

  if (!resolver) {
    return column;
  }

  return resolver.createColumnDef(column);
}

export function createColumnDefs<TData extends MRT_RowData>(
  columns: MRT_ColumnDef<TData>[],
  extendColumns?: Partial<MRT_ColumnDef<TData>>[],
): MRT_ColumnDef<TData>[] {
  return columns.map((column) => {
    const resolved = createColumnDef(column);
    const extension = extendColumns?.find(
      (ext) => ext.accessorKey === column.accessorKey,
    );
    if (extension) return { ...resolved, ...extension } as MRT_ColumnDef<TData>;
    return resolved;
  });
}
