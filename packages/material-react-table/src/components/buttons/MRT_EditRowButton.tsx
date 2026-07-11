import React from 'react';
import EditNoteIcon from '@mui/icons-material/EditNote';
import IconButton from '@mui/material/IconButton';
interface MRT_EditRowButtonProps {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}
const MRT_EditRowButton = ({ onClick }: MRT_EditRowButtonProps) => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Prevent bubbling to muiTableBodyRowProps onClick (row click handlers)
    event.stopPropagation();
    onClick?.(event);
  };

  return (
    <IconButton
      sx={{ p: 0 }}
      disableRipple
      color="primary"
      onClick={handleClick}
    >
      <EditNoteIcon />
    </IconButton>
  );
};
export default MRT_EditRowButton;
