import { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import MRT_DeleteRowButton from '../../components/buttons/MRT_DeleteRowButton';

interface DeleteRowActionProps {
  onDeleteConfirm: () => void;
}

const DeleteRowAction = ({ onDeleteConfirm }: DeleteRowActionProps) => {
  // Toolbar context — no specific row is targeted
  const [open, setOpen] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);

  const handleDeleteRowButtonClick = () => {
    setOpen(true);
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    setTimeout(() => {
      onDeleteConfirm();
      setDeleting(false);
      setOpen(false);
    }, 3000);
  };

  return (
    <>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <Typography>
          Are you sure you want to delete the selected row(s)?
        </Typography>
        <Button onClick={handleConfirmDelete} disabled={deleting}>
          {deleting ? 'Deleting...' : 'Yes'}
        </Button>
        <Button onClick={() => setOpen(false)} disabled={deleting}>
          No
        </Button>
      </Dialog>
      <MRT_DeleteRowButton onClick={handleDeleteRowButtonClick} />
    </>
  );
};

export default DeleteRowAction;
