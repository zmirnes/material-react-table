import { MRT_Row, MRT_RowData, MRT_TableInstance } from '../../types';
import { Action, DeleteActionConfig } from '../../types/actions-types';
import { resolveRowsToDelete } from './resolveRowsToDelete';
import MRT_DeleteButton from '../../components/buttons/MRT_DeleteButton';

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
      if (config?.renderToolbar) {
        return config.renderToolbar({ table: context.table, onDelete });
      }
      return <MRT_DeleteButton onClick={onDelete} />;
    },
    renderRow: (context) => {
      const onDelete = buildOnDeleteHandler(context.table, config, context.row);
      if (config?.renderRow) {
        return config.renderRow({
          table: context.table,
          row: context.row,
          onDelete,
        });
      }
      return <MRT_DeleteButton onClick={onDelete} />;
    },
  };
};
