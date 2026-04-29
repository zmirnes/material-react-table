import EditRowAction from '../../components/actions/edit-row/edit-row';
import DeleteRowAction from '../../components/actions/delete-row/delete-row';
import { MRT_RowData, RowActionsType } from '../../types';

export default function getRowAction<TData extends MRT_RowData>(props: RowActionsType<TData>) {
  const { action, deleteRowAction, refetchData, table } = props;
  switch (action) {
    case 'edit':
      return <EditRowAction />;
    case 'delete':
      return <DeleteRowAction deleteRowAction={deleteRowAction} refetchData={refetchData} table={table}/>;
    default:
      return null;
  }
}
