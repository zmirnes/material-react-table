import { FILTER_RULE_VALUE_TEST_ID } from '../../../components/advanced-filters/MRT_AdvancedFiltersRuleRow';
import { MaterialReactServerTable } from '../../../components/MaterialReactServerTable';
import { MRT_Localization_HR } from '../../../locales/hr';
import { type MRT_TableData, type MRT_TableState } from '../../../types';
import {
  DEFAULT_TEST_COLUMNS,
  DEFAULT_TEST_DATA,
  type MockRowData,
} from '../../data/mock-data';
import { addFilterRuleRowWithValue } from '../../utils/advanced-filters/addFilterRuleRowWithValue';
import { replaceQuickFilterInputValue } from '../../utils/advanced-filters/replaceQuickFilterInputValue';
import { applyAdvancedFilter } from '../../utils/applyAdvancedFilter';
import { getRuleRowValuesFromDrawer } from '../../utils/getRuleRowValuesFromDrawer';
import { openAdvancedFiltersDrawer } from '../../utils/openAdvancedFiltersDrawer';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const {
  add,
  clear,
  pin,
  unpin,
  columns,
  filterOperator,
  advancedFilters,
  clearFilter,
} = MRT_Localization_HR;

const FILTER_RULE_ROW_TEST_ID = 'mrt-filter-rule-row';
const DUMMY_FILTER_VALUE = 'a';
// Value used exclusively to verify that the quick filter bar syncs back to the drawer rule row
const UPDATED_QUICK_FILTER_VALUE = 'updated_quick_filter_value';
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

  // Pins the first rule row and asserts the quick filter bar appears — returns the row element
  const pinFirstRuleRow = async () => {
    const firstRuleRow = await findFirstFilterRuleRow();
    const pinButton = within(firstRuleRow).getByRole('button', { name: pin });
    await user.click(pinButton);

    const quickFilterBar = await screen.findByTestId('quick-filters-bar');
    expect(quickFilterBar).toBeInTheDocument();

    return firstRuleRow;
  };

  beforeEach(async () => {
    user = userEvent.setup({ delay: null });
    mockLoadData = vi.fn<MockLoadDataFn>().mockResolvedValue({
      data: DEFAULT_TEST_DATA,
      rowCount: DEFAULT_TEST_DATA.length,
    });
    renderTableWithMockLoadData(mockLoadData);
    await openAdvancedFiltersDrawer(user);
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
    const mockCallStateBeforeClear = mockLoadData.mock.calls[0][0];
    await addThreeFilterRuleRowsWithValues();
    const allRuleRowsBeforeDelete = await screen.findAllByTestId(
      FILTER_RULE_ROW_TEST_ID,
    );
    expect(allRuleRowsBeforeDelete).toHaveLength(THREE_ROWS);

    const clearAllButton = screen.getByRole('button', { name: clear });
    await user.click(clearAllButton);
    const allRuleRowsAfterClear = screen.queryAllByTestId(
      FILTER_RULE_ROW_TEST_ID,
    );
    expect(allRuleRowsAfterClear).toHaveLength(0);
    const mockCallStateAfterClear =
      mockLoadData.mock.calls[mockLoadData.mock.calls.length - 1][0];

    // The state passed to loadData after clearing filters should have an empty advancedFilters array
    // The state passed to the last loadData call must equal the state from the very first call —
    // clicking the clear button resets draft filters without triggering a new loadData fetch
    expect(mockCallStateAfterClear).toEqual(mockCallStateBeforeClear);
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
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(
      await screen.findByTestId('active-filters-container'),
    ).toBeInTheDocument();

    const mockCalls = mockLoadData.mock.calls;
    const filtersFromLastMockCall = mockCalls[mockCalls.length - 1][0].filters;
    const loadDataFilterRulesValue = filtersFromLastMockCall.rules[0].value;
    expect(loadDataFilterRulesValue).toEqual(DUMMY_FILTER_VALUE);
  });
  it('should render QuickFilterBar after pin filter', async () => {
    expect(screen.queryByTestId('quick-filters-bar')).not.toBeInTheDocument();

    await addFilterRuleRowWithValue(user, DUMMY_FILTER_VALUE);
    await pinFirstRuleRow();
  });

  it('should hide QuickFilterBar after unpin filter', async () => {
    await addFilterRuleRowWithValue(user, DUMMY_FILTER_VALUE);
    const firstRuleRow = await pinFirstRuleRow();

    const unpinButton = within(firstRuleRow).getByRole('button', {
      name: unpin,
    });
    await user.click(unpinButton);

    expect(screen.queryByTestId('quick-filters-bar')).not.toBeInTheDocument();
  });
  it('should show same input value in both the drawer and the quick filter bar after pinning a rule row and apply advanced filters', async () => {
    await addFilterRuleRowWithValue(user, DUMMY_FILTER_VALUE);
    const firstRuleRow = await pinFirstRuleRow();

    // Extract the value from the text input inside the first rule row's value editor box
    const valueEditorBox = await within(firstRuleRow).findByTestId(
      FILTER_RULE_VALUE_TEST_ID,
    );
    const drawerRuleTextInput: HTMLInputElement =
      within(valueEditorBox).getByRole('textbox');
    const drawerRuleInputValue = drawerRuleTextInput.value;
    // Apply the filter and close the drawer
    await applyAdvancedFilter();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Verify the quick filter bar is still visible after the drawer closes
    const quickFilterBar = await screen.findByTestId('quick-filters-bar');
    expect(quickFilterBar).toBeInTheDocument();

    // Collect the values of all text inputs rendered inside the quick filter bar
    const allQuickFilterTextInputs: HTMLInputElement[] =
      within(quickFilterBar).getAllByRole('textbox');
    const allQuickFilterInputValues = allQuickFilterTextInputs.map(
      (input) => input.value,
    );
    expect(allQuickFilterInputValues).toContain(drawerRuleInputValue);
  });
  it('should hide quick filter bar after unpinning a quick filter but keep the rule row present in the drawer', async () => {
    await addFilterRuleRowWithValue(user, DUMMY_FILTER_VALUE);
    await pinFirstRuleRow();

    // Apply the filter and close the drawer
    await applyAdvancedFilter();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    const quickFilterBar = await screen.findByTestId('quick-filters-bar');
    const quickFilter = await screen.findByTestId('quick-filter');

    expect(quickFilterBar).toBeInTheDocument();
    expect(quickFilter).toBeInTheDocument();

    // Read the quick filter input value before unpinning so we can assert it is preserved in the drawer
    const quickFilterTextInput: HTMLInputElement =
      within(quickFilterBar).getByRole('textbox');
    const quickFilterInputValueBeforeUnpin = quickFilterTextInput.value;

    // Hover over the quick filter label row to reveal the unpin button
    fireEvent.mouseEnter(quickFilter);

    const unpinButton = await within(quickFilter).findByRole('button');
    expect(unpinButton).toBeInTheDocument();
    await user.click(unpinButton);
    await waitFor(() => {
      expect(quickFilterBar).not.toBeInTheDocument();
      expect(quickFilter).not.toBeInTheDocument();
    });

    await openAdvancedFiltersDrawer(user);
    const ruleRowValuesAfterRemoval = await getRuleRowValuesFromDrawer();

    // Verify the rule row value is still present in the drawer after unpinning the quick filter
    expect(ruleRowValuesAfterRemoval).toContain(
      quickFilterInputValueBeforeUnpin,
    );
  });
  it('should call loadData with the applied filter rules after submit on quick filter input', async () => {
    await addFilterRuleRowWithValue(user, DUMMY_FILTER_VALUE);
    await pinFirstRuleRow();

    await applyAdvancedFilter();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    // Type a new value into the quick filter bar to simulate user editing
    const { quickFilterLabel, quickFilterInputValue } =
      await replaceQuickFilterInputValue(user, UPDATED_QUICK_FILTER_VALUE);
    // Clear mock calls accumulated during apply and typing — only the Enter submit should be counted
    mockLoadData.mockClear();
    // Submit the quick filter input so the new value is committed and synced to the drawer rule row
    await user.keyboard('{Enter}');
    expect(mockLoadData).toHaveBeenCalledTimes(1);
    const activeFilterContainer = await screen.findByTestId(
      'active-filters-container',
    );
    expect(activeFilterContainer).toBeInTheDocument();
    const activeFilterItems =
      await screen.findAllByTestId('active-filter-item');
    expect(activeFilterItems.length).toBeGreaterThan(0);
    const activeFilterItemValues = activeFilterItems.map(
      (item) => item.textContent,
    );
    const mockDataFilterRuleValue =
      mockLoadData.mock.calls[mockLoadData.mock.calls.length - 1][0].filters
        .rules[0].value;

    expect(
      activeFilterItemValues.some(
        (itemValue) =>
          itemValue?.includes(quickFilterLabel) &&
          itemValue?.includes(quickFilterInputValue),
      ),
    ).toBe(true);

    expect(mockDataFilterRuleValue).toBe(quickFilterInputValue);
  });
});
