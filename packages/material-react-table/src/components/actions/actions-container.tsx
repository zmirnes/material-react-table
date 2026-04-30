import Box from '@mui/material/Box';
import { ReactNode } from 'react';
import {
  IAction,
  MRT_Row,
  MRT_RowData,
  MRT_ServerTableActions,
  MRT_TableInstance,
} from '../../types';
import { createDefaultActions } from '../../utils/actions/create-default-actions';

export type ActionRenderStrategy = (action: IAction) => ReactNode;
export interface ActionsContainerProps<TData extends MRT_RowData> {
  actions?: MRT_ServerTableActions<TData>;
  row?: MRT_Row<TData>;
  table: MRT_TableInstance<TData>;
  renderActionStrategy: ActionRenderStrategy;
}

export default function ActionsContainer<TData extends MRT_RowData>({
  actions,
  row,
  table,
  renderActionStrategy,
}: ActionsContainerProps<TData>) {
  const resolvedActions = createDefaultActions({ actions, row, table });

  return (
    <Box>{resolvedActions.map((action) => renderActionStrategy(action))}</Box>
  );
}
