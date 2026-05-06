import React from 'react';
import { MRT_Row, MRT_RowData, MRT_TableInstance } from '../../types';
import MRT_DeleteButton from '../../components/buttons/MRT_DeleteButton';
import { Action, DeleteActionConfig } from '../../types/actions-types';
const DefaultDeleteButton = ({ onDelete }: { onDelete: () => void }) => (
  <MRT_DeleteButton onClick={onDelete} />
);
export const createDeleteAction = <TData extends MRT_RowData>(
  config?: DeleteActionConfig<TData>,
): Action<TData> => {
  const defaultHandler = () =>
    alert(
      '[createDeleteAction] No onDelete handler provided. ' +
        'Pass onDelete in the config to handle delete functionality.',
    );
  const createOnDeleteHandler =
    <TContext extends { table: MRT_TableInstance<TData> }>(context: TContext) =>
    () => {
      if (config?.onDelete) {
        config.onDelete({ defaultHandler, ...context });
        return;
      }
      defaultHandler();
    };

  const createOnDeleteFromToolbar = (context: {
    table: MRT_TableInstance<TData>;
  }) => createOnDeleteHandler(context);

  const createOnDeleteFromRow = (context: {
    row: MRT_Row<TData>;
    table: MRT_TableInstance<TData>;
  }) => createOnDeleteHandler(context);

  const renderDeleteSlot = <TContext extends object>(
    context: TContext,
    createHandler: (handlerContext: TContext) => () => void,
    customRenderer?: (
      args: TContext & { onDelete: () => void; defaultHandler: () => void },
    ) => React.ReactNode,
  ): React.ReactNode => {
    const onDelete = createHandler(context);
    return customRenderer ? (
      customRenderer({ ...context, onDelete, defaultHandler })
    ) : (
      <DefaultDeleteButton onDelete={onDelete} />
    );
  };

  return {
    name: 'delete',
    renderToolbar: (context) =>
      renderDeleteSlot(
        context,
        createOnDeleteFromToolbar,
        config?.renderToolbar,
      ),
    renderRow: (context) =>
      renderDeleteSlot(context, createOnDeleteFromRow, config?.renderRow),
  };
};
