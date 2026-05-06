import { MRT_RowData, MRT_TableInstance } from '../../types';
import { Action } from '../../types/actions-types';
import Box from '@mui/material/Box';

interface ToolbarActionsProps<TData extends MRT_RowData> {
  actions?: Action<TData>[];
  table: MRT_TableInstance<TData>;
}

export default function ToolbarActions<TData extends MRT_RowData>({
  actions,
  table,
}: ToolbarActionsProps<TData>) {
  return (
    <Box>
      {actions?.map((action, actionIndex) => (
        <span key={action.name ?? actionIndex}>
          {action.renderToolbar?.({ table })}
        </span>
      ))}
    </Box>
  );
}
