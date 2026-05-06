import { ReactNode } from 'react';
import { MRT_Row, MRT_RowData, MRT_TableInstance } from '../types';

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
  onDelete: () => void;
  defaultHandler: () => void;
}

interface DeleteRowRenderContext<TData extends MRT_RowData>
  extends RowRenderContext<TData> {
  onDelete: () => void;
  defaultHandler: () => void;
}
export interface DeleteActionConfig<TData extends MRT_RowData> {
  // onDelete receives row and table when triggered from a row action, undefined when from toolbar
  onDelete?: (context: {
    defaultHandler: () => void;
    row?: MRT_Row<TData>;
    table?: MRT_TableInstance<TData>;
  }) => void;
  renderToolbar?: (context: DeleteToolbarRenderContext<TData>) => ReactNode;
  renderRow?: (context: DeleteRowRenderContext<TData>) => ReactNode;
}
