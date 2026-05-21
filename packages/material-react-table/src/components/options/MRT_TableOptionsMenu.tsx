import Menu, { type MenuProps } from '@mui/material/Menu';
import MenuList from '@mui/material/MenuList';
import { MRT_ResetStateMenuItem } from './MRT_ResetStateMenuItem';
import { type MRT_RowData, type MRT_TableInstance } from '../../types';

interface MRT_TableOptionsMenuProps<TData extends MRT_RowData> {
  anchorEl: HTMLElement | null;
  menuProps?: Partial<Omit<MenuProps, 'anchorEl' | 'open' | 'onClose'>>;
  onClose: () => void;
  open: boolean;
  table: MRT_TableInstance<TData>;
}

export function MRT_TableOptionsMenu<TData extends MRT_RowData>({
  anchorEl,
  menuProps,
  onClose,
  open,
  table,
}: MRT_TableOptionsMenuProps<TData>) {
  const {
    options: { enableResetState = true },
  } = table;
  return (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      disableScrollLock
      onClick={(event) => event.stopPropagation()}
      onClose={onClose}
      open={open}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      {...menuProps}
    >
      <MenuList sx={{ minWidth: '12rem' }}>
        {enableResetState && (
          <MRT_ResetStateMenuItem table={table} onCloseMenu={onClose} />
        )}
      </MenuList>
    </Menu>
  );
}
