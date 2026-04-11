import { columnTypeResolvers } from '../../column-types/registy';
import {
  type MRT_Column,
  type MRT_FilterOperator,
  type MRT_FilterOperatorDefinition,
  type MRT_FilterRule,
  type MRT_FiltersState,
  type MRT_Localization,
  type MRT_RowData,
  type MRT_TableInstance,
} from '../../types';

// Returns the initial (empty) filter state — one AND group with no rules
export const getDefaultFiltersState = (): MRT_FiltersState => ({
  logicOperator: 'and',
  rules: [],
});

// Generates a cryptographically unique ID for each filter rule
export const createFilterRuleId = (): string => crypto.randomUUID();

// Looks up the filter operators that apply to a given column.
// Columns of type 'actions', 'icon', or 'object' are not filterable — returns []
export const getColumnFilterOperators = <TData extends MRT_RowData>(
  column: MRT_Column<TData>,
): MRT_FilterOperatorDefinition<TData>[] => {
  // Resolve the column's registered type (string, number, date, etc.)
  const { type } = column.columnDef;

  // Non-filterable column types return an empty operator list
  if (!type || type === 'actions' || type === 'object') {
    return [];
  }

  // Delegate to the resolver for the column type; fall back to [] if unregistered
  return columnTypeResolvers[type]?.getFilterOperators(column.columnDef) ?? [];
};

// Lookup map: operator id → localization key.
// Using a map avoids a long switch statement and makes it easy to extend.
const OPERATOR_LOCALIZATION_KEYS: Partial<
  Record<MRT_FilterOperator, keyof MRT_Localization>
> = {
  between: 'filterBetween',
  'between-inclusive': 'filterBetweenInclusive',
  contains: 'filterContains',
  endsWith: 'filterEndsWith',
  equals: 'filterEquals',
  greaterThan: 'filterGreaterThan',
  greaterThanOrEqualTo: 'filterGreaterThanOrEqualTo',
  inArray: 'filterInArray',
  isEmpty: 'filterEmpty',
  isNotEmpty: 'filterNotEmpty',
  lessThan: 'filterLessThan',
  lessThanOrEqualTo: 'filterLessThanOrEqualTo',
  notEquals: 'filterNotEquals',
  startsWith: 'filterStartsWith',
};

// Translates an operator id to its localised label.
// Falls back to the operator's own static label when no translation key exists.
export const getLocalizedFilterOperatorLabel = (
  localization: MRT_Localization,
  operatorId: MRT_FilterOperator,
  fallbackLabel: string,
): string => {
  // Look up the translation key for this operator
  const key = OPERATOR_LOCALIZATION_KEYS[operatorId];
  return key ? (localization[key] as string) : fallbackLabel;
};

// Returns leaf columns that the user may add as filter rules.
// A column is filterable when it is a data column, has filtering enabled,
// and its resolved type provides at least one operator.
export const getFilterableColumns = <TData extends MRT_RowData>(
  table: MRT_TableInstance<TData>,
): MRT_Column<TData>[] =>
  table
    .getAllLeafColumns()
    .filter(
      (column) =>
        column.columnDef.columnDefType === 'data' &&
        column.columnDef.enableColumnFilter !== false &&
        getColumnFilterOperators(column).length > 0,
    );

// Finds a single column by id across all leaf columns
export const getFilterColumn = <TData extends MRT_RowData>(
  table: MRT_TableInstance<TData>,
  columnId: string,
): MRT_Column<TData> | undefined =>
  table.getAllLeafColumns().find((column) => column.id === columnId);

// Builds a new filter rule pre-populated with the column's first available operator
// and its default (empty) value. Returns null when the column has no operators.
export const createFilterRule = <TData extends MRT_RowData>(
  column: MRT_Column<TData>,
): MRT_FilterRule | null => {
  const operators = getColumnFilterOperators(column);
  // Use the first operator as the default selection
  const initialOperator = operators[0];

  if (!initialOperator) {
    return null;
  }

  return {
    columnId: column.id,
    id: createFilterRuleId(),
    operator: initialOperator.id,
    // Populate with the operator's own initial value (e.g. '' or [])
    value: initialOperator.getInitialValue(),
  };
};

// Returns true when a rule is not yet complete enough to be applied as a filter.
// A rule is incomplete when its column is missing, its operator is unrecognised,
// or the operator's own isEmpty check returns true for the current value.
export const isFilterRuleIncomplete = <TData extends MRT_RowData>(
  table: MRT_TableInstance<TData>,
  rule: MRT_FilterRule,
): boolean => {
  // Attempt to resolve the rule's column from the table
  const column = getFilterColumn(table, rule.columnId);

  if (!column) {
    return true;
  }

  // Attempt to match the stored operator id to its definition
  const operator = getColumnFilterOperators(column).find(
    ({ id }) => id === rule.operator,
  );

  if (!operator) {
    return true;
  }

  // Delegate to the operator's own value-empty check
  return operator.isValueEmpty(rule.value as never);
};
