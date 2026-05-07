import { ReactNode } from 'react';
import { MRT_Row, MRT_RowData, MRT_RowId, MRT_TableInstance } from '../types';

interface ToolbarRenderContext<TData extends MRT_RowData> {
  table: MRT_TableInstance<TData>;
}

interface RowRenderContext<TData extends MRT_RowData> {
  table: MRT_TableInstance<TData>;
  row: MRT_Row<TData>;
}
export interface Action<TData extends MRT_RowData> {
  name: string;
  renderToolbar?: (context: ToolbarRenderContext<TData>) => ReactNode;
  renderRow?: (context: RowRenderContext<TData>) => ReactNode;
}
interface DeleteToolbarRenderContext<TData extends MRT_RowData>
  extends ToolbarRenderContext<TData> {
  /**
   * Triggers the deletion of all currently selected rows.
   * Internally resolves selected row IDs from the table state and calls the `onDelete` handler defined in `createDeleteAction` config.
   * Pass this directly to the `onClick` of your custom button.
   *
   * @example
   * renderToolbar: ({ onDelete }) => (
   *   <button onClick={onDelete}>Delete selected</button>
   * )
   */
  onDelete: () => void;
}

interface DeleteRowRenderContext<TData extends MRT_RowData>
  extends RowRenderContext<TData> {
  /**
   * Triggers the deletion of this specific row.
   * Internally resolves the row ID and calls the `onDelete` handler defined in `createDeleteAction` config.
   * Pass this directly to the `onClick` of your custom button.
   *
   * @example
   * renderRow: ({ onDelete }) => (
   *   <button onClick={onDelete}>Delete row</button>
   * )
   */
  onDelete: () => void;
}
export interface DeleteActionConfig<TData extends MRT_RowData> {
  onDelete?: (context: {
    /** List of row IDs that are about to be deleted. Computed by DeleteRows from either the single row action or all currently selected rows. */
    rowsToDelete: MRT_RowId[];
    /** The table instance — use it to trigger a data refetch or access table state after deletion. */
    table?: MRT_TableInstance<TData>;
  }) => void;
  renderToolbar?: (context: DeleteToolbarRenderContext<TData>) => ReactNode;
  renderRow?: (context: DeleteRowRenderContext<TData>) => ReactNode;
}
