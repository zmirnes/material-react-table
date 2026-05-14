import { Fragment } from 'react';
import Box from '@mui/material/Box';
import {
  type MRT_Row,
  type MRT_RowData,
  type MRT_TableInstance,
} from '../../types';

interface RowActionsCellProps<TData extends MRT_RowData> {
  row: MRT_Row<TData>;
  table: MRT_TableInstance<TData>;
}

export function RowActionsCell<TData extends MRT_RowData>({
  row,
  table,
}: RowActionsCellProps<TData>) {
  const { actions } = table.options;
  return (
    <Box>
      {actions?.map((action) => (
        <Fragment key={action.name}>
          {action.renderRow?.({ row, table })}
        </Fragment>
      ))}
    </Box>
  );
}
