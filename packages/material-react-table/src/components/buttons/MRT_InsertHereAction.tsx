import { type MouseEvent } from 'react';
import SubdirectoryArrowLeftIcon from '@mui/icons-material/SubdirectoryArrowLeft';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

const INSERT_HERE_TOOLTIP = 'Insert here';
const ACTION_ICON_SIZE = 'small';

interface MRT_InsertHereActionProps {
  onClick: () => void;
}

export const MRT_InsertHereAction = ({
  onClick,
}: MRT_InsertHereActionProps) => {
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onClick();
  };

  return (
    <Tooltip title={INSERT_HERE_TOOLTIP} disableInteractive>
      <IconButton onClick={handleClick} size={ACTION_ICON_SIZE}>
        <SubdirectoryArrowLeftIcon color="warning" />
      </IconButton>
    </Tooltip>
  );
};
