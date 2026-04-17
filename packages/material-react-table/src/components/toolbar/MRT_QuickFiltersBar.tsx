import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useState } from 'react';
import {
  type MRT_Column,
  type MRT_FilterOperatorDefinition,
  type MRT_FilterRule,
  type MRT_RowData,
  type MRT_TableInstance,
} from '../../types';
import {
  getColumnFilterOperators,
  getFilterColumn,
} from '../advanced-filters/utils';

interface MRT_QuickFilterItemProps<TData extends MRT_RowData> {
  column: MRT_Column<TData>;
  operator: MRT_FilterOperatorDefinition<TData>;
  pinnedFilter: Omit<MRT_FilterRule, 'value'>;
  // The live rule from filters.rules — undefined when the user hasn't typed anything yet
  rule: MRT_FilterRule | undefined;
  table: MRT_TableInstance<TData>;
}

// Renders a single pinned filter: a label row with an unpin button and an editor below it.
const MRT_QuickFilterItem = <TData extends MRT_RowData>({
  column,
  operator,
  pinnedFilter,
  rule,
  table,
}: MRT_QuickFilterItemProps<TData>) => {
  const [isHovered, setIsHovered] = useState(false);

  const {
    options: {
      icons: { CloseIcon },
    },
  } = table;

  // Build the rule passed to editComponent — fall back to the operator's initial value
  // when this pinned filter has not yet produced a rule in filters.rules
  const editorRule: MRT_FilterRule = rule ?? {
    columnId: pinnedFilter.columnId,
    id: pinnedFilter.id,
    operator: pinnedFilter.operator,
    value: operator.getInitialValue(),
  };

  const columnLabel =
    typeof column.columnDef.header === 'string'
      ? column.columnDef.header
      : column.id;

  // Commits the new value by upserting the rule in filters.rules
  const handleValueChange = (newValue: unknown) => {
    table.setFilters((previousFilters) => {
      const existingRuleIndex = previousFilters.rules.findIndex(
        (r) => r.id === pinnedFilter.id,
      );

      const updatedRule: MRT_FilterRule = {
        columnId: pinnedFilter.columnId,
        id: pinnedFilter.id,
        operator: pinnedFilter.operator,
        value: newValue,
      };

      if (existingRuleIndex >= 0) {
        const updatedRules = [...previousFilters.rules];
        updatedRules[existingRuleIndex] = updatedRule;
        return { ...previousFilters, rules: updatedRules };
      }

      return {
        ...previousFilters,
        rules: [...previousFilters.rules, updatedRule],
      };
    });
  };

  // Removes this filter from both pinnedFilters and rules
  const handleUnpin = () => {
    table.setFilters((previousFilters) => ({
      ...previousFilters,
      pinnedFilters: previousFilters.pinnedFilters.filter(
        (pf) => pf.id !== pinnedFilter.id,
      ),
    }));
  };

  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      {/* Label row with column name and unpin button */}
      <Box sx={{ alignItems: 'center', display: 'flex', gap: 0.5 }}>
        {isHovered && (
          <Tooltip title="Unpin filter">
            <IconButton
              onClick={handleUnpin}
              size="small"
              sx={{
                position: 'absolute',
                zIndex: 1,
                right: -8,
                top: -8,
                backgroundColor: (theme) => theme.palette.error.main,
                color: (theme) => theme.palette.background.paper,
                '&:hover': {
                  backgroundColor: (theme) => theme.palette.error.dark,
                },
              }}
            >
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Filter value editor provided by the operator definition */}
      <Box>
        {operator.editComponent({
          column: column as never,
          onChange: handleValueChange,
          rule: editorRule,
          table,
        })}
      </Box>
    </Box>
  );
};

export interface MRT_QuickFiltersBarProps<TData extends MRT_RowData> {
  table: MRT_TableInstance<TData>;
}

// Renders a strip of pinned quick filter inputs directly above the table body.
// Visible only when at least one filter rule is pinned.
export const MRT_QuickFiltersBar = <TData extends MRT_RowData>({
  table,
}: MRT_QuickFiltersBarProps<TData>) => {
  const { filters } = table.getState();

  if (filters.pinnedFilters.length === 0) return null;

  return (
    <Box
      sx={{
        alignItems: 'flex-start',
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 1,
        px: 1.5,
        py: 1,
      }}
    >
      {filters.pinnedFilters.map((pinnedFilter) => {
        const column = getFilterColumn(table, pinnedFilter.columnId);

        if (!column) return null;

        const operator = getColumnFilterOperators(column).find(
          (op) => op.id === pinnedFilter.operator,
        );

        if (!operator) return null;

        const matchingRule = filters.rules.find(
          (rule) => rule.id === pinnedFilter.id,
        );

        return (
          <MRT_QuickFilterItem
            key={pinnedFilter.id}
            column={column}
            operator={operator}
            pinnedFilter={pinnedFilter}
            rule={matchingRule}
            table={table}
          />
        );
      })}
    </Box>
  );
};
