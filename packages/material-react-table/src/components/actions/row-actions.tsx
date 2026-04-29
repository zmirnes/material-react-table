import Box from '@mui/material/Box';
import {
  MRT_Row,
  MRT_RowData,
  MRT_ServerTableActions,
  MRT_TableInstance,
} from '../../types';
import { createDefaultActions } from '../../utils/actions/create-default-actions';

interface RowActionsProps<TData extends MRT_RowData> {
  actions?: MRT_ServerTableActions<TData>;
  row: MRT_Row<TData>;
  refetchData?: () => void;
  table: MRT_TableInstance<TData>;
}

export default function RowActions<TData extends MRT_RowData>({
  actions,
  row,
  refetchData,
  table,
}: RowActionsProps<TData>) {
  const defaultActions = createDefaultActions({
    actions,
    row,
    refetchData,
    table,
  });

  return <Box>{defaultActions.map((action) => action.componentRow?.())}</Box>;
}
