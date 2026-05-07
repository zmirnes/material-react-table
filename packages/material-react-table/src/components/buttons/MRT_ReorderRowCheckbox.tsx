import { Checkbox } from '@mui/material';
import { type Theme } from '@mui/material/styles';

interface MRT_ReorderRowCheckboxProps {
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isSelected: boolean;
}

export const MRT_ReorderRowCheckbox = ({
  onChange,
  isSelected,
}: MRT_ReorderRowCheckboxProps) => {
  return (
    <Checkbox
      checked={isSelected}
      color="warning"
      disableRipple
      onChange={onChange}
      sx={{
        color: (theme: Theme) => theme.palette.warning.main,
        '&.Mui-checked': {
          color: (theme: Theme) => theme.palette.warning.main,
        },
      }}
    />
  );
};
