import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { type MRT_RowData, type MRT_TableInstance } from '../../types';
import { MRT_AdvancedFiltersRuleRow } from './MRT_AdvancedFiltersRuleRow';
import { useMRT_AdvancedFiltersDraft } from './useMRT_AdvancedFiltersDraft';
import { getDefaultFiltersState } from './utils';

export interface MRT_AdvancedFiltersProps<TData extends MRT_RowData> {
  table: MRT_TableInstance<TData>;
}

/**
 * Inner component that owns the draft state hook.
 * Extracted so that hooks are never called conditionally in the parent guard.
 */
const MRT_AdvancedFiltersContent = <TData extends MRT_RowData>({
  table,
}: MRT_AdvancedFiltersProps<TData>) => {
  const {
    getState,
    options: {
      icons: { CloseIcon },
      localization,
    },
    setFilters,
    setShowAdvancedFilters,
  } = table;
  const { showAdvancedFilters } = getState();
  const {
    addRule,
    clearRules,
    draftFilters,
    filterableColumns,
    hasInvalidRules,
    hasUnappliedChanges,
    removeRule,
    updateLogicOperator,
    updateRule,
  } = useMRT_AdvancedFiltersDraft(table);

  const handleClose = () => {
    setShowAdvancedFilters(false);
  };

  const handleClearFilters = () => {
    clearRules();
    setFilters(getDefaultFiltersState());
    handleClose();
  };

  const handleApplyFilters = () => {
    if (hasInvalidRules) {
      return;
    }

    setFilters(draftFilters);
    handleClose();
  };

  return (
    <Drawer
      PaperProps={{
        sx: {
          maxWidth: '100%',
          minWidth: { xs: '100%', md: '50%' },
          px: 0.5,
        },
      }}
      anchor="right"
      onClose={handleClose}
      open={showAdvancedFilters}
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
    >
      <Box
        display="flex"
        flexDirection="column"
        sx={{ height: '100%', p: 1.25, width: '100%' }}
      >
        <Box
          alignItems="center"
          display="flex"
          justifyContent="space-between"
          sx={{ gap: 1, mb: 1.25 }}
        >
          <Typography variant="subtitle1">
            {localization.advancedFilters}
          </Typography>
          <IconButton
            aria-label={localization.advancedFilters}
            color={hasUnappliedChanges ? 'warning' : 'default'}
            onClick={handleClose}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <Stack
          spacing={1}
          sx={{
            flex: 1,
            overflowY: 'auto',
            py: 1,
          }}
        >
          {draftFilters.rules.map((rule, index) => (
            <MRT_AdvancedFiltersRuleRow
              filterableColumns={filterableColumns}
              isFirst={index === 0}
              key={rule.id}
              logicOperator={draftFilters.logicOperator}
              onRemove={removeRule}
              onUpdate={(nextRule) => updateRule(rule.id, nextRule)}
              onUpdateLogicOperator={updateLogicOperator}
              rule={rule}
              table={table}
            />
          ))}
          {draftFilters.rules.length === 0 && (
            <Box
              alignItems="center"
              display="flex"
              justifyContent="center"
              sx={{
                border: (theme) => `1px dashed ${theme.palette.divider}`,
                borderRadius: 2,
                flex: 1,
                minHeight: 140,
                px: 1.5,
              }}
            >
              <Typography color="text.secondary" variant="body2">
                {localization.noRecordsToDisplay}
              </Typography>
            </Box>
          )}
        </Stack>
        <Box display="flex" flexDirection="row" gap={1} marginTop="1rem">
          <Button
            color="warning"
            onClick={handleClearFilters}
            size="medium"
            sx={{ mr: 'auto' }}
            variant="contained"
          >
            {localization.clear}
          </Button>
          <Button
            disabled={filterableColumns.length === 0 || hasInvalidRules}
            onClick={addRule}
            size="medium"
            variant="contained"
          >
            {localization.add}
          </Button>
          <Button
            color="primary"
            disabled={hasInvalidRules}
            onClick={handleApplyFilters}
            size="medium"
            variant="contained"
          >
            {localization.apply}
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export const MRT_AdvancedFilters = <TData extends MRT_RowData>({
  table,
}: MRT_AdvancedFiltersProps<TData>) => {
  if (!table.options.manualFiltering) {
    return null;
  }

  return <MRT_AdvancedFiltersContent table={table} />;
};
