import VerticalAlignTopIcon from '@mui/icons-material/VerticalAlignTop';
import { IconButton } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';

const MOVE_TO_TOP_TOOLTIP = 'Move to top level';
const ACTION_ICON_SIZE = 'small';
const ACTION_BUTTON_HEIGHT = '1.75rem';

interface MRT_MoveToTopActionProps {
  onClick: () => void;
}

export const MRT_MoveToTopAction = ({ onClick }: MRT_MoveToTopActionProps) => {
  return (
    <Tooltip title={MOVE_TO_TOP_TOOLTIP} disableInteractive>
      <IconButton
        onClick={onClick}
        size={ACTION_ICON_SIZE}
        sx={{ height: ACTION_BUTTON_HEIGHT }}
      >
        <VerticalAlignTopIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
};
