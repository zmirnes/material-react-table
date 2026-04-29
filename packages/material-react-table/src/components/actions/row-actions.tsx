import Box from '@mui/material/Box';
import getRowAction from '../../utils/actions/getRowAction';
import { MRT_RowData, MRT_TableInstance, RowActionsType } from '../../types';

interface RowActionsProps<TData extends MRT_RowData> {
  deleteRowAction?: () => void;
  // Callback to refresh table data after a row is deleted
  refetchData?: () => void;
  table: MRT_TableInstance<TData>;
}

export default function RowActions<TData extends MRT_RowData>({
  deleteRowAction,
  refetchData,
  table,
}: RowActionsProps<TData>) {
  const actions: RowActionsType<TData>[] = [
    {
      action: 'edit',
      table: table,
    },
    {
      action: 'delete',
      deleteRowAction: deleteRowAction,
      refetchData: refetchData,
      table: table,
    },
  ];

  return <Box>{actions.map((action) => getRowAction(action))}</Box>;
}
