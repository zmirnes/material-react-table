import { MRT_Row, MRT_RowData, MRT_TableInstance } from '../../types';
import { Action, DeleteActionConfig } from '../../types/actions-types';
import { resolveRowsToDelete } from './resolveRowsToDelete';
import DeleteRowAction from './DeleteRowAction';

const buildOnDeleteHandler = <TData extends MRT_RowData>(
  table: MRT_TableInstance<TData>,
  config: DeleteActionConfig<TData> | undefined,
  row?: MRT_Row<TData>,
): (() => void) => {
  return () => {
    const rowsToDelete = resolveRowsToDelete(table, row);
    if (rowsToDelete.length === 0) return;
    config?.onDelete?.({ rowsToDelete, table });
  };
};

export const createDeleteAction = <TData extends MRT_RowData>(
  config?: DeleteActionConfig<TData>,
): Action<TData> => {
  return {
    name: 'delete',
    renderToolbar: (context) => {
      const onDelete = buildOnDeleteHandler(context.table, config);
      return (
        <DeleteRowAction
          table={context.table}
          delete={onDelete}
          config={config}
        />
      );
    },
    renderRow: (context) => {
      const onDelete = buildOnDeleteHandler(context.table, config, context.row);
      return (
        <DeleteRowAction
          table={context.table}
          row={context.row}
          delete={onDelete}
          config={config}
        />
      );
    },
  };
};
