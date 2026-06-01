import { FILTER_RULE_VALUE_TEST_ID } from '../../../components/advanced-filters/MRT_AdvancedFiltersRuleRow';
import { MRT_Localization_HR } from '../../../locales/hr';
import {
  DEFAULT_TEST_COLUMNS,
  DEFAULT_TEST_DATA,
  type MockRowData,
} from '../../data/mock-data';
import { openAdvancedFiltersDrawer } from '../../utils/openAdvancedFiltersDrawer';
import { renderServerTable } from '../../utils/renderServerTable';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

const { showAdvancedFilters, add, columns, filterOperator } =
  MRT_Localization_HR;

const FILTER_RULE_ROW_BASE_TEST_ID = 'mrt-filter-rule-row';

describe('MRT_AdvancedFilters', () => {
  let user: ReturnType<typeof userEvent.setup>;
  let addFilterButton: HTMLElement;

  beforeEach(async () => {
    user = userEvent.setup();
    renderServerTable<MockRowData>({
      columns: DEFAULT_TEST_COLUMNS,
      data: DEFAULT_TEST_DATA,
    });

    // Opens the drawer and resolves the add-rule button in one reusable step
    ({ addFilterButton } = await openAdvancedFiltersDrawer(user, {
      showAdvancedFilters,
      add,
    }));
  });
  it('should render filter rule row after clicking the add filter button', async () => {
    await user.click(addFilterButton);

    const filterRuleRow = await screen.findByTestId(
      `${FILTER_RULE_ROW_BASE_TEST_ID}-0`,
    );
    expect(filterRuleRow).toBeInTheDocument();
  });
  it('should render column, operator and value fields after clicking the add filter button', async () => {
    await user.click(addFilterButton);

    const filterRuleRow = await screen.findByTestId(
      `${FILTER_RULE_ROW_BASE_TEST_ID}-0`,
    );

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
});
