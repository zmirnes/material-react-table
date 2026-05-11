import { type Components } from '@mui/material';
import { type Theme } from '@mui/material/styles';
import { menuItem } from '../../css';

// ----------------------------------------------------------------------

export function menu(theme: Theme): Components {
  return {
    MuiMenuItem: {
      styleOverrides: {
        root: {
          ...menuItem(theme),
        },
      },
    },
  };
}
