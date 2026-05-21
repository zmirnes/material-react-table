import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import { type MRT_RowData, type MRT_TableInstance } from '../../types';

interface MRT_ResetStateMenuItemProps<TData extends MRT_RowData> {
  table: MRT_TableInstance<TData>;
  onCloseMenu: () => void;
}

export function MRT_ResetStateMenuItem<TData extends MRT_RowData>({
  table,
  onCloseMenu,
}: MRT_ResetStateMenuItemProps<TData>) {
  const {
    options: {
      icons: { RestartAltIcon },
      localization,
      resetState,
    },
  } = table;

  const defaultResetState = () => {
    table.resetSorting(true);
    table.resetColumnFilters(true);
    table.resetGlobalFilter(true);
    table.resetPagination(true);
    table.resetColumnOrder(true);
    table.resetGrouping(true);
    table.resetExpanded(true);
    table.resetRowSelection(true);
    table.resetColumnVisibility(true);
    table.resetColumnPinning(true);
  };

  const handleResetState = async () => {
    if (resetState) {
      resetState(table);
    } else {
      defaultResetState();
    }
    onCloseMenu();
  };

  const resetStateLabel = localization.resetState;

  return (
    <MenuItem onClick={handleResetState} sx={{ justifyContent: 'flex-start' }}>
      <ListItemIcon
        sx={{
          mr: '0.2rem',
        }}
      >
        <RestartAltIcon />
      </ListItemIcon>
      <ListItemText>{resetStateLabel}</ListItemText>
    </MenuItem>
  );
}
