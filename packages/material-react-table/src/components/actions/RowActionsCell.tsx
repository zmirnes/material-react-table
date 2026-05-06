import Box from '@mui/material/Box';
import { MRT_Row, MRT_RowData, MRT_TableInstance } from '../../types';
import { Action } from '../../types/actions-types';

type RowActionsCellProps<TData extends MRT_RowData> = {
  actions: Action<TData>[];
  row: MRT_Row<TData>;
  table: MRT_TableInstance<TData>;
};

// Renders a single action item wrapped in a span with a stable key
const RowActionItem = <TData extends MRT_RowData>({
  action,
  actionIndex,
  row,
  table,
}: {
  action: Action<TData>;
  actionIndex: number;
  row: MRT_Row<TData>;
  table: MRT_TableInstance<TData>;
}) => (
  <span key={action.name ?? actionIndex}>
    {action.renderRow?.({ table, row })}
  </span>
);

// Renders all row-level actions for a given row inside a flex Box container
export const RowActionsCell = <TData extends MRT_RowData>({
  actions,
  row,
  table,
}: RowActionsCellProps<TData>) => (
  <Box>
    {actions.map((action, actionIndex) => (
      <RowActionItem
        key={action.name ?? actionIndex}
        action={action}
        actionIndex={actionIndex}
        row={row}
        table={table}
      />
    ))}
  </Box>
);
