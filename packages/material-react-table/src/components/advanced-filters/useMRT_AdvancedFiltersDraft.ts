import { useEffect, useMemo, useRef, useState } from 'react';
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

  // useRef so the effect reads the latest value without re-running on typing
  const hasUnappliedChangesRef = useRef(hasUnappliedChanges);
  hasUnappliedChangesRef.current = hasUnappliedChanges;

  // When the applied filters change externally (e.g. cleared from the toolbar)
  // and there are no local edits pending, sync the draft to match.
  // pinnedFilters changes (pin/unpin) always sync immediately without resetting draft rules.
  // Rule values that belong to a pinned filter are also always synced — their value
  // is owned by the quick filter strip, not the drawer.
  useEffect(() => {
    if (!hasUnappliedChangesRef.current) {
      setDraftFilters(filters);
      return;
    }
    // Sync pinnedFilters slot metadata and the committed values of pinned rules.
    // Other draft rules (non-pinned) are left untouched so the user's in-progress
    // drawer edits are preserved.
    setDraftFilters((current) => {
      const updatedRules = current.rules.map((draftRule) => {
        const isPinnedRule = filters.pinnedFilters.some(
          (pf) => pf.id === draftRule.id,
        );
        if (!isPinnedRule) return draftRule;
        // Use the committed rule value so the drawer reflects what the quick filter set
        const committedRule = filters.rules.find((r) => r.id === draftRule.id);
        return committedRule ?? draftRule;
      });

      return {
        ...current,
        pinnedFilters: filters.pinnedFilters,
        rules: updatedRules,
      };
    });
  }, [filters]);

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

  // Replaces a single rule's data (column, operator, or value) by id.
  // When the column or operator changes for a pinned rule, immediately syncs the
  // slot metadata in the committed state so the strip stays consistent.
  const updateRule = (ruleId: string, nextRule: MRT_FilterRule) => {
    setDraftFilters((currentFilters) => ({
      ...currentFilters,
      rules: currentFilters.rules.map((rule) =>
        rule.id === ruleId ? nextRule : rule,
      ),
    }));

    // Sync pinned slot definition when column or operator actually changed
    const currentFilters = table.getState().filters;
    const pinnedSlot = currentFilters.pinnedFilters.find(
      (pf) => pf.id === ruleId,
    );
    if (!pinnedSlot) return;
    const slotDefinitionChanged =
      pinnedSlot.columnId !== nextRule.columnId ||
      pinnedSlot.operator !== nextRule.operator;
    if (!slotDefinitionChanged) return;

    table.setFilters((current) => ({
      ...current,
      pinnedFilters: current.pinnedFilters.map((pf) =>
        pf.id === ruleId
          ? {
              id: pf.id,
              columnId: nextRule.columnId,
              operator: nextRule.operator,
            }
          : pf,
      ),
    }));
  };

  // Pins a rule as a quick filter slot — immediately committed to table state.
  // Uses draft rule data so the slot appears even before Apply is clicked.
  const pinRule = (ruleId: string) => {
    const draftRule = draftFilters.rules.find((r) => r.id === ruleId);
    if (!draftRule) return;

    table.setFilters((current) => {
      if (current.pinnedFilters.some((pf) => pf.id === ruleId)) return current;
      return {
        ...current,
        pinnedFilters: [
          ...current.pinnedFilters,
          {
            id: draftRule.id,
            columnId: draftRule.columnId,
            operator: draftRule.operator,
          },
        ],
      };
    });
  };

  // Unpins a quick filter slot — immediately committed to table state.
  // The underlying rule is preserved in the draft.
  const unpinRule = (ruleId: string) => {
    table.setFilters((current) => ({
      ...current,
      pinnedFilters: current.pinnedFilters.filter((pf) => pf.id !== ruleId),
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
    pinRule,
    removeRule,
    unpinRule,
    updateLogicOperator,
    updateRule,
  };
};
