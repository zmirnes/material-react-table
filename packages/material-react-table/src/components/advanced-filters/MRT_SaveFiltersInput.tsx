import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { type KeyboardEvent, useState } from 'react';
import {
  type MRT_FiltersState,
  type MRT_RowData,
  type MRT_SavedFilter,
  type MRT_TableInstance,
} from '../../types';

export interface MRT_SaveFiltersInputProps<TData extends MRT_RowData> {
  // Disables the trigger button when there are no active filter rules to save.
  disabled?: boolean;
  // The current draft filter state to persist when the user confirms the save.
  draftFilters: MRT_FiltersState;
  table: MRT_TableInstance<TData>;
}

export const MRT_SaveFiltersInput = <TData extends MRT_RowData>({
  disabled,
  draftFilters,
  table,
}: MRT_SaveFiltersInputProps<TData>) => {
  const {
    options: { localization, onSaveFilters },
    setSavedFilters,
  } = table;

  const [isSavingVisible, setIsSavingVisible] = useState(false);
  const [isRequestInProgress, setIsRequestInProgress] = useState(false);
  const [filterName, setFilterName] = useState('');

  // The button is only rendered when the consumer wired up an onSaveFilters handler.
  if (!onSaveFilters) {
    return null;
  }

  const buildSavedFilter = (): MRT_SavedFilter => ({
    logicOperator: draftFilters.logicOperator,
    name: filterName,
    rules: draftFilters.rules,
  });

  const handleSave = async () => {
    const trimmedName = filterName.trim();

    if (!trimmedName) {
      return;
    }

    const savedFilter = buildSavedFilter();

    try {
      setIsRequestInProgress(true);
      await onSaveFilters(savedFilter);
      // Only update local state and close input on success.
      setSavedFilters((prev) => ({ ...prev, [trimmedName]: savedFilter }));
      setFilterName('');
      setIsSavingVisible(false);
    } finally {
      // Always clear the loading flag — on failure the input remains open
      // so the user can correct the name or retry.
      setIsRequestInProgress(false);
    }
  };

  const handleKeyUp = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter') {
      handleSave();
    }
    if (event.key === 'Escape') {
      setIsSavingVisible(false);
    }
  };

  const handleClickAway = () => {
    // Prevent accidental closure while the request is still in flight.
    if (isRequestInProgress) {
      return;
    }
    setIsSavingVisible(false);
  };

  if (!isSavingVisible) {
    return (
      <Button
        disabled={disabled}
        onClick={() => setIsSavingVisible(true)}
        size="medium"
        startIcon={<BookmarkAddIcon />}
        variant="outlined"
      >
        {localization.saveFilters}
      </Button>
    );
  }

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box>
        <FormControl
          disabled={isRequestInProgress}
          sx={{ display: 'flex', flexDirection: 'row' }}
        >
          <TextField
            autoFocus
            disabled={isRequestInProgress}
            onChange={(event) => setFilterName(event.target.value)}
            onKeyUp={handleKeyUp}
            placeholder={localization.filterName}
            size="small"
            slotProps={{
              input: {
                endAdornment: (
                  <Stack alignItems="center" direction="row">
                    {isRequestInProgress ? (
                      <CircularProgress size={16} variant="indeterminate" />
                    ) : (
                      <IconButton
                        disabled={!filterName.trim()}
                        disableFocusRipple
                        disableRipple
                        onClick={handleSave}
                        size="small"
                      >
                        <CheckIcon fontSize="small" />
                      </IconButton>
                    )}
                    <IconButton
                      disabled={isRequestInProgress}
                      disableFocusRipple
                      disableRipple
                      onClick={() => setIsSavingVisible(false)}
                      size="small"
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                ),
              },
            }}
            value={filterName}
            variant="standard"
          />
        </FormControl>
      </Box>
    </ClickAwayListener>
  );
};
