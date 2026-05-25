import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
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
  getLocalizedFilterOperatorLabel,
} from '../advanced-filters/utils';

interface MRT_QuickFilterItemProps<TData extends MRT_RowData> {
  column: MRT_Column<TData>;
  operator: MRT_FilterOperatorDefinition<TData>;
  pinnedFilter: Omit<MRT_FilterRule, 'value'>;
  // The live rule from filters.rules — undefined when no value has been committed yet
  // or when the rule was removed from the drawer
  rule: MRT_FilterRule | undefined;
  table: MRT_TableInstance<TData>;
}

// Renders a single pinned quick filter: label strip with unpin button + the operator's editor.
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
      localization,
    },
  } = table;

  const operatorLabel = getLocalizedFilterOperatorLabel(
    localization,
    pinnedFilter.operator,
    operator.label,
  );

  // 'commit' operators buffer keystrokes locally and only commit to filters.rules on Enter.
  // 'change' operators (selects, pickers, booleans) commit immediately on each onChange.
  const isTriggerModeCommit = (operator.triggerMode ?? 'change') === 'commit';

  // localValue stores the in-progress text/number input before Enter is pressed.
  // For 'change' operators this state is unused — the editor reads directly from the rule.
  const [localValue, setLocalValue] = useState<unknown>(
    rule?.value ?? operator.getInitialValue(),
  );

  // Sync localValue whenever the external rule value changes:
  //   - Drawer updates the rule value → reflect that value in this editor
  //   - Rule is removed from filters.rules (deleted in drawer) → reset to initial value
  useEffect(() => {
    setLocalValue(rule?.value ?? operator.getInitialValue());
  }, [rule?.value]);

  // The rule object passed into editComponent.
  // 'commit' mode shows localValue so keystrokes appear in the input without committing.
  // 'change' mode always shows the live committed value from filters.rules.
  const editorRule: MRT_FilterRule = {
    columnId: pinnedFilter.columnId,
    id: pinnedFilter.id,
    operator: pinnedFilter.operator,
    value: isTriggerModeCommit
      ? localValue
      : (rule?.value ?? operator.getInitialValue()),
  };

  // Upserts the rule in filters.rules with the given committed value
  const commitValue = (committedValue: unknown) => {
    table.setFilters((previousFilters) => {
      const existingRuleIndex = previousFilters.rules.findIndex(
        (r) => r.id === pinnedFilter.id,
      );

      const updatedRule: MRT_FilterRule = {
        columnId: pinnedFilter.columnId,
        id: pinnedFilter.id,
        operator: pinnedFilter.operator,
        value: committedValue,
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

  // 'commit' mode: buffer in localValue only — Enter (see onKeyDown) commits to filters.rules.
  // 'change' mode: commit immediately so selects/pickers trigger a fetch on each change.
  const handleEditorChange = (newValue: unknown) => {
    if (isTriggerModeCommit) {
      setLocalValue(newValue);
    } else {
      commitValue(newValue);
    }
  };

  // Removes from pinnedFilters only — the rule in filters.rules is intentionally preserved
  // so it remains active and visible in the advanced filter drawer if it has a value.
  const handleUnpin = () => {
    table.setFilters((previousFilters) => ({
      ...previousFilters,
      pinnedFilters: previousFilters.pinnedFilters.filter(
        (pf) => pf.id !== pinnedFilter.id,
      ),
    }));
  };

  const columnLabel =
    typeof column.columnDef.header === 'string'
      ? column.columnDef.header
      : column.id;

  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      // 'commit' mode: intercept Enter at the container level so any text/number input
      // inside the operator's editComponent triggers the commit.
      onKeyDown={
        isTriggerModeCommit
          ? (event) => {
              if (event.key === 'Enter') {
                commitValue(localValue);
              }
            }
          : undefined
      }
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
        position: 'relative',
      }}
    >
      {/* Label row: column name + hover unpin button */}
      <Box sx={{ alignItems: 'center', display: 'flex' }}>
        <Box
          component="span"
          sx={{
            color: 'text.secondary',
            fontSize: 11,
            fontWeight: 500,
            lineHeight: 1,
          }}
        >
          {columnLabel}
        </Box>
        <Box
          component="span"
          sx={{
            color: 'text.disabled',
            fontSize: 11,
            lineHeight: 1,
          }}
        >
          &nbsp;{`${operatorLabel.toLowerCase()}`}
        </Box>
        {isHovered && (
          <Tooltip title="Unpin filter">
            <IconButton
              onClick={handleUnpin}
              size="small"
              sx={{
                backgroundColor: (theme) => theme.palette.error.main,
                color: (theme) => theme.palette.background.paper,
                width: 18,
                height: 18,
                position: 'absolute',
                right: -8,
                top: 8,
                zIndex: 1,
                '&:hover': {
                  backgroundColor: (theme) => theme.palette.error.dark,
                },
              }}
            >
              <CloseIcon sx={{ fontSize: 10 }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Value editor rendered by the operator's own editComponent */}
      <Box>
        {operator.editComponent({
          column: column as never,
          onChange: handleEditorChange,
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

        // Find the live rule — may be undefined if user hasn't entered a value yet
        // or if the rule was removed from the drawer without unpinning
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
