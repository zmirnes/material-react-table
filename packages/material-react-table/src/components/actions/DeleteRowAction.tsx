import { useState } from 'react';
import CancelIcon from '@mui/icons-material/Cancel';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import MRT_DeleteRowButton from '../../components/buttons/MRT_DeleteRowButton';
import { type MRT_RowData, type MRT_TableInstance } from '../../types';
import { type DeleteConfirmationConfig } from '../../types/actions/actions.types';

interface DeleteRowActionProps<TData extends MRT_RowData> {
  onDeleteConfirm: () => Promise<void> | void;
  table: MRT_TableInstance<TData>;
  deleteConfirmation?: DeleteConfirmationConfig;
}

const DeleteRowAction = <TData extends MRT_RowData>({
  onDeleteConfirm,
  table,
  deleteConfirmation,
}: DeleteRowActionProps<TData>) => {
  // Toolbar context — no specific row is targeted
  const [open, setOpen] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);

  // Resolve deleteConfirmation — plain object, defaults to empty object.
  const resolvedDeleteConfirmation = deleteConfirmation ?? {};

  const {
    title: titleOverride,
    message: messageOverride,
    confirmButtonText: confirmButtonTextOverride,
    cancelButtonText: cancelButtonTextOverride,
    dialogSx,
    contentContainerSx,
    headerSx,
    titleSx,
    bodySx,
    footerSx,
    closeButtonProps,
    cancelButtonProps,
    confirmButtonProps,
  } = resolvedDeleteConfirmation;

  // Consumer override takes priority over localization fallback.
  const deleteConfirmationTitle =
    titleOverride ?? table.options.localization.deleteConfirmationTitle;
  const deleteConfirmationMessage =
    messageOverride ?? table.options.localization.deleteConfirmationMessage;
  const confirmButtonLabel =
    confirmButtonTextOverride ?? table.options.localization.deleteConfirmYes;
  const cancelButtonLabel =
    cancelButtonTextOverride ?? table.options.localization.deleteConfirmNo;

  const deletingLabel = table.options.localization.deleteConfirmDeleting;

  const handleDeleteRowButtonClick = () => {
    setOpen(true);
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      await onDeleteConfirm();
      setOpen(false);
    } catch (error) {
      console.error('[MRT] Error while deleting row(s):', error);
    } finally {
      setDeleting(false);
    }
  };
  const handleClose = async () => {
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
        sx={dialogSx}
      >
        <Stack
          flexDirection="column"
          height="min-content"
          sx={contentContainerSx}
        >
          <Stack
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ width: '100%', ...headerSx }}
          >
            <DialogTitle
              sx={{
                p: '0.7rem',
                ...titleSx,
              }}
            >
              {deleteConfirmationTitle}
            </DialogTitle>
            <DialogActions
              sx={{
                p: '0.7rem',
              }}
            >
              <IconButton
                color="error"
                aria-label="close"
                onClick={handleClose}
                {...closeButtonProps}
              >
                <CancelIcon />
              </IconButton>
            </DialogActions>
          </Stack>
          <Stack>
            <DialogContent
              sx={{
                pr: '6rem',
                ...bodySx,
              }}
            >
              {deleteConfirmationMessage}
            </DialogContent>
            <DialogActions sx={footerSx}>
              <Button
                onClick={() => setOpen(false)}
                disabled={deleting}
                autoFocus
                variant="soft"
                {...cancelButtonProps}
              >
                {cancelButtonLabel}
              </Button>
              <Button
                onClick={handleConfirmDelete}
                disabled={deleting}
                variant="contained"
                color="error"
                {...confirmButtonProps}
              >
                {deleting ? deletingLabel : confirmButtonLabel}
              </Button>
            </DialogActions>
          </Stack>
        </Stack>
      </Dialog>
      <MRT_DeleteRowButton onClick={handleDeleteRowButtonClick} />
    </>
  );
};

export default DeleteRowAction;
