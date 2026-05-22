import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import IconButton from '@mui/material/IconButton';
import { type SxProps } from '@mui/material/styles';

interface MRT_DeleteRowButtonProps {
  onClick: () => void;
}
export default function MRT_DeleteRowButton({
  onClick,
}: MRT_DeleteRowButtonProps) {
  const iconButtonStyle: SxProps = {
    p: 0,
  };
  return (
    <IconButton
      disableRipple
      color="error"
      sx={iconButtonStyle}
      onClick={onClick}
    >
      <DeleteOutlineIcon />
    </IconButton>
  );
}
