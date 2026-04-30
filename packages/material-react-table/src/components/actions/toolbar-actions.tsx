import Box from '@mui/material/Box';
import {
  MRT_RowData,
  MRT_ServerTableActions,
  MRT_TableInstance,
} from '../../types';
import { createDefaultActions } from '../../utils/actions/create-default-actions';

interface ToolbarActionsProps<TData extends MRT_RowData> {
  actions?: MRT_ServerTableActions<TData>;
  table: MRT_TableInstance<TData>;
}

export default function ToolbarActions<TData extends MRT_RowData>({
  actions,
  table,
}: ToolbarActionsProps<TData>) {
  const defaultActions = createDefaultActions({
    actions,
    table,
  });
  return (
    <Box>{defaultActions.map((action) => action.renderToolbarActions?.())}</Box>
  );
}
