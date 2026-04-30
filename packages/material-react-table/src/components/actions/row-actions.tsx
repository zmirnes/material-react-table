import {
  IAction,
  MRT_Row,
  MRT_RowData,
  MRT_ServerTableActions,
  MRT_TableInstance,
} from '../../types';
import ActionsContainer, { ActionRenderStrategy } from './actions-container';

interface RowActionsProps<TData extends MRT_RowData> {
  actions?: MRT_ServerTableActions<TData>;
  row: MRT_Row<TData>;
  table: MRT_TableInstance<TData>;
}

const rowActionsRenderStrategy: ActionRenderStrategy = (action: IAction) =>
  action.renderRowActions?.() ?? null;

export default function RowActions<TData extends MRT_RowData>({
  actions,
  row,
  table,
}: RowActionsProps<TData>) {
  return (
    <ActionsContainer
      actions={actions}
      row={row}
      table={table}
      renderActionStrategy={rowActionsRenderStrategy}
    />
  );
}
