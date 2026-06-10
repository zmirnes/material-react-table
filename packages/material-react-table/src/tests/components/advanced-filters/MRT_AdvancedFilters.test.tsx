import { FILTER_RULE_VALUE_TEST_ID } from '../../../components/advanced-filters/MRT_AdvancedFiltersRuleRow';
import { MaterialReactServerTable } from '../../../components/MaterialReactServerTable';
import { MRT_Localization_HR } from '../../../locales/hr';
import {
  type MRT_SavedFilter,
  type MRT_TableData,
  type MRT_TableState,
} from '../../../types';
import {
  DEFAULT_TEST_COLUMNS,
  DEFAULT_TEST_DATA,
  type MockRowData,
} from '../../data/mock-data';
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
  discardChanges,
  saveFilters,
  filterName,
  savedFilters,
  or,
  and,
} = MRT_Localization_HR;

const FILTER_RULE_ROW_TEST_ID = 'mrt-filter-rule-row';
const DUMMY_FILTER_VALUE = 'some_value';
// Value used exclusively to verify that the quick filter bar syncs back to the drawer rule row
const UPDATED_QUICK_FILTER_VALUE = 'updated_quick_filter_value';
// Value used exclusively to verify that the drawer rule row syncs forward to the quick filter bar
const UPDATED_DRAWER_RULE_INPUT_VALUE = 'updated_drawer_rule_value';
const THREE_ROWS = 3;

type MockLoadDataFn = (
  state: MRT_TableState<MockRowData>,
) => Promise<MRT_TableData<MockRowData>>;

type MockSaveFiltersFn = (savedFilter: MRT_SavedFilter) => Promise<void>;

type RenderTableOptions = {
  onSaveFilters?: MockSaveFiltersFn;
};

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

type QuickFilterBarValues = {
  quickFilterInputValue: string;
  quickFilterLabel: string;
};

type DrawerRuleRowSubmitResult = {
  drawerRuleInputValue: string;
  drawerRuleTextInput: HTMLInputElement;
};

// Clears the first rule row input, types the given value, submits via Enter, and waits for the drawer to close
const updateFirstDrawerRuleRowValueAndSubmit = async (
  user: UserEvent,
  newValue: string,
): Promise<DrawerRuleRowSubmitResult> => {
  const firstRuleRow = await findFirstFilterRuleRow();
  const valueEditorBox = await within(firstRuleRow).findByTestId(
    FILTER_RULE_VALUE_TEST_ID,
  );
  const drawerRuleTextInput: HTMLInputElement =
    within(valueEditorBox).getByRole('textbox');

  // Replace the existing rule row value with a new one
  await user.clear(drawerRuleTextInput);
  await user.type(drawerRuleTextInput, newValue);
  const drawerRuleInputValue = drawerRuleTextInput.value;
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  // Pressing Enter commits the new value and closes the drawer
  await user.keyboard('{Enter}');
  await waitFor(() => {
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  return { drawerRuleInputValue, drawerRuleTextInput };
};

const replaceQuickFilterInputValue = async (
  user: UserEvent,
  newValue: string,
): Promise<QuickFilterBarValues> => {
  const quickFilterBar = await screen.findByTestId('quick-filters-bar');
  expect(quickFilterBar).toBeInTheDocument();

  // Find the quick filter item and extract the two label spans directly via DOM query —
  // the quick-filter div contains exactly two <span> elements: column label and operator label
  const quickFilter = await within(quickFilterBar).findByTestId('quick-filter');
  const [columnLabelSpan, operatorLabelSpan] =
    quickFilter.querySelectorAll('span');

  // Replace the existing quick filter value with the new one
  const quickFilterTextInput: HTMLInputElement =
    within(quickFilterBar).getByRole('textbox');
  await user.clear(quickFilterTextInput);
  await user.type(quickFilterTextInput, newValue);

  return {
    quickFilterInputValue: quickFilterTextInput.value,
    // Combine column label and operator label into a single display label (e.g. "Name contains").
    // Replace non-breaking spaces (\u00a0 from &nbsp;) with regular spaces so string comparisons work correctly.
    quickFilterLabel:
      `${columnLabelSpan?.textContent ?? ''}${operatorLabelSpan?.textContent ?? ''}`
        .replace(/\u00a0/g, ' ')
        .trim(),
  };
};

const renderTableWithMockLoadData = (
  mockLoadData: MockLoadDataFn,
  options?: RenderTableOptions,
) => {
  render(
    <MaterialReactServerTable<MockRowData>
      loadConfig={async () => ({
        columns: DEFAULT_TEST_COLUMNS,
      })}
      loadData={mockLoadData}
      onSaveFilters={options?.onSaveFilters}
      saveState={async () => {}}
    />,
  );
};

describe('MRT_AdvancedFilters', async () => {
  let user: UserEvent;
  let mockLoadData: ReturnType<typeof vi.fn<MockLoadDataFn>>;
  let mockSaveFilters: ReturnType<typeof vi.fn<MockSaveFiltersFn>>;

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
    mockSaveFilters = vi.fn<MockSaveFiltersFn>().mockResolvedValue(undefined);
    renderTableWithMockLoadData(mockLoadData, {
      onSaveFilters: mockSaveFilters,
    });
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

    await openAdvancedFiltersDrawer();
    const ruleRowValuesAfterRemoval = await getRuleRowValuesFromDrawer();

    // Verify the rule row value is still present in the drawer after unpinning the quick filter
    expect(ruleRowValuesAfterRemoval).toContain(
      quickFilterInputValueBeforeUnpin,
    );
  });
  it('should reflect drawer rule row input value in quick filter input after typing new value in rule row and submit', async () => {
    await addFilterRuleRowWithValue(user, DUMMY_FILTER_VALUE);
    await pinFirstRuleRow();

    // Replace the existing rule row value and submit — the drawer closes on Enter
    const { drawerRuleInputValue } =
      await updateFirstDrawerRuleRowValueAndSubmit(
        user,
        UPDATED_DRAWER_RULE_INPUT_VALUE,
      );
    // Verify the quick filter bar input now reflects the value that was typed in the drawer rule row
    const quickFilterBar = await screen.findByTestId('quick-filters-bar');
    const allQuickFilterTextInputs: HTMLInputElement[] =
      within(quickFilterBar).getAllByRole('textbox');
    const allQuickFilterInputValues = allQuickFilterTextInputs.map(
      (input) => input.value,
    );
    expect(allQuickFilterInputValues).toContain(drawerRuleInputValue);
  });
  it('should reflect quick filter input value in drawer rule row input after typing in the quick filter and submit', async () => {
    await addFilterRuleRowWithValue(user, DUMMY_FILTER_VALUE);
    await pinFirstRuleRow();

    // Apply the filter and close the drawer so the quick filter bar becomes the active control
    await applyAdvancedFilter();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    // Type a new value into the quick filter bar to simulate user editing
    const { quickFilterInputValue } = await replaceQuickFilterInputValue(
      user,
      UPDATED_QUICK_FILTER_VALUE,
    );
    await user.keyboard('{Enter}');

    // Re-open the drawer to inspect whether the rule row reflects the updated quick filter value
    await openAdvancedFiltersDrawer();

    const firstRuleRowAfterUpdate = await findFirstFilterRuleRow();
    const valueEditorBoxAfterUpdate = await within(
      firstRuleRowAfterUpdate,
    ).findByTestId(FILTER_RULE_VALUE_TEST_ID);
    const drawerRuleTextInputAfterUpdate: HTMLInputElement = within(
      valueEditorBoxAfterUpdate,
    ).getByRole('textbox');

    // The drawer rule row input must now contain the value that was typed in the quick filter bar
    expect(drawerRuleTextInputAfterUpdate.value).toBe(quickFilterInputValue);
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
  it('should discard changes in filters drawer after click on discard changes button', async () => {
    await addFilterRuleRowWithValue(user, DUMMY_FILTER_VALUE);

    // Replace the existing rule row value and submit — the drawer closes on Enter
    const { drawerRuleInputValue, drawerRuleTextInput } =
      await updateFirstDrawerRuleRowValueAndSubmit(
        user,
        UPDATED_DRAWER_RULE_INPUT_VALUE,
      );

    await openAdvancedFiltersDrawer();

    await addFilterRuleRowWithValue(user, 'test-input-1');
    await addFilterRuleRowWithValue(user, 'last-input-2');
    const ruleRowValuesFromDrawer = await getRuleRowValuesFromDrawer();

    const discardChangesButton = await screen.findByRole('button', {
      name: discardChanges,
    });

    await user.click(discardChangesButton);

    const drawerRuleInputValueAfterDiscardChanges = drawerRuleTextInput.value;
    const ruleRowValueFromDrawerAfterDiscardChanges =
      await getRuleRowValuesFromDrawer();

    expect(drawerRuleInputValue).toBe(drawerRuleInputValueAfterDiscardChanges);
    expect(ruleRowValuesFromDrawer).toContain(drawerRuleInputValue);
    expect(ruleRowValueFromDrawerAfterDiscardChanges).toContain(
      drawerRuleInputValue,
    );
    expect(ruleRowValueFromDrawerAfterDiscardChanges.length).toBeLessThan(
      ruleRowValuesFromDrawer.length,
    );
  });
  it('should save filter', async () => {
    await addFilterRuleRowWithValue(user, DUMMY_FILTER_VALUE);
    const saveFiltersButton = screen.getByRole('button', {
      name: saveFilters,
    });
    await waitFor(() => {
      expect(saveFiltersButton).toBeEnabled();
    });

    await user.click(saveFiltersButton);

    const filterNameInput = await screen.findByPlaceholderText(filterName);
    expect(filterNameInput).toBeInTheDocument();
    const savedFiltersName = 'Default filters';
    await user.type(filterNameInput, savedFiltersName);
    const saveInputWrapper = filterNameInput.parentElement!;
    const [confirmSaveButton, cancelSaveButton] =
      within(saveInputWrapper).getAllByRole('button');

    expect(confirmSaveButton).toBeInTheDocument();
    expect(cancelSaveButton).toBeInTheDocument();

    await user.click(confirmSaveButton);

    const closeDrawerButton = screen.getByRole('button', {
      name: advancedFilters,
    });

    await user.click(closeDrawerButton);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    const savedFiltersButton = await screen.findByRole('button', {
      name: savedFilters,
    });
    expect(savedFiltersButton).toBeInTheDocument();

    await user.click(savedFiltersButton);

    const savedFiltersMenu = await screen.findByRole('menu');
    expect(savedFiltersMenu).toBeInTheDocument();

    const savedFilterItem = screen.getByTestId('saved-filter-item');
    const savedFilterItemTextContent = savedFilterItem.textContent;
    expect(savedFilterItemTextContent).toBe(savedFiltersName);

    await user.click(savedFilterItem);
    const activeFilterItem = screen.getByTestId('active-filter-item');
    expect(activeFilterItem).toBeInTheDocument();
    expect(activeFilterItem.textContent).toContain(DUMMY_FILTER_VALUE);
  });
  it('should open listbox and switch logic operator between "i" (AND) and "ili" (OR)', async () => {
    await addFilterRuleRowWithValue(user, DUMMY_FILTER_VALUE);

    const logicOperatorWrapper = await screen.findByTestId('logic-operator');
    const logicOperatorCombobox =
      within(logicOperatorWrapper).getByRole('combobox');
    expect(logicOperatorCombobox).toBeInTheDocument();

    await user.click(logicOperatorCombobox);
    const listbox = await screen.findByRole('listbox');
    expect(listbox).toBeInTheDocument();
    expect(within(listbox).getByText(and)).toBeInTheDocument();
    expect(within(listbox).getByText(or)).toBeInTheDocument();

    await user.click(within(listbox).getByText(or));
    await waitFor(() => {
      expect(logicOperatorCombobox).toHaveTextContent(or);
    });
    await applyAdvancedFilter();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    const filtersStateAfterOrApply =
      mockLoadData.mock.calls[mockLoadData.mock.calls.length - 1][0].filters;
    expect(filtersStateAfterOrApply.logicOperator).toBe('or');

    await openAdvancedFiltersDrawer();

    const logicOperatorWrapperAfterReopen =
      await screen.findByTestId('logic-operator');
    const logicOperatorComboboxAfterReopen = within(
      logicOperatorWrapperAfterReopen,
    ).getByRole('combobox');

    await user.click(logicOperatorComboboxAfterReopen);
    const listboxAfterReopen = await screen.findByRole('listbox');
    await user.click(within(listboxAfterReopen).getByText(and));
    await waitFor(() => {
      expect(logicOperatorComboboxAfterReopen).toHaveTextContent(and);
    });
    await applyAdvancedFilter();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    const filtersStateAfterAndApply =
      mockLoadData.mock.calls[mockLoadData.mock.calls.length - 1][0].filters;
    expect(filtersStateAfterAndApply.logicOperator).toBe('and');
  });
});
