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

export const useMRT_AdvancedFiltersDraft = <TData extends MRT_RowData>(
  table: MRT_TableInstance<TData>,
) => {
  const { filters } = table.getState();
  const [draftFilters, setDraftFilters] = useState<MRT_FiltersState>(filters);
  const serializedAppliedFilters = useMemo(
    () => JSON.stringify(filters),
    [filters],
  );
  const serializedDraftFilters = useMemo(
    () => JSON.stringify(draftFilters),
    [draftFilters],
  );
  const hasUnappliedChanges =
    serializedAppliedFilters !== serializedDraftFilters;

  useEffect(() => {
    if (!hasUnappliedChanges) {
      setDraftFilters(filters);
    }
  }, [filters, hasUnappliedChanges]);

  const filterableColumns = getFilterableColumns(table);

  const addRule = () => {
    const firstFilterableColumn = filterableColumns[0];

    if (!firstFilterableColumn) {
      return;
    }

    const nextRule = createFilterRule(firstFilterableColumn);

    if (!nextRule) {
      return;
    }

    setDraftFilters((currentFilters) => ({
      ...currentFilters,
      rules: [...currentFilters.rules, nextRule],
    }));
  };

  const clearRules = () => {
    setDraftFilters(getDefaultFiltersState());
  };

  const removeRule = (ruleId: string) => {
    setDraftFilters((currentFilters) => ({
      ...currentFilters,
      rules: currentFilters.rules.filter((rule) => rule.id !== ruleId),
    }));
  };

  const updateLogicOperator = (logicOperator: MRT_FiltersLogicOperator) => {
    setDraftFilters((currentFilters) => ({
      ...currentFilters,
      logicOperator,
    }));
  };

  const updateRule = (ruleId: string, nextRule: MRT_FilterRule) => {
    setDraftFilters((currentFilters) => ({
      ...currentFilters,
      rules: currentFilters.rules.map((rule) =>
        rule.id === ruleId ? nextRule : rule,
      ),
    }));
  };

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
