import {
  MRT_Row,
  MRT_RowData,
  MRT_ServerTableActions,
  MRT_TableInstance,
  TActions,
} from '../../types';
import DeleteRowAction from '../../components/actions/delete-row/delete-row';

interface CreateDefaultActionsParams<TData extends MRT_RowData> {
  actions?: MRT_ServerTableActions<TData>;
  row?: MRT_Row<TData>;
  table: MRT_TableInstance<TData>;
}

/**
 * Builds the list of default row actions (delete, etc.) based on which
 * action callbacks are provided.
 */
export function createDefaultActions<TData extends MRT_RowData>({
  actions,
  row,
  table,
}: CreateDefaultActionsParams<TData>): TActions {
  const enabledActions: TActions = [];

  if (actions?.deleteRowAction) {
    const handleSingleDelete = () => {
      if (row !== undefined) {
        actions.deleteRowAction!(row);
      }
    };
    const handleMultiselectDelete = () => {
      const selectedRows = table.getSelectedRowModel().rows;
      selectedRows.forEach(actions.deleteRowAction!);
    };

    enabledActions.push({
      name: 'delete',
      label: 'Delete',
      description: 'Delete',
      renderRowActions: () => (
        <DeleteRowAction deleteRowAction={handleSingleDelete} table={table} />
      ),
      renderToolbarActions: () => (
        <DeleteRowAction
          table={table}
          deleteRowAction={handleMultiselectDelete}
        />
      ),
    });
  }

  return enabledActions;
}
