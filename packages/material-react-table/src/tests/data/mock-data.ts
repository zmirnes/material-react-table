import { type MRT_ColumnDef, type MRT_FiltersState } from '../../types';

const DEFAULT_PINNED_RULE_ID = 'preset-rule-1';
const DEFAULT_PINNED_RULE_COLUMN_ID = 'firstName';

export const DEFAULT_PINNED_FILTER_STATE: MRT_FiltersState = {
  logicOperator: 'and',
  rules: [
    {
      id: DEFAULT_PINNED_RULE_ID,
      columnId: DEFAULT_PINNED_RULE_COLUMN_ID,
      operator: 'contains',
      value: 'a',
    },
  ],
  pinnedFilters: [
    {
      id: DEFAULT_PINNED_RULE_ID,
      columnId: DEFAULT_PINNED_RULE_COLUMN_ID,
      operator: 'contains',
    },
  ],
};

export type MockRowData = {
  id: string;
  firstName: string;
  lastName: string;
  city: string;
} & Record<string, unknown>;

export const DEFAULT_TEST_COLUMNS: MRT_ColumnDef<MockRowData>[] = [
  { accessorKey: 'firstName', header: 'First Name', type: 'string' },
  { accessorKey: 'lastName', header: 'Last Name', type: 'string' },
  { accessorKey: 'city', header: 'City', type: 'string' },
];

export const DEFAULT_TEST_DATA: MockRowData[] = [
  { id: '1', firstName: 'Alice', lastName: 'Smith', city: 'NYC' },
  { id: '2', firstName: 'Bob', lastName: 'Doe', city: 'LA' },
  { id: '3', firstName: 'Alice', lastName: 'Jones', city: 'LA' },
  { id: '4', firstName: 'Mark', lastName: 'Jones', city: 'LA' },
];
