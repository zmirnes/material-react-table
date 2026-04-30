import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { Tooltip } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import { SxProps } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { useState } from 'react';
import CustomModal from '../../custom-modal/custom-modal';
import { MRT_RowData, MRT_TableInstance } from '../../../types';

interface DeleteRowActionProps<TData extends MRT_RowData> {
  deleteRowAction?: () => void;
  table: MRT_TableInstance<TData>;
}

const DeleteRowAction = <TData extends MRT_RowData>({
  deleteRowAction,
  table,
}: DeleteRowActionProps<TData>) => {
  const { localization, onRefetchData } = table.options;
  const [openDialog, setOpenDialog] = useState<boolean>(false);

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCancelDelete = () => {
    setOpenDialog(false);
  };

  const handleDeleteRow = () => {
    deleteRowAction?.();
    onRefetchData?.();
    setOpenDialog(false);
  };

  const modalContainerStyle: SxProps = {
    minWidth: '400px',
    py: 2,
    gap: 2,
  };

  const iconButtonStyle: SxProps = {
    p: 0,
  };
  return (
    <>
      <CustomModal
        open={openDialog}
        onClose={handleCancelDelete}
        title={localization.deleteRow}
      >
        <Stack sx={modalContainerStyle}>
          {localization.deleteRowConfirmation}
          <Stack direction="row" justifyContent="flex-end" gap={2}>
            <Button variant="contained" onClick={handleCancelDelete}>
              {localization.cancel}
            </Button>
            <Button variant="contained" color="error" onClick={handleDeleteRow}>
              {localization.deleteRow}
            </Button>
          </Stack>
        </Stack>
      </CustomModal>
      <Tooltip title={localization.deleteRow}>
        <IconButton
          disableRipple
          color="error"
          sx={iconButtonStyle}
          onClick={handleOpenDialog}
        >
          <DeleteOutlineIcon />
        </IconButton>
      </Tooltip>
    </>
  );
};

export default DeleteRowAction;
