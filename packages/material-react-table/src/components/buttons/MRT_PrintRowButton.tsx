import React from 'react';
import PrintIcon from '@mui/icons-material/Print';
import IconButton from '@mui/material/IconButton';

interface MRT_PrintRowButtonProps {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const MRT_PrintRowButton = ({ onClick }: MRT_PrintRowButtonProps) => {
  return (
    <IconButton sx={{ p: 0 }} disableRipple onClick={onClick}>
      <PrintIcon fontSize="small" />
    </IconButton>
  );
};

export default MRT_PrintRowButton;
