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
 * `isAllPagesActive` je reaktivno deriviran usporedbom posljednjeg skupa
 * fetchovanih selectable ID-eva sa trenutnim `rowSelection` state-om —
 * bez mutable flag refa — tako da UI ostaje sinhronizovan sa svakom
 * vanjskom promjenom selekcije.
 */
export const MRT_SelectAllMenu = <TData extends MRT_RowData>({
  table,
}: MRT_SelectAllMenuProps<TData>) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [isSelectingAllPages, setIsSelectingAllPages] = useState(false);

  /**
   * Čuva posljednji fetchovani skup svih selectable row ID-eva (server-side).
   * Koristi se za reaktivnu derivaciju `isAllPagesActive` usporedbom sa
   * `rowSelection`. Briše se kad korisnik deselektuje sve stranice.
   */
  const allSelectableRowIdsRef = useRef<string[]>([]);

  const {
    getState,
    options: { getAllSelectableRowIds, localization },
    refs: { allPagesSelectedActiveRef },
  } = table;

  // rowSelection se čita ovdje da bi svaka promjena selekcije triggerovala
  // re-render i isAllPagesActive ostao sinhronizovan bez oslanjanja na ref flag.
  const { isLoading, rowSelection } = getState();

  const isAllCurrentPageSelected = table.getIsAllPageRowsSelected();

  /**
   * Reaktivna derivacija "jesu li sve stranice selektovane?":
   * - Server-side: svi ID-evi vraćeni od getAllSelectableRowIds moraju biti
   *   prisutni kao `true` u rowSelection, i mora postojati barem jedan ID.
   * - Client-side: koristi TanStack Table-ov ugrađeni getIsAllRowsSelected.
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
  // Client-side: koristi table.toggleAllRowsSelected() — bez requesta.
  // Server-side: koristi getAllSelectableRowIds async prop za fetch ID-eva.

  const handleSelectAllPages = async () => {
    handleClose();

    if (getAllSelectableRowIds) {
      // Server-side: ID-evi nisu dostupni lokalno, fetchujemo ih
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
      // Client-side: svi podaci su već učitani
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

        {/* All-pages toggle: client koristi toggleAllRowsSelected,
            server koristi getAllSelectableRowIds async prop */}
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
