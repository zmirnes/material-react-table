import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu, { type MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { getDensityOptions } from '../../config/densityOptions.config';
import {
  type MRT_DensityState,
  type MRT_RowData,
  type MRT_TableInstance,
} from '../../types';

export interface MRT_ToggleDensePaddingMenuProps<TData extends MRT_RowData>
  extends Partial<MenuProps> {
  anchorEl: HTMLElement | null;
  setAnchorEl: (anchorEl: HTMLElement | null) => void;
  table: MRT_TableInstance<TData>;
}

export const MRT_ToggleDensePaddingMenu = <TData extends MRT_RowData>({
  anchorEl,
  setAnchorEl,
  table,
  ...rest
}: MRT_ToggleDensePaddingMenuProps<TData>) => {
  const {
    getState,
    options: {
      icons,
      localization,
      mrtTheme: { densityIconSx },
    },
    setDensity,
  } = table;
  const { density } = getState();

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleSelectDensity = (nextDensity: MRT_DensityState) => {
    setDensity(nextDensity);
    handleCloseMenu();
  };

  const densityOptions = getDensityOptions({ icons, localization });

  return (
    <Menu
      id="mrt-density-menu"
      anchorEl={anchorEl}
      open={!!anchorEl}
      onClose={handleCloseMenu}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      {...rest}
    >
      {densityOptions.map(({ Icon, label, value }) => (
        <MenuItem
          key={value}
          onClick={() => handleSelectDensity(value)}
          selected={density === value}
          sx={{
            borderRadius: '4px',
            gap: 1,
            '&.Mui-selected': {
              backgroundColor: 'action.selected',
            },
            '&.Mui-selected:hover': {
              backgroundColor: 'action.hover',
            },
          }}
        >
          <ListItemIcon sx={{ color: 'text.primary', minWidth: '24px' }}>
            <Icon sx={densityIconSx[value]} />
          </ListItemIcon>
          <ListItemText
            primary={label}
            slotProps={{
              primary: {
                fontSize: '0.875rem',
                fontWeight: 500,
              },
            }}
          />
        </MenuItem>
      ))}
    </Menu>
  );
};
