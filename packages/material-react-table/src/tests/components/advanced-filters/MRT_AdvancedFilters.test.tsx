import { FILTER_RULE_VALUE_TEST_ID } from '../../../components/advanced-filters/MRT_AdvancedFiltersRuleRow';
import { MaterialReactServerTable } from '../../../components/MaterialReactServerTable';
import { MRT_Localization_HR } from '../../../locales/hr';
import {
  DEFAULT_TEST_COLUMNS,
  DEFAULT_TEST_DATA,
  type MockRowData,
} from '../../data/mock-data';
import { applyAdvancedFilter } from '../../utils/applyAdvancedFilter';
import { openAdvancedFiltersDrawer } from '../../utils/openAdvancedFiltersDrawer';
import { renderServerTable } from '../../utils/renderServerTable';
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
const DUMMY_FILTER_VALUE = 'a';
const THREE_ROWS = 3;

const findAndClickAddFilterButton = async (user: UserEvent) => {
  const addFilterButton = await screen.findByRole('button', { name: add });
  expect(addFilterButton).toBeInTheDocument();
  await user.click(addFilterButton);
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
  await findAndClickAddFilterButton(user);
  await typeValueIntoLastRuleRow(user, value);
};

describe('MRT_AdvancedFilters', async () => {
  let user: UserEvent;

  const addThreeFilterRuleRowsWithValues = async () => {
    await addFilterRuleRowWithValue(user, DUMMY_FILTER_VALUE);
    await addFilterRuleRowWithValue(user, DUMMY_FILTER_VALUE);
    await addFilterRuleRowWithValue(user, DUMMY_FILTER_VALUE);
  };

  beforeEach(async () => {
    user = userEvent.setup({ delay: null });
    renderServerTable<MockRowData>({
      columns: DEFAULT_TEST_COLUMNS,
      data: DEFAULT_TEST_DATA,
    });

    await openAdvancedFiltersDrawer();
  });

  // Unmount after each test so the next beforeEach starts with a clean DOM
  afterEach(cleanup);
  it('should render filter rule row after clicking the add filter button', async () => {
    await findAndClickAddFilterButton(user);

    const filterRuleRow = await findFirstFilterRuleRow();
    expect(filterRuleRow).toBeInTheDocument();
  });
  it('should render column, operator and value fields after clicking the add filter button', async () => {
    await findAndClickAddFilterButton(user);

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
    const EXPECTED_ROW_COUNT_AFTER_DELETE = 2;

    await addThreeFilterRuleRowsWithValues();

    const allRuleRowsBeforeDelete = await screen.findAllByTestId(
      FILTER_RULE_ROW_TEST_ID,
    );
    expect(allRuleRowsBeforeDelete).toHaveLength(THREE_ROWS);

    const firstRuleRow = allRuleRowsBeforeDelete[0];
    const deleteButtonOfFirstRow = within(firstRuleRow).getByRole('button', {
      name: clearFilter,
    });
    await user.click(deleteButtonOfFirstRow);

    const allRuleRowsAfterDelete = await screen.findAllByTestId(
      FILTER_RULE_ROW_TEST_ID,
    );
    expect(allRuleRowsAfterDelete).toHaveLength(
      EXPECTED_ROW_COUNT_AFTER_DELETE,
    );
  });

  it('should remove all filter rule rows after clicking the clear button', async () => {
    await addThreeFilterRuleRowsWithValues();

    const allRuleRowsBeforeClear = await screen.findAllByTestId(
      FILTER_RULE_ROW_TEST_ID,
    );
    expect(allRuleRowsBeforeClear).toHaveLength(THREE_ROWS);

    const clearAllButton = screen.getByRole('button', { name: clear });
    const drawerBeforeClear = screen.getByRole('dialog');
    await user.click(clearAllButton);

    // Clear removes all rule rows and closes the drawer
    await waitForElementToBeRemoved(drawerBeforeClear);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await openAdvancedFiltersDrawer();
    expect(screen.queryAllByTestId(FILTER_RULE_ROW_TEST_ID)).toHaveLength(0);
  });
});
describe('MRT_AdvancedFilters — loadData integration', () => {
  it('should call loadData with the applied filter rules after clicking the apply button', async () => {
    let user: UserEvent;

    const mockLoadData = vi.fn().mockResolvedValue({
      data: DEFAULT_TEST_DATA,
      rowCount: DEFAULT_TEST_DATA.length,
    });
    user = userEvent.setup({ delay: null });
    render(
      <MaterialReactServerTable
        loadConfig={async () => ({
          columns: DEFAULT_TEST_COLUMNS,
        })}
        loadData={mockLoadData}
        saveState={async () => {}}
      />,
    );

    await openAdvancedFiltersDrawer();
    await addFilterRuleRowWithValue(user, DUMMY_FILTER_VALUE);
    const filterRuleRow = await findFirstFilterRuleRow();

    const valueInput = await within(filterRuleRow).findByTestId(
      FILTER_RULE_VALUE_TEST_ID,
    );
    const enteredTextInput: HTMLInputElement =
      within(valueInput).getByRole('textbox');
    const enteredValue = enteredTextInput.value;
    expect(enteredValue).toBe(DUMMY_FILTER_VALUE);

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
