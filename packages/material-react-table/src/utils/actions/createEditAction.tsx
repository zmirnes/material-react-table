import EditRowAction from '../../components/actions/EditRowAction';
import {
  type ActionRowRenderContext,
  type CreateEditActionOptions,
  type OnEditActionContext,
} from '../../types/actions/actions.types';
import type { MRT_RowData } from '../../types';

export const createEditAction = <TData extends MRT_RowData>({
  onEdit,
  renderRow: customRenderRow,
}: CreateEditActionOptions<TData>) => {
  const defaultOnEdit = async ({
    rowToEdit,
    table,
  }: OnEditActionContext<TData>) => {
    // Nothing to edit, so exit early.
    if (!rowToEdit) {
      return;
    }
    const { setNewEntryModal } = table;
    const handleOpenEditModal = () => {
      setNewEntryModal({
        open: true,
        mode: 'edit',
      });
    };
    if (table.options.editRowFn) {
      await table.options.editRowFn({ rowToEdit, table });
      return;
    }
    handleOpenEditModal();
  };
  const executeEdit = (context: OnEditActionContext<TData>) => {
    const executeDefaultEdit = () => defaultOnEdit(context);
    if (onEdit) {
      return onEdit({
        ...context,
        defaultOnEdit: executeDefaultEdit,
      });
    }
    return executeDefaultEdit();
  };
  const handleEditRow = ({ table, row }: ActionRowRenderContext<TData>) => {
    return executeEdit({ table, rowToEdit: row });
  };
  const createEditRowExecutor = (context: ActionRowRenderContext<TData>) => {
    return () => {
      void handleEditRow(context);
    };
  };
  const renderRowAction = (context: ActionRowRenderContext<TData>) => {
    const onRowEdit = createEditRowExecutor(context);

    if (customRenderRow) {
      return customRenderRow({
        ...context,
        onEdit: onRowEdit,
      });
    }
    return <EditRowAction onEditConfirm={onRowEdit} />;
  };
  return {
    name: 'edit',
    renderRow: renderRowAction,
  };
};
