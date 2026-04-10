import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
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
  isFirst: boolean;
  logicOperator: 'and' | 'or';
  onRemove: (ruleId: string) => void;
  onUpdate: (nextRule: MRT_FilterRule) => void;
  onUpdateLogicOperator: (op: 'and' | 'or') => void;
  rule: MRT_FilterRule;
  table: MRT_TableInstance<TData>;
}

export const MRT_AdvancedFiltersRuleRow = <TData extends MRT_RowData>({
  filterableColumns,
  isFirst,
  logicOperator,
  onRemove,
  onUpdate,
  onUpdateLogicOperator,
  rule,
  table,
}: MRT_AdvancedFiltersRuleRowProps<TData>) => {
  const {
    options: {
      icons: { CloseIcon },
      localization,
    },
  } = table;

  const selectedColumn =
    getFilterColumn(table, rule.columnId) ?? filterableColumns[0];

  if (!selectedColumn) {
    return null;
  }

  const availableOperators = getColumnFilterOperators(selectedColumn);
  const selectedOperator =
    availableOperators.find((operator) => operator.id === rule.operator) ??
    availableOperators[0];

  if (!selectedOperator) {
    return null;
  }

  const handleColumnChange = (columnId: string) => {
    const nextColumn = filterableColumns.find(
      (column) => column.id === columnId,
    );

    if (!nextColumn) {
      return;
    }

    const nextRule = createFilterRule(nextColumn);

    if (!nextRule) {
      return;
    }

    onUpdate({ ...nextRule, id: rule.id });
  };

  const handleOperatorChange = (operatorId: string) => {
    const nextOperator = availableOperators.find(({ id }) => id === operatorId);

    if (!nextOperator) {
      return;
    }

    onUpdate({
      ...rule,
      operator: nextOperator.id,
      value: nextOperator.getInitialValue(),
    });
  };

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
      <Box
        sx={{
          alignItems: 'center',
          columnGap: 1,
          display: 'grid',
          gridTemplateColumns: {
            xs: 'auto minmax(0, 1.3fr) minmax(0, 1fr) minmax(0, 1.5fr) auto',
          },
          width: '100%',
        }}
      >
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
              {column.columnDef.header}
            </MenuItem>
          ))}
        </TextField>
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
        <Box sx={{ minWidth: 0, width: '100%' }}>
          {valueEditor ?? <Box sx={{ minHeight: 56 }} />}
        </Box>
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
