import { useMemo } from 'react';
import Box from '@mui/material/Box';
import { type MRT_RowData, type MRT_TableInstance } from '../../types';

interface ToolbarActionsProps<TData extends MRT_RowData> {
  table: MRT_TableInstance<TData>;
}

export default function ToolbarActions<TData extends MRT_RowData>({
  table,
}: ToolbarActionsProps<TData>) {
  const {
    getState,
    options: { actions },
  } = table;
  const { rowSelection } = getState();
  const selectedCount = useMemo(
    () => Object.values(rowSelection).filter(Boolean).length,
    [rowSelection],
  );
  return (
    <Box
      sx={(theme) => ({
        display: selectedCount > 0 ? 'flex' : 'none',
        position: 'absolute',
        top: '0',
        left: '0',
        zIndex: 10,
        width: '100%',
        height: '100%',
        backgroundColor: theme.palette.primary.lighter,
        py: '1rem',
        px: '0.5rem',
      })}
    >
      {actions?.map((action, actionIndex) => (
        <span key={action.name ?? actionIndex}>
          {action.renderToolbar?.({ table })}
        </span>
      ))}
    </Box>
  );
}
