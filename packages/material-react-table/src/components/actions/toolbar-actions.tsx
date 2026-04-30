import {
  IAction,
  MRT_RowData,
  MRT_ServerTableActions,
  MRT_TableInstance,
} from '../../types';
import ActionsContainer, { ActionRenderStrategy } from './actions-container';

interface ToolbarActionsProps<TData extends MRT_RowData> {
  actions?: MRT_ServerTableActions<TData>;
  table: MRT_TableInstance<TData>;
}

const toolbarActionsRenderStrategy: ActionRenderStrategy = (action: IAction) =>
  action.renderToolbarActions?.() ?? null;

export default function ToolbarActions<TData extends MRT_RowData>({
  actions,
  table,
}: ToolbarActionsProps<TData>) {
  return (
    <ActionsContainer
      actions={actions}
      table={table}
      renderActionStrategy={toolbarActionsRenderStrategy}
    />
  );
}
