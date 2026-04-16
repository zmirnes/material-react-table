import { useEffect, useMemo, useState } from 'react';
import {
  type MRT_FilterRule,
  type MRT_FiltersLogicOperator,
  type MRT_FiltersState,
  type MRT_RowData,
  type MRT_TableInstance,
} from '../../types';
import {
  createFilterRule,
  getDefaultFiltersState,
  getFilterableColumns,
  isFilterRuleIncomplete,
} from './utils';

// Manages a local draft copy of the filter state that is edited inside the drawer.
// The draft is only committed to the table when the user clicks "Apply".
export const useMRT_AdvancedFiltersDraft = <TData extends MRT_RowData>(
  table: MRT_TableInstance<TData>,
) => {
  // Read the currently applied filter state from the table
  const { filters } = table.getState();

  // Draft lives in local state — initialised with whatever is currently applied
  const [draftFilters, setDraftFilters] = useState<MRT_FiltersState>(filters);

  // Serialise both states to JSON so they can be compared cheaply
  const serializedAppliedFilters = useMemo(
    () => JSON.stringify(filters),
    [filters],
  );
  const serializedDraftFilters = useMemo(
    () => JSON.stringify(draftFilters),
    [draftFilters],
  );

  // True when the draft differs from the last applied state
  const hasUnappliedChanges =
    serializedAppliedFilters !== serializedDraftFilters;

  // When the applied filters change externally (e.g. cleared from the toolbar)
  // and there are no local edits pending, sync the draft to match
  useEffect(() => {
    if (!hasUnappliedChanges) {
      setDraftFilters(filters);
    }
  }, [filters, hasUnappliedChanges]);

  // Derive the list of columns that can have filter rules added
  const filterableColumns = getFilterableColumns(table);

  // Appends a new rule using the first available filterable column as the default
  const addRule = () => {
    const firstFilterableColumn = filterableColumns[0];

    if (!firstFilterableColumn) {
      return;
    }

    // Build a fresh rule with the column's default operator and initial value
    const nextRule = createFilterRule(firstFilterableColumn);

    if (!nextRule) {
      return;
    }

    setDraftFilters((currentFilters) => ({
      ...currentFilters,
      rules: [...currentFilters.rules, nextRule],
    }));
  };

  // Resets the draft back to an empty filter state
  const clearRules = () => {
    setDraftFilters(getDefaultFiltersState());
  };

  // Removes a single rule from the draft by its id
  const removeRule = (ruleId: string) => {
    setDraftFilters((currentFilters) => ({
      ...currentFilters,
      rules: currentFilters.rules.filter((rule) => rule.id !== ruleId),
    }));
  };

  // Updates the AND / OR logic operator that joins all rules
  const updateLogicOperator = (logicOperator: MRT_FiltersLogicOperator) => {
    setDraftFilters((currentFilters) => ({
      ...currentFilters,
      logicOperator,
    }));
  };

  // Replaces a single rule's data (column, operator, or value) by id
  const updateRule = (ruleId: string, nextRule: MRT_FilterRule) => {
    setDraftFilters((currentFilters) => ({
      ...currentFilters,
      rules: currentFilters.rules.map((rule) =>
        rule.id === ruleId ? nextRule : rule,
      ),
    }));
  };

  // True when at least one rule is missing a required value — blocks Apply
  const hasInvalidRules = draftFilters.rules.some((rule) =>
    isFilterRuleIncomplete(table, rule),
  );

  return {
    addRule,
    clearRules,
    draftFilters,
    filterableColumns,
    hasInvalidRules,
    hasUnappliedChanges,
    removeRule,
    updateLogicOperator,
    updateRule,
  };
};
