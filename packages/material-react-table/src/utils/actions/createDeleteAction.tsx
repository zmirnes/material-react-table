import DeleteRowAction from '../../components/actions/DeleteRowAction';
import { type MRT_RowData } from '../../types';
import {
  type Action,
  type ActionRowRenderContext,
  type ActionToolbarRenderContext,
  type CreateDeleteActionOptions,
  type OnDeleteActionContext,
} from '../../types/actions/actions.types';

export const createDeleteAction = <TData extends MRT_RowData>({
  onDelete,
  renderRow: customRenderRow,
  renderToolbar: customRenderToolbar,
  deleteConfirmation,
  ...rest
}: CreateDeleteActionOptions<TData> = {}): Action<TData> => {
  // Default delete behavior used when the consumer does not provide a custom onDelete.
  // Also exposed to custom onDelete through context.defaultOnDelete for composition.
  const defaultOnDelete = async ({
    rowsToDelete,
    table,
  }: OnDeleteActionContext<TData>) => {
    // Nothing to delete, so exit early.
    if (!rowsToDelete.length) {
      return;
    }
    await table.options.deleteRowsFn?.({ rowsToDelete, table });
  };

  // Single execution pipeline for every delete flow (row or toolbar).
  // If a custom handler exists, it receives defaultOnDelete and decides when to call it.
  const executeDelete = (context: OnDeleteActionContext<TData>) => {
    const executeDefaultDelete = () => defaultOnDelete(context);

    if (onDelete) {
      return onDelete({
        ...context,
        defaultOnDelete: executeDefaultDelete,
      });
    }

    return executeDefaultDelete();
  };

  // Resolves selected rows from table state for toolbar-triggered delete.
  const handleMultipleRowDelete = ({
    table,
  }: ActionToolbarRenderContext<TData>) => {
    const rowsToDelete = table.getSelectedRowModel().rows;
    return executeDelete({ table, rowsToDelete });
  };

  // Resolves only the active row for row-triggered delete.
  const handleSingleRowDelete = ({
    table,
    row,
  }: ActionRowRenderContext<TData>) => {
    return executeDelete({ table, rowsToDelete: [row] });
  };

  // Wraps row context into a zero-argument callback expected by row action UI.
  // Must return the promise (not fire-and-forget it) so callers like DeleteRowAction
  // can `await` it and keep the confirmation modal open until delete actually finishes.
  const createRowDeleteExecutor = (context: ActionRowRenderContext<TData>) => {
    return () => handleSingleRowDelete(context);
  };

  // Wraps toolbar context into a zero-argument callback expected by toolbar action UI.
  // Same reasoning as createRowDeleteExecutor — the returned promise must propagate.
  const createToolbarDeleteExecutor = (
    context: ActionToolbarRenderContext<TData>,
  ) => {
    return () => handleMultipleRowDelete(context);
  };

  // Uses custom row renderer when provided; otherwise renders default delete action UI.
  const renderRowAction = (context: ActionRowRenderContext<TData>) => {
    const onRowDelete = createRowDeleteExecutor(context);

    if (customRenderRow) {
      return customRenderRow({
        ...context,
        onDelete: onRowDelete,
      });
    }

    return (
      <DeleteRowAction
        onDeleteConfirm={onRowDelete}
        table={context.table}
        deleteConfirmation={deleteConfirmation}
      />
    );
  };

  // Uses custom toolbar renderer when provided; otherwise renders default delete action UI.
  const renderToolbarAction = (context: ActionToolbarRenderContext<TData>) => {
    const onToolbarDelete = createToolbarDeleteExecutor(context);

    if (customRenderToolbar) {
      return customRenderToolbar({
        ...context,
        onDelete: onToolbarDelete,
      });
    }

    return (
      <DeleteRowAction
        onDeleteConfirm={onToolbarDelete}
        table={context.table}
      />
    );
  };

  return {
    name: 'delete',
    renderRow: renderRowAction,
    renderToolbar: renderToolbarAction,
    ...rest,
  };
};
