import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import type React from 'react';
import {
  type MRT_Column,
  type MRT_FilterRule,
  type MRT_RowData,
  type MRT_TableInstance,
} from '../../types';
import {
  createFilterRule,
  getColumnFilterOperators,
  getFilterColumn,
  getLocalizedFilterOperatorLabel,
} from './utils';

export interface MRT_AdvancedFiltersRuleRowProps<TData extends MRT_RowData> {
  filterableColumns: MRT_Column<TData>[];
  // When true this is the first rule — the AND/OR selector is disabled
  isFirst: boolean;
  // Whether this rule is currently pinned as a quick filter above the table
  isPinned: boolean;
  logicOperator: 'and' | 'or';
  // Called when the user presses Enter inside a value input; undefined when apply is disabled
  onApply: (() => void) | undefined;
  onPin: (ruleId: string) => void;
  onRemove: (ruleId: string) => void;
  onUnpin: (ruleId: string) => void;
  onUpdate: (nextRule: MRT_FilterRule) => void;
  onUpdateLogicOperator: (op: 'and' | 'or') => void;
  rule: MRT_FilterRule;
  table: MRT_TableInstance<TData>;
}

// Renders a single row in the advanced filter builder.
// Each row contains: logic operator | column selector | operator selector | value editor | remove button
export const MRT_AdvancedFiltersRuleRow = <TData extends MRT_RowData>({
  filterableColumns,
  isFirst,
  isPinned,
  logicOperator,
  onApply,
  onPin,
  onRemove,
  onUnpin,
  onUpdate,
  onUpdateLogicOperator,
  rule,
  table,
}: MRT_AdvancedFiltersRuleRowProps<TData>) => {
  const {
    options: {
      icons: { CloseIcon, PushPinIcon },
      localization,
    },
  } = table;

  // Resolve the selected column; fall back to the first filterable column
  const selectedColumn =
    getFilterColumn(table, rule.columnId) ?? filterableColumns[0];

  if (!selectedColumn) {
    return null;
  }

  // Retrieve the operators available for the selected column type
  const availableOperators = getColumnFilterOperators(selectedColumn);
  // Resolve the active operator; fall back to the first in the list
  const selectedOperator =
    availableOperators.find((operator) => operator.id === rule.operator) ??
    availableOperators[0];

  if (!selectedOperator) {
    return null;
  }

  // When the column changes, rebuild the rule from scratch using the new column's default operator
  const handleColumnChange = (columnId: string) => {
    const nextColumn = filterableColumns.find(
      (column) => column.id === columnId,
    );

    if (!nextColumn) {
      return;
    }

    // Create a fresh rule for the new column
    const nextRule = createFilterRule(nextColumn);

    if (!nextRule) {
      return;
    }

    // Preserve the rule's id so React's key prop in the parent list stays stable
    onUpdate({ ...nextRule, id: rule.id });
  };

  // When the operator changes, reset the value to the new operator's initial value
  const handleOperatorChange = (operatorId: string) => {
    const nextOperator = availableOperators.find(({ id }) => id === operatorId);

    if (!nextOperator) {
      return;
    }

    onUpdate({
      ...rule,
      operator: nextOperator.id,
      // Each operator defines its own empty starting value (e.g. '' or [null, null])
      value: nextOperator.getInitialValue(),
    });
  };

  // Render the appropriate input component for the selected operator
  const valueEditor = selectedOperator.editComponent({
    column: selectedColumn as never,
    onChange: (value) => onUpdate({ ...rule, value }),
    rule,
    table,
  });

  return (
    <Box
      sx={{
        backgroundColor: 'transparent',
        borderRadius: 1.5,
        py: 0.75,
      }}
    >
      {/* 6-column grid: logic-op | column | operator | value | pin | remove */}
      <Box
        sx={{
          alignItems: 'center',
          columnGap: 1,
          display: 'grid',
          gridTemplateColumns: {
            xs: 'auto minmax(0, 1fr) minmax(0, 0.7fr) minmax(0, 1.5fr) auto auto',
          },
          width: '100%',
        }}
      >
        {/* Logic operator (AND/OR) — disabled for all rows except the first */}
        <TextField
          disabled={!isFirst}
          fullWidth
          onChange={(event) =>
            onUpdateLogicOperator(event.target.value as 'and' | 'or')
          }
          select
          size="small"
          value={logicOperator}
          variant="outlined"
        >
          <MenuItem value="and">{localization.and}</MenuItem>
          <MenuItem value="or">{localization.or}</MenuItem>
        </TextField>

        {/* Column selector */}
        <TextField
          fullWidth
          label={localization.columns}
          onChange={(event) => handleColumnChange(event.target.value)}
          select
          size="small"
          value={selectedColumn.id}
          variant="outlined"
        >
          {filterableColumns.map((column) => (
            <MenuItem key={column.id} value={column.id}>
              {column.columnDef.header ||
                localization?.[column.id] ||
                column.id}
            </MenuItem>
          ))}
        </TextField>

        {/* Operator selector — options depend on the selected column type */}
        <TextField
          fullWidth
          label={localization.filterOperator}
          onChange={(event) => handleOperatorChange(event.target.value)}
          select
          size="small"
          value={selectedOperator.id}
          variant="outlined"
        >
          {availableOperators.map((operator) => (
            <MenuItem key={operator.id} value={operator.id}>
              {getLocalizedFilterOperatorLabel(
                localization,
                operator.id,
                operator.label,
              )}
            </MenuItem>
          ))}
        </TextField>

        {/* Value editor — rendered by the operator's own editComponent */}
        {/* onKeyDown bubbles from any text input inside the editor: Enter triggers apply */}
        <Box
          onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
            if (event.key === 'Enter' && onApply) {
              // Prevent the Enter from bubbling to MUI Drawer/Modal infrastructure
              // which could trigger a "click" on the last focused button
              event.preventDefault();
              event.stopPropagation();
              onApply();
            }
          }}
          sx={{ minWidth: 0, width: '100%' }}
        >
          {/* Render an empty spacer when the operator needs no value (e.g. isEmpty) */}
          {valueEditor ?? null}
        </Box>

        {/* Pin / unpin quick filter button */}
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Tooltip title={isPinned ? localization.unpin : localization.pin}>
            <IconButton
              aria-label={isPinned ? localization.unpin : localization.pin}
              color={isPinned ? 'primary' : 'default'}
              onClick={() => (isPinned ? onUnpin(rule.id) : onPin(rule.id))}
              size="small"
            >
              <PushPinIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Remove rule button */}
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <IconButton
            aria-label={localization.clearFilter}
            onClick={() => onRemove(rule.id)}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};
