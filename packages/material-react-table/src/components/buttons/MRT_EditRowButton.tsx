import EditNoteIcon from '@mui/icons-material/EditNote';
import IconButton from '@mui/material/IconButton';

interface MRT_EditRowButtonProps {
  onClick: () => void;
}
const MRT_EditRowButton = ({ onClick }: MRT_EditRowButtonProps) => {
  return (
    <IconButton sx={{ p: 0 }} disableRipple color="primary" onClick={onClick}>
      <EditNoteIcon />
    </IconButton>
  );
};
export default MRT_EditRowButton;
