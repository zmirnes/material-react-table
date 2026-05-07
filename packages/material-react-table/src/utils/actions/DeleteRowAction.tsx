import { MRT_Row, MRT_RowData, MRT_TableInstance } from '../../types';
import { DeleteActionConfig } from '../../types/actions-types';
import MRT_DeleteRowButton from '../../components/buttons/MRT_DeleteRowButton';

export interface DeleteRowActionProps<TData extends MRT_RowData> {
  table: MRT_TableInstance<TData>;
  row?: MRT_Row<TData>;
  delete: () => void;
  config?: DeleteActionConfig<TData>;
}

const DeleteRowAction = <TData extends MRT_RowData>({
  table,
  row,
  delete: onDelete,
  config,
}: DeleteRowActionProps<TData>) => {
  // Toolbar context — no specific row is targeted
  if (!row && config?.renderToolbar) {
    return config.renderToolbar({ table, onDelete });
  }

  // Row context — a specific row is targeted
  if (row && config?.renderRow) {
    return config.renderRow({ table, row, onDelete });
  }

  return <MRT_DeleteRowButton onClick={onDelete} />;
};

export default DeleteRowAction;

