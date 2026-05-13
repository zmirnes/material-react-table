import { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import MRT_DeleteRowButton from '../../components/buttons/MRT_DeleteRowButton';
import { type MRT_RowData, type MRT_TableInstance } from '../../types';

interface DeleteRowActionConfig {
  deleteConfirmationMessage?: string;
  confirmDeleteButtonText?: string;
  cancelDeleteButtonText?: string;
}
interface DeleteRowActionProps<TData extends MRT_RowData> {
  onDeleteConfirm: () => void;
  table: MRT_TableInstance<TData>;
  rowConfig?: DeleteRowActionConfig;
}

const DeleteRowAction = <TData extends MRT_RowData>({
  onDeleteConfirm,
  table,
  rowConfig,
}: DeleteRowActionProps<TData>) => {
  // Toolbar context — no specific row is targeted
  const [open, setOpen] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);

  const deleteConfirmationMessage =
    rowConfig?.deleteConfirmationMessage ||
    table.options.localization.deleteConfirmation;

  const confirmButtonLabel =
    rowConfig?.confirmDeleteButtonText ||
    table.options.localization.deleteConfirmYes;

  const cancelButtonLabel =
    rowConfig?.cancelDeleteButtonText ||
    table.options.localization.deleteConfirmNo;

  const deletingLabel = table.options.localization.deleteConfirmDeleting;

  const handleDeleteRowButtonClick = () => {
    setOpen(true);
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    onDeleteConfirm();
    setDeleting(false);
    setOpen(false);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        keepMounted
        aria-describedby="alert-dialog-slide-description"
        role="alertdialog"
      >
        <DialogTitle>{deleteConfirmationMessage}</DialogTitle>
        <DialogActions>
          <Button
            onClick={() => setOpen(false)}
            disabled={deleting}
            autoFocus
            variant="contained"
            color="error"
          >
            {cancelButtonLabel}
          </Button>
          <Button
            onClick={handleConfirmDelete}
            disabled={deleting}
            variant="contained"
          >
            {deleting ? deletingLabel : confirmButtonLabel}
          </Button>
        </DialogActions>
      </Dialog>
      <MRT_DeleteRowButton onClick={handleDeleteRowButtonClick} />
    </>
  );
};

export default DeleteRowAction;
