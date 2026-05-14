import { type ReactNode } from 'react';
import { type MRT_Row, type MRT_RowData, type MRT_TableInstance } from '../../types';

export interface ActionToolbarRenderContext<TData extends MRT_RowData> {
  table: MRT_TableInstance<TData>;
}

export interface ActionRowRenderContext<TData extends MRT_RowData> {
  table: MRT_TableInstance<TData>;
  row: MRT_Row<TData>;
}

export interface Action<TData extends MRT_RowData> {
  name: string;
  renderToolbar?: (context: ActionToolbarRenderContext<TData>) => ReactNode;
  renderRow?: (context: ActionRowRenderContext<TData>) => ReactNode;
}
type DeleteActionExecutor = () => void | Promise<void>;

export interface OnDeleteActionContext<TData extends MRT_RowData> {
  table: MRT_TableInstance<TData>;
  rowsToDelete: MRT_Row<TData>[];
}

export interface CustomOnDeleteActionContext<TData extends MRT_RowData>
  extends OnDeleteActionContext<TData> {
  // Allows custom delete logic to call the built-in default delete behavior.
  defaultOnDelete: DeleteActionExecutor;
}

export interface DeleteActionRowRenderContext<TData extends MRT_RowData>
  extends ActionRowRenderContext<TData> {
  // Context-aware delete handler for the current row.
  onDelete: DeleteActionExecutor;
}

export interface DeleteActionToolbarRenderContext<TData extends MRT_RowData>
  extends ActionToolbarRenderContext<TData> {
  // Context-aware delete handler for currently selected rows.
  onDelete: DeleteActionExecutor;
}

export interface CreateDeleteActionOptions<TData extends MRT_RowData>
  extends Partial<Omit<Action<TData>, 'renderRow' | 'renderToolbar'>> {
  // Custom delete behavior with access to default behavior via defaultOnDelete.
  onDelete?: (
    context: CustomOnDeleteActionContext<TData>,
  ) => void | Promise<void>;
  renderRow?: (context: DeleteActionRowRenderContext<TData>) => ReactNode;
  renderToolbar?: (
    context: DeleteActionToolbarRenderContext<TData>,
  ) => ReactNode;
}
