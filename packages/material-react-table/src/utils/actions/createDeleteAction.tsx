import { resolveRowsToDelete } from './resolveRowsToDelete';
import DeleteRowAction from '../../components/actions/DeleteRowAction';
import {
  type MRT_Row,
  type MRT_RowData,
  type MRT_TableInstance,
} from '../../types';
import {
  type Action,
  type DeleteActionConfig,
} from '../../types/actions-types';

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
