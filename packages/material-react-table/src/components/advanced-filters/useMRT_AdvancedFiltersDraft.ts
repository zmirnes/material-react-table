import { useEffect, useMemo, useRef, useState } from 'react';
import {
  createFilterRule,
  getDefaultFiltersState,
  getFilterableColumns,
  isFilterRuleIncomplete,
} from './utils';
import {
  type MRT_FilterRule,
  type MRT_FiltersLogicOperator,
  type MRT_FiltersState,
  type MRT_RowData,
  type MRT_SavedFilter,
  type MRT_TableInstance,
} from '../../types';

// Manages a local draft copy of the filter state that is edited inside the drawer.
// The draft is only committed to the table when the user clicks "Apply".
export const useMRT_AdvancedFiltersDraft = <TData extends MRT_RowData>(
  table: MRT_TableInstance<TData>,
) => {
  // Read the currently applied filter state from the table
  const { filters } = table.getState();

  // Draft lives in local state — initialised with whatever is currently applied
  const [draftFilters, setDraftFilters] = useState<MRT_FiltersState>(filters);

  // Tracks whether the user has intentionally edited the draft inside the drawer.
  // Only when true do we preserve the draft when applied filters change externally
  // (e.g. loading a saved filter from the toolbar). This prevents the toolbar load
  // from being silently ignored because hasUnappliedChanges is already true.
  const isDraftDirty = useRef(false);

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
  // and the user has not made any manual draft edits, sync the draft to match.
  // pinnedFilters changes (pin/unpin) always sync immediately without resetting draft rules.
  // Rule values that belong to a pinned filter are also always synced — their value
  // is owned by the quick filter strip, not the drawer.
  useEffect(() => {
    if (!isDraftDirty.current) {
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
    isDraftDirty.current = true;
  };

  // Resets the draft rules and logicOperator but keeps pinnedFilters intact.
  const clearRules = () => {
    isDraftDirty.current = false;
    setDraftFilters((current) => ({
      ...getDefaultFiltersState(),
      pinnedFilters: current.pinnedFilters,
    }));
  };

  // Resets the draft back to the currently applied filter state, discarding any
  // in-progress drawer edits without touching the table's applied filters.
  const discardChanges = () => {
    isDraftDirty.current = false;
    setDraftFilters(filters);
  };

  // Loads a saved filter preset into the draft, replacing all current rules.
  // Pinned filters are preserved — the user must click Apply to commit the preset.
  const loadSavedFilter = (savedFilter: MRT_SavedFilter) => {
    setDraftFilters((current) => ({
      ...current,
      logicOperator: savedFilter.logicOperator,
      rules: savedFilter.rules,
    }));
  };

  // Removes a rule from the draft. If the rule is already applied (exists in the
  // active filter state), it is also removed from the table immediately.
  // Draft-only rules (not yet applied) are only removed from the draft.
  const removeRule = (ruleId: string) => {
    const isActiveRule = filters.rules.some((rule) => rule.id === ruleId);

    setDraftFilters((currentFilters) => ({
      ...currentFilters,
      rules: currentFilters.rules.filter((rule) => rule.id !== ruleId),
    }));

    if (isActiveRule) {
      table.setFilters((current) => ({
        ...current,
        rules: current.rules.filter((rule) => rule.id !== ruleId),
      }));
    } else {
      isDraftDirty.current = true;
    }
  };

  // Updates the AND / OR logic operator that joins all rules
  const updateLogicOperator = (logicOperator: MRT_FiltersLogicOperator) => {
    isDraftDirty.current = true;
    setDraftFilters((currentFilters) => ({
      ...currentFilters,
      logicOperator,
    }));
  };

  // Replaces a single rule's data (column, operator, or value) by id.
  // Pinned slot metadata (columnId, operator) is intentionally NOT synced here —
  // the quick filter bar reflects the last applied state until Apply is clicked.
  const updateRule = (ruleId: string, nextRule: MRT_FilterRule) => {
    isDraftDirty.current = true;
    setDraftFilters((currentFilters) => ({
      ...currentFilters,
      rules: currentFilters.rules.map((rule) =>
        rule.id === ruleId ? nextRule : rule,
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

  // Resets the dirty flag after the draft has been committed to the table.
  // Must be called whenever the draft is successfully applied so that subsequent
  // external filter changes (e.g. deleting a rule from outside the drawer) are
  // picked up and synced to the draft correctly.
  const markApplied = () => {
    isDraftDirty.current = false;
  };

  // True when at least one rule is missing a required value — blocks Apply
  const hasInvalidRules = draftFilters.rules.some((rule) =>
    isFilterRuleIncomplete(table, rule),
  );

  return {
    addRule,
    clearRules,
    discardChanges,
    draftFilters,
    filterableColumns,
    hasInvalidRules,
    hasUnappliedChanges,
    loadSavedFilter,
    markApplied,
    pinRule,
    removeRule,
    unpinRule,
    updateLogicOperator,
    updateRule,
  };
};
