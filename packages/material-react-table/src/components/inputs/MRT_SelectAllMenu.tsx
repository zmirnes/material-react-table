import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import { type MouseEvent, useRef, useState } from 'react';
import { type MRT_RowData, type MRT_TableInstance } from '../../types';
import { getCommonTooltipProps } from '../../utils/style.utils';

export interface MRT_SelectAllMenuProps<TData extends MRT_RowData> {
  table: MRT_TableInstance<TData>;
}

/**
 * Header cell menu for the row-selection column.
 *
 * `isAllPagesActive` is derived reactively by comparing the last fetched set
 * of selectable IDs against the current `rowSelection` state — without a
 * mutable flag ref — so the UI stays in sync with any external selection change.
 */
export const MRT_SelectAllMenu = <TData extends MRT_RowData>({
  table,
}: MRT_SelectAllMenuProps<TData>) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [isSelectingAllPages, setIsSelectingAllPages] = useState(false);

  /**
   * Stores the last fetched set of all selectable row IDs (server-side only).
   * Used to derive `isAllPagesActive` reactively by comparing against
   * `rowSelection`. Cleared when the user deselects all pages.
   */
  const allSelectableRowIdsRef = useRef<string[]>([]);

  const {
    getState,
    options: { getAllSelectableRowIds, localization },
    refs: { allPagesSelectedActiveRef },
  } = table;

  // rowSelection is read here so that any selection change triggers a re-render
  // and isAllPagesActive stays in sync without relying on a mutable ref flag.
  const { isLoading, rowSelection } = getState();

  const isAllCurrentPageSelected = table.getIsAllPageRowsSelected();

  /**
   * Reactive derivation of "are all pages selected?":
   * - Server-side: every ID returned by getAllSelectableRowIds must be present
   *   as `true` in rowSelection, and at least one ID must exist.
   * - Client-side: delegates to TanStack Table's built-in getIsAllRowsSelected.
   */
  const isAllPagesActive = getAllSelectableRowIds
    ? allSelectableRowIdsRef.current.length > 0 &&
      allSelectableRowIdsRef.current.every((id) => rowSelection[id] === true)
    : table.getIsAllRowsSelected();

  const handleOpen = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // ── Current-page actions ────────────────────────────────────────────────────

  const handleSelectCurrentPage = () => {
    table.toggleAllPageRowsSelected(true);
    handleClose();
  };

  const handleDeselectCurrentPage = () => {
    table.toggleAllPageRowsSelected(false);
    allSelectableRowIdsRef.current = [];
    allPagesSelectedActiveRef.current = false;
    handleClose();
  };

  // ── All-pages actions ───────────────────────────────────────────────────────
  // Client-side: uses table.toggleAllRowsSelected() — no network request needed.
  // Server-side: uses the getAllSelectableRowIds async prop to fetch IDs from the API.

  const handleSelectAllPages = async () => {
    handleClose();

    if (getAllSelectableRowIds) {
      // Server-side: IDs are not available locally, fetch them from the API
      setIsSelectingAllPages(true);
      table.setShowProgressBars(true);
      try {
        const ids = await getAllSelectableRowIds({ table });
        allSelectableRowIdsRef.current = ids;
        allPagesSelectedActiveRef.current = true;

        const newSelection: Record<string, boolean> = {};
        ids.forEach((id) => {
          newSelection[id] = true;
        });
        table.setRowSelection(newSelection);
      } finally {
        setIsSelectingAllPages(false);
        table.setShowProgressBars(false);
      }
    } else {
      // Client-side: all row data is already loaded locally
      table.toggleAllRowsSelected(true);
      allPagesSelectedActiveRef.current = true;
    }
  };

  const handleDeselectAllPages = () => {
    if (getAllSelectableRowIds) {
      table.setRowSelection({});
    } else {
      table.toggleAllRowsSelected(false);
    }
    allSelectableRowIdsRef.current = [];
    allPagesSelectedActiveRef.current = false;
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

        {/* All-pages toggle: client uses toggleAllRowsSelected,
            server uses the getAllSelectableRowIds async prop */}
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
