import { IconButton } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { SxProps } from '@mui/material/styles';

interface MRT_DeleteButtonProps {
  onClick: () => void;
}
export default function MRT_DeleteButton({ onClick }: MRT_DeleteButtonProps) {
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
