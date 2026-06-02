import { FILTER_RULE_VALUE_TEST_ID } from '../../../components/advanced-filters/MRT_AdvancedFiltersRuleRow';
import { MRT_Localization_HR } from '../../../locales/hr';
import {
  DEFAULT_TEST_COLUMNS,
  DEFAULT_TEST_DATA,
  type MockRowData,
} from '../../data/mock-data';
import { openAdvancedFiltersDrawer } from '../../utils/openAdvancedFiltersDrawer';
import { renderServerTable } from '../../utils/renderServerTable';
import {
  cleanup,
  screen,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const { add, clear, columns, filterOperator, advancedFilters, clearFilter } =
  MRT_Localization_HR;

const FILTER_RULE_ROW_TEST_ID = 'mrt-filter-rule-row';
const DUMMY_FILTER_VALUE = 'a';
const THREE_ROWS = 3;

describe('MRT_AdvancedFilters', async () => {
  let user: ReturnType<typeof userEvent.setup>;

  const findAndClickAddFilterButton = async () => {
    const addFilterButton = await screen.findByRole('button', { name: add });
    expect(addFilterButton).toBeInTheDocument();
    await user.click(addFilterButton);
  };

  const findFirstFilterRuleRow = async () => {
    const allRuleRows = await screen.findAllByTestId(FILTER_RULE_ROW_TEST_ID);
    return allRuleRows[0];
  };

  // Types a value into the actual text input inside the value editor box of the last rule row
  const typeValueIntoLastRuleRow = async (value: string) => {
    const allRuleRows = await screen.findAllByTestId(FILTER_RULE_ROW_TEST_ID);
    const lastRuleRow = allRuleRows[allRuleRows.length - 1];
    // FILTER_RULE_VALUE_TEST_ID is a Box wrapper — find the actual textbox inside it
    const valueEditorBox = await within(lastRuleRow).findByTestId(
      FILTER_RULE_VALUE_TEST_ID,
    );
    const actualTextInput = within(valueEditorBox).getByRole('textbox');
    await user.type(actualTextInput, value);
  };

  const addFilterRuleRowWithValue = async (value: string) => {
    await findAndClickAddFilterButton();
    await typeValueIntoLastRuleRow(value);
  };

  const addThreeFilterRuleRowsWithValues = async () => {
    await addFilterRuleRowWithValue(DUMMY_FILTER_VALUE);
    await addFilterRuleRowWithValue(DUMMY_FILTER_VALUE);
    await addFilterRuleRowWithValue(DUMMY_FILTER_VALUE);
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
    await findAndClickAddFilterButton();

    const filterRuleRow = await findFirstFilterRuleRow();
    expect(filterRuleRow).toBeInTheDocument();
  });
  it('should render column, operator and value fields after clicking the add filter button', async () => {
    await findAndClickAddFilterButton();

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
