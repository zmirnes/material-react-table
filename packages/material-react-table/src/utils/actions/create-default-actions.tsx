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
  row: MRT_Row<TData>;
  refetchData?: () => void;
  table: MRT_TableInstance<TData>;
}

/**
 * Builds the list of default row actions (delete, etc.) based on which
 * action callbacks are provided.
 */
export function createDefaultActions<TData extends MRT_RowData>({
  actions,
  row,
  refetchData,
  table,
}: CreateDefaultActionsParams<TData>): TActions {
  const enabledActions: TActions = [];

  if (actions?.deleteRowAction) {
    // Bind the current row so the handler does not need to accept arguments at the call site
    const boundDeleteRowAction = () => actions.deleteRowAction!(row);

    enabledActions.push({
      name: 'delete',
      label: 'Delete',
      description: 'Delete',
      componentRow: () => (
        <DeleteRowAction
          deleteRowAction={boundDeleteRowAction}
          refetchData={refetchData}
          table={table}
        />
      ),
    });
  }

  return enabledActions;
}
