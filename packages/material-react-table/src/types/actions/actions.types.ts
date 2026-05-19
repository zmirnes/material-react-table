import { type ReactNode } from 'react';
import { type ButtonProps } from '@mui/material/Button';
import { type IconButtonProps } from '@mui/material/IconButton';
import { type SxProps, type Theme } from '@mui/material/styles';
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
export interface DeleteConfirmationConfig {
  title?: string;
  message?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  dialogSx?: SxProps<Theme>;
  contentContainerSx?: SxProps<Theme>;
  headerSx?: SxProps<Theme>;
  titleSx?: SxProps<Theme>;
  bodySx?: SxProps<Theme>;
  footerSx?: SxProps<Theme>;
  closeButtonProps?: IconButtonProps;
  cancelButtonProps?: Omit<ButtonProps, 'onClick'>;
  confirmButtonProps?: Omit<ButtonProps, 'onClick'>;
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
  deleteConfirmation?: DeleteConfirmationConfig;
}

export interface OnEditActionContext<TData extends MRT_RowData> {
  rowToEdit: MRT_Row<TData>;
  table: MRT_TableInstance<TData>;
}
type EditActionExecutor = () => void | Promise<void>;
interface EditActionRowRenderContext<TData extends MRT_RowData>
  extends ActionRowRenderContext<TData> {
  onEdit: EditActionExecutor;
}
export interface CustomOnEditActionContext<TData extends MRT_RowData>
  extends OnEditActionContext<TData> {
  // Allows custom edit logic to call the built-in default edit behavior.
  defaultOnEdit: EditActionExecutor;
}
export interface CreateEditActionOptions<TData extends MRT_RowData>
  extends Partial<Omit<Action<TData>, 'renderRow'>> {
  // Custom edit behavior with access to default behavior via defaultOnDelete.
  onEdit?: (
    context: CustomOnEditActionContext<TData>,
  ) => void | Promise<void>;
  renderRow?: (context: EditActionRowRenderContext<TData>) => ReactNode;
}
