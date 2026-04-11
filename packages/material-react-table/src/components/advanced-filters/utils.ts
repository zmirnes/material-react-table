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

export const getDefaultFiltersState = (): MRT_FiltersState => ({
  logicOperator: 'and',
  rules: [],
});

export const createFilterRuleId = (): string => crypto.randomUUID();

export const getColumnFilterOperators = <TData extends MRT_RowData>(
  column: MRT_Column<TData>,
): MRT_FilterOperatorDefinition<TData>[] => {
  const { type } = column.columnDef;

  if (!type || type === 'actions' || type === 'icon' || type === 'object') {
    return [];
  }

  return (
    columnTypeResolvers[type]?.getFilterOperators(column.columnDef as never) ??
    []
  );
};

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
  isEmpty: 'filterEmpty',
  isNotEmpty: 'filterNotEmpty',
  lessThan: 'filterLessThan',
  lessThanOrEqualTo: 'filterLessThanOrEqualTo',
  startsWith: 'filterStartsWith',
};

export const getLocalizedFilterOperatorLabel = (
  localization: MRT_Localization,
  operatorId: MRT_FilterOperator,
  fallbackLabel: string,
): string => {
  const key = OPERATOR_LOCALIZATION_KEYS[operatorId];
  return key ? (localization[key] as string) : fallbackLabel;
};

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

export const getFilterColumn = <TData extends MRT_RowData>(
  table: MRT_TableInstance<TData>,
  columnId: string,
): MRT_Column<TData> | undefined =>
  table.getAllLeafColumns().find((column) => column.id === columnId);

export const createFilterRule = <TData extends MRT_RowData>(
  column: MRT_Column<TData>,
): MRT_FilterRule | null => {
  const operators = getColumnFilterOperators(column);
  const initialOperator = operators[0];

  if (!initialOperator) {
    return null;
  }

  return {
    columnId: column.id,
    id: createFilterRuleId(),
    operator: initialOperator.id,
    value: initialOperator.getInitialValue(),
  };
};

export const isFilterRuleIncomplete = <TData extends MRT_RowData>(
  table: MRT_TableInstance<TData>,
  rule: MRT_FilterRule,
): boolean => {
  const column = getFilterColumn(table, rule.columnId);

  if (!column) {
    return true;
  }

  const operator = getColumnFilterOperators(column).find(
    ({ id }) => id === rule.operator,
  );

  if (!operator) {
    return true;
  }

  return operator.isValueEmpty(rule.value as never);
};
