import { useRef, useState } from 'react';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { useMRT_SliceValue } from '../../hooks/useMRT_SliceValue';
import {
  type MRT_RowData,
  type MRT_SavedFilter,
  type MRT_TableInstance,
} from '../../types';

export interface MRT_SavedFiltersButtonProps<TData extends MRT_RowData> {
  table: MRT_TableInstance<TData>;
  // When provided, the selection loads the preset into the draft (used inside the drawer).
  // When omitted, the selection applies the preset directly to the table state (toolbar mode).
  onSelectFilter?: (filter: MRT_SavedFilter) => void;
}

export const MRT_SavedFiltersButton = <TData extends MRT_RowData>({
  onSelectFilter,
  table,
}: MRT_SavedFiltersButtonProps<TData>) => {
  const {
    options: { localization, onDeleteSavedFilter, onSaveFilters },
    setFilters,
    setSavedFilters,
  } = table;

  const savedFilters = useMRT_SliceValue(table._uiStore, (s) => s.savedFilters);
  const savedFiltersList = Object.values(savedFilters);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Hide the button entirely when there are no saved filters and no way to create them.
  if (savedFiltersList.length === 0 && !onSaveFilters) {
    return null;
  }

  const handleSelectFilter = (filter: MRT_SavedFilter) => {
    if (onSelectFilter) {
      // Drawer mode: load into draft so the user can review before applying
      onSelectFilter(filter);
    } else {
      // Toolbar mode: apply directly to the table state
      setFilters((current) => ({
        ...current,
        logicOperator: filter.logicOperator,
        rules: filter.rules,
      }));
    }
    setMenuOpen(false);
  };

  const handleDeleteFilter = async (filterName: string) => {
    if (onDeleteSavedFilter) {
      await onDeleteSavedFilter(filterName);
    }
    // Optimistically remove from local state regardless of server response.
    setSavedFilters((prev) => {
      const updated = { ...prev };
      delete updated[filterName];
      return updated;
    });
  };

  return (
    <>
      <Button
        onClick={() => setMenuOpen(true)}
        ref={buttonRef}
        size="small"
        startIcon={<BookmarkIcon />}
        variant="text"
      >
        {localization.savedFilters}
      </Button>

      <Menu
        anchorEl={buttonRef.current}
        onClose={() => setMenuOpen(false)}
        open={menuOpen}
      >
        {savedFiltersList.length === 0 && (
          <MenuItem disabled>
            <Typography color="text.secondary" variant="body2">
              {localization.noSavedFilters}
            </Typography>
          </MenuItem>
        )}

        {savedFiltersList.map((savedFilter) => (
          <MenuItem
            key={savedFilter.name}
            sx={{
              alignItems: 'center',
              display: 'flex',
              justifyContent: 'space-between',
              gap: 1,
              minWidth: 180,
            }}
          >
            {/* Filter name — clicking applies the preset */}
            <ListItemText
              onClick={() => handleSelectFilter(savedFilter)}
              primary={savedFilter.name}
              sx={{ cursor: 'pointer', flexGrow: 1 }}
              data-testid="saved-filter-item"
            />

            {/* Delete icon — only shown when consumer provided an onDeleteSavedFilter handler */}
            {onDeleteSavedFilter && (
              <>
                <Divider flexItem orientation="vertical" />
                <DeleteForeverIcon
                  color="error"
                  fontSize="small"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleDeleteFilter(savedFilter.name);
                  }}
                  sx={{ cursor: 'pointer', flexShrink: 0 }}
                />
              </>
            )}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
