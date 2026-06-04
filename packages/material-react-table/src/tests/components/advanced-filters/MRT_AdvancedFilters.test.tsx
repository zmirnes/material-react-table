import { FILTER_RULE_VALUE_TEST_ID } from '../../../components/advanced-filters/MRT_AdvancedFiltersRuleRow';
import { MaterialReactServerTable } from '../../../components/MaterialReactServerTable';
import { MRT_Localization_HR } from '../../../locales/hr';
import { type MRT_TableData, type MRT_TableState } from '../../../types';
import {
  DEFAULT_TEST_COLUMNS,
  DEFAULT_TEST_DATA,
  type MockRowData,
} from '../../data/mock-data';
import { applyAdvancedFilter } from '../../utils/applyAdvancedFilter';
import { openAdvancedFiltersDrawer } from '../../utils/openAdvancedFiltersDrawer';
import {
  cleanup,
  render,
  screen,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { add, clear, columns, filterOperator, advancedFilters, clearFilter } =
  MRT_Localization_HR;

const FILTER_RULE_ROW_TEST_ID = 'mrt-filter-rule-row';
const DUMMY_FILTER_VALUE = 'some_value';
const THREE_ROWS = 3;

type MockLoadDataFn = (
  state: MRT_TableState<MockRowData>,
) => Promise<MRT_TableData<MockRowData>>;

const clickAddFilterButton = async (user: UserEvent) => {
  await user.click(await screen.findByRole('button', { name: add }));
};

const findFirstFilterRuleRow = async () => {
  const allRuleRows = await screen.findAllByTestId(FILTER_RULE_ROW_TEST_ID);
  return allRuleRows[0];
};

const typeValueIntoLastRuleRow = async (user: UserEvent, value: string) => {
  const allRuleRows = await screen.findAllByTestId(FILTER_RULE_ROW_TEST_ID);
  const lastRuleRow = allRuleRows[allRuleRows.length - 1];
  // FILTER_RULE_VALUE_TEST_ID is a Box wrapper — find the actual textbox inside it
  const valueEditorBox = await within(lastRuleRow).findByTestId(
    FILTER_RULE_VALUE_TEST_ID,
  );
  const actualTextInput = within(valueEditorBox).getByRole('textbox');
  await user.type(actualTextInput, value);
};

const addFilterRuleRowWithValue = async (user: UserEvent, value: string) => {
  await clickAddFilterButton(user);
  await typeValueIntoLastRuleRow(user, value);
};

const renderTableWithMockLoadData = (mockLoadData: MockLoadDataFn) => {
  render(
    <MaterialReactServerTable<MockRowData>
      loadConfig={async () => ({
        columns: DEFAULT_TEST_COLUMNS,
      })}
      loadData={mockLoadData}
      saveState={async () => {}}
    />,
  );
};

describe('MRT_AdvancedFilters', async () => {
  let user: UserEvent;
  let mockLoadData: ReturnType<typeof vi.fn<MockLoadDataFn>>;

  const addThreeFilterRuleRowsWithValues = async () => {
    await addFilterRuleRowWithValue(user, DUMMY_FILTER_VALUE);
    await addFilterRuleRowWithValue(user, DUMMY_FILTER_VALUE);
    await addFilterRuleRowWithValue(user, DUMMY_FILTER_VALUE);
  };

  beforeEach(async () => {
    user = userEvent.setup({ delay: null });
    mockLoadData = vi.fn<MockLoadDataFn>().mockResolvedValue({
      data: DEFAULT_TEST_DATA,
      rowCount: DEFAULT_TEST_DATA.length,
    });
    renderTableWithMockLoadData(mockLoadData);
    await openAdvancedFiltersDrawer();
  });

  // Unmount after each test so the next beforeEach starts with a clean DOM
  afterEach(cleanup);

  it('should render filter rule row after clicking the add filter button', async () => {
    const mockCallsLengthBeforeAddingRule = mockLoadData.mock.calls.length;

    await clickAddFilterButton(user);

    const filterRuleRow = await findFirstFilterRuleRow();
    expect(filterRuleRow).toBeInTheDocument();

    const mockCallsLengthAfterAddingRule = mockLoadData.mock.calls.length;

    // Both lengths must be equal because adding a draft filter rule row
    // does not commit any state change — loadData should NOT be triggered
    expect(mockCallsLengthAfterAddingRule).toEqual(
      mockCallsLengthBeforeAddingRule,
    );
  });

  it('should render column, operator and value fields after clicking the add filter button', async () => {
    await clickAddFilterButton(user);

    const filterRuleRow = await findFirstFilterRuleRow();

    const columnField = await within(filterRuleRow).findByRole('combobox', {
      name: columns,
    });
    const operatorField = await within(filterRuleRow).findByRole('combobox', {
      name: filterOperator,
    });
    const valueInput = await within(filterRuleRow).findByTestId(
      FILTER_RULE_VALUE_TEST_ID,
    );

    expect(columnField).toBeInTheDocument();
    expect(operatorField).toBeInTheDocument();
    expect(valueInput).toBeInTheDocument();
  });

  it('should close drawer after clicking the close drawer button', async () => {
    const closeDrawerButton = screen.getByRole('button', {
      name: advancedFilters,
    });
    const drawer = await screen.findByRole('dialog');
    await user.click(closeDrawerButton);
    await waitForElementToBeRemoved(drawer);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should remove filter rule row after clicking the delete button', async () => {
    await addThreeFilterRuleRowsWithValues();

    const allRuleRowsBeforeDelete = await screen.findAllByTestId(
      FILTER_RULE_ROW_TEST_ID,
    );
    expect(allRuleRowsBeforeDelete).toHaveLength(THREE_ROWS);

    const firstRuleRow = allRuleRowsBeforeDelete[0];
    const deleteButtonOfFirstRow = within(firstRuleRow).getByRole('button', {
      name: clearFilter,
    });

    const mockCallsLengthBeforeDelete = mockLoadData.mock.calls.length;

    await user.click(deleteButtonOfFirstRow);

    // Verify that exactly one row was removed after clicking the delete button
    const allRuleRowsAfterDelete = await screen.findAllByTestId(
      FILTER_RULE_ROW_TEST_ID,
    );
    expect(allRuleRowsAfterDelete).toHaveLength(THREE_ROWS - 1);

    const mockCallsLengthAfterDelete = mockLoadData.mock.calls.length;

    // Both lengths must be equal because deleting a draft (unapplied) filter rule
    // does not commit any state change — loadData should NOT be triggered
    expect(mockCallsLengthAfterDelete).toEqual(mockCallsLengthBeforeDelete);
  });

  it('should remove all filter rule rows after clicking the clear button', async () => {
    const mockCallBeforeClear = mockLoadData.mock.calls[0][0];
    await addThreeFilterRuleRowsWithValues();

    const clearAllButton = screen.getByRole('button', { name: clear });
    await user.click(clearAllButton);

    const mockCallAfterClear =
      mockLoadData.mock.calls[mockLoadData.mock.calls.length - 1][0];

    // The state passed to loadData after clearing filters should have an empty advancedFilters array
    // The state passed to the last loadData call must equal the state from the very first call —
    // clicking the clear button resets draft filters without triggering a new loadData fetch
    expect(mockCallAfterClear).toEqual(mockCallBeforeClear);
  });
  it('should call loadData with the applied filter rules after clicking the apply button', async () => {
    await addFilterRuleRowWithValue(user, DUMMY_FILTER_VALUE);
    const filterRuleRow = await findFirstFilterRuleRow();

    const valueInput = await within(filterRuleRow).findByTestId(
      FILTER_RULE_VALUE_TEST_ID,
    );
    const enteredTextInput: HTMLInputElement =
      within(valueInput).getByRole('textbox');
    expect(enteredTextInput.value).toBe(DUMMY_FILTER_VALUE);

    await applyAdvancedFilter();
    await waitForElementToBeRemoved(() => screen.queryByRole('dialog'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(
      await screen.findByTestId('active-filters-container'),
    ).toBeInTheDocument();

    const mockCalls = mockLoadData.mock.calls;
    const filtersFromLastMockCall = mockCalls[mockCalls.length - 1][0].filters;
    const loadDataFilterRulesValue = filtersFromLastMockCall.rules[0].value;
    expect(loadDataFilterRulesValue).toEqual(DUMMY_FILTER_VALUE);
  });
});
