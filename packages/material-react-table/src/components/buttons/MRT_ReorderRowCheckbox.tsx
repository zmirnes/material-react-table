import { type ChangeEvent, type MouseEvent } from 'react';
import Checkbox from '@mui/material/Checkbox';
import { type Theme } from '@mui/material/styles';

interface MRT_ReorderRowCheckboxProps {
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  isSelected: boolean;
}

export const MRT_ReorderRowCheckbox = ({
  onChange,
  isSelected,
}: MRT_ReorderRowCheckboxProps) => {
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
  };

  return (
    <Checkbox
      checked={isSelected}
      color="warning"
      disableRipple
      onChange={onChange}
      onClick={handleClick}
      sx={{
        color: (theme: Theme) => theme.palette.warning.main,
        '&.Mui-checked': {
          color: (theme: Theme) => theme.palette.warning.main,
        },
      }}
    />
  );
};
