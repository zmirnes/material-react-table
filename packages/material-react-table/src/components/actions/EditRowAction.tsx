import EditNoteIcon from '@mui/icons-material/EditNote';
import IconButton from '@mui/material/IconButton';
import { type MRT_RowData, type MRT_TableInstance } from '../../types';

interface EditRowActionProps<TData extends MRT_RowData> {
  onEditConfirm?: () => void;
  table?: MRT_TableInstance<TData>;
}
const EditRowAction = <TData extends MRT_RowData>({
  onEditConfirm,
}: EditRowActionProps<TData>) => {
  return (
    <IconButton
      sx={{ p: 0 }}
      disableRipple
      color="primary"
      onClick={onEditConfirm}
    >
      <EditNoteIcon />
    </IconButton>
  );
};
export default EditRowAction;
