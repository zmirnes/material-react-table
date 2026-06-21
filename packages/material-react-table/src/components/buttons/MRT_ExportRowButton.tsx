import React from 'react';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import IconButton from '@mui/material/IconButton';

interface MRT_ExportRowButtonProps {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const MRT_ExportRowButton = ({ onClick }: MRT_ExportRowButtonProps) => {
  return (
    <IconButton sx={{ p: 0 }} disableRipple onClick={onClick}>
      <FileDownloadIcon fontSize="small" />
    </IconButton>
  );
};

export default MRT_ExportRowButton;
