import { createDeleteAction } from './createDeleteAction';
import { createEditAction } from './createEditAction';
import { type MRT_RowData } from '../../types';
import { type Action } from '../../types/actions/actions.types';

// Union of all supported built-in action names.
type ActionName = 'edit' | 'delete';

export default function createActions<TData extends MRT_RowData>(
  actions: ActionName[],
): Action<TData>[] {
  const createActionByName: Record<ActionName, () => Action<TData>> = {
    delete: () => createDeleteAction<TData>({}),
    edit: () => createEditAction<TData>({}),
  };

  return actions.map((actionName) => createActionByName[actionName]());
}
