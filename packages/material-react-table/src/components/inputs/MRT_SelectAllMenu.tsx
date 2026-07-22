import { type MouseEvent, useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import { type MRT_RowData, type MRT_TableInstance } from '../../types';
import { getIsAllPagesSelectionActive } from '../../utils/row.utils';
import { getCommonTooltipProps } from '../../utils/style.utils';

export interface MRT_SelectAllMenuProps<TData extends MRT_RowData> {
  table: MRT_TableInstance<TData>;
}

export const MRT_SelectAllMenu = <TData extends MRT_RowData>({
  table,
}: MRT_SelectAllMenuProps<TData>) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [isSelectingAllPages, setIsSelectingAllPages] = useState(false);

  const {
    getState,
    options: {
      enableRowPinning,
      getAllSelectableRowIds,
      localization,
      rowPinningDisplayMode,
    },
    refs: { allSelectableRowIdsRef },
  } = table;

  // rowSelection is read here so that any change to selection will trigger a re-render and update the menu options accordingly
  const { isLoading, rowSelection } = getState();

  const isAllCurrentPageSelected = table.getIsAllPageRowsSelected();
  const isAllPagesActive = getIsAllPagesSelectionActive(table, rowSelection);

  const handleOpen = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Clears row pinning on every bulk selection/deselection
  const clearPinning = () => {
    if (enableRowPinning && rowPinningDisplayMode?.includes('select')) {
      table.setRowPinning({ bottom: [], top: [] });
    }
  };

  // ── Current-page actions ────────────────────────────────────────────────────

  const handleSelectCurrentPage = () => {
    table.toggleAllPageRowsSelected(true);
    clearPinning();
    handleClose();
  };

  const handleDeselectCurrentPage = () => {
    if (allSelectableRowIdsRef.current.length > 0) {
      // When all pages are selected, deselecting the current page must clear the entire selection — otherwise rows on other pages remain "ghost-selected" but the user can't see them.
      table.setRowSelection({});
      allSelectableRowIdsRef.current = [];
    } else {
      table.toggleAllPageRowsSelected(false);
    }
    clearPinning();
    handleClose();
  };

  // ── All-pages actions ───────────────────────────────────────────────────────

  const handleSelectAllPages = async () => {
    handleClose();

    if (getAllSelectableRowIds) {
      // Server-side: IDs are not available locally, fetch them from the API
      setIsSelectingAllPages(true);
      table.setShowProgressBars(true);
      try {
        const ids = await getAllSelectableRowIds({ table });
        allSelectableRowIdsRef.current = ids;

        const newSelection: Record<string, true> = {};
        ids.forEach((id) => {
          newSelection[id] = true;
        });
        table.setRowSelection(newSelection);
        clearPinning();
      } finally {
        setIsSelectingAllPages(false);
        table.setShowProgressBars(false);
      }
    } else {
      // Client-side: all data is available locally
      table.toggleAllRowsSelected(true);
      clearPinning();
    }
  };

  const handleDeselectAllPages = () => {
    if (getAllSelectableRowIds) {
      table.setRowSelection({});
    } else {
      table.toggleAllRowsSelected(false);
    }
    allSelectableRowIdsRef.current = [];
    clearPinning();
    handleClose();
  };

  const isDisabled = isLoading || isSelectingAllPages;

  return (
    <>
      <Tooltip
        {...getCommonTooltipProps()}
        title={localization.toggleSelectAll}
      >
        <span>
          <IconButton
            aria-label={localization.toggleSelectAll}
            disabled={isDisabled}
            onClick={handleOpen}
            size="small"
            sx={{ height: '1.5rem', width: '1.5rem' }}
          >
            <table.options.icons.MoreVertIcon
              style={{ transform: 'scale(0.85)' }}
            />
          </IconButton>
        </span>
      </Tooltip>

      <Menu anchorEl={anchorEl} onClose={handleClose} open={Boolean(anchorEl)}>
        {/* Current-page toggle */}
        {isAllCurrentPageSelected ? (
          <MenuItem onClick={handleDeselectCurrentPage}>
            {localization.deselectAllOnCurrentPage}
          </MenuItem>
        ) : (
          <MenuItem onClick={handleSelectCurrentPage}>
            {localization.selectAllOnCurrentPage}
          </MenuItem>
        )}

        {/* All-pages toggle */}
        {isAllPagesActive ? (
          <MenuItem onClick={handleDeselectAllPages}>
            {localization.deselectAllOnAllPages}
          </MenuItem>
        ) : (
          <MenuItem
            disabled={isSelectingAllPages}
            onClick={handleSelectAllPages}
          >
            {isSelectingAllPages && (
              <CircularProgress aria-label="Loading" size={14} sx={{ mr: 1 }} />
            )}
            {localization.selectAllOnAllPages}
          </MenuItem>
        )}
      </Menu>
    </>
  );
};
