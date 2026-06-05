import { MaterialReactServerTable } from '../../../components/MaterialReactServerTable';
import { MRT_Localization_HR } from '../../../locales/hr';
import { type MRT_FilterRule, type MRT_FiltersState } from '../../../types';
import {
  DEFAULT_TEST_COLUMNS,
  DEFAULT_TEST_DATA,
  type MockRowData,
} from '../../data/mock-data';
import { getRuleRowValuesFromDrawer } from '../../utils/getRuleRowValuesFromDrawer';
import { openAdvancedFiltersDrawer } from '../../utils/openAdvancedFiltersDrawer';
import { renderServerTable } from '../../utils/renderServerTable';
import {
  cleanup,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { clear, advancedFilters } = MRT_Localization_HR;
const INITIAL_FILTERS_WITH_TWO_RULES: MRT_FiltersState = {
  logicOperator: 'and',
  pinnedFilters: [],
  rules: [
    {
      columnId: 'firstName',
      id: 'test-rule-1',
      operator: 'contains',
      value: 'Alice',
    },
    {
      columnId: 'lastName',
      id: 'test-rule-2',
      operator: 'contains',
      value: 'Smith',
    },
  ],
};

const INITIAL_FILTERS_WITH_ONE_RULE: MRT_FiltersState = {
  logicOperator: 'and',
  pinnedFilters: [],
  rules: [
    {
      columnId: 'firstName',
      id: 'test-rule-1',
      operator: 'contains',
      value: 'Alice',
    },
  ],
};

describe('MRT_ActiveFilters', () => {
  const user = userEvent.setup();
  let activeFiltersContainer: HTMLElement;

  beforeEach(async () => {
    renderServerTable<MockRowData>({
      columns: DEFAULT_TEST_COLUMNS,
      data: DEFAULT_TEST_DATA,
      initialState: { filters: INITIAL_FILTERS_WITH_ONE_RULE },
    });
    activeFiltersContainer = await screen.findByTestId(
      'active-filters-container',
    );
  });

  afterEach(cleanup);

  it('should render active filters for currently active filters', () => {
    expect(activeFiltersContainer).toBeInTheDocument();
  });

  it('should remove active filters container with one filter item when clear button is clicked', async () => {
    // Verify the container holds exactly one filter item before clearing
    const activeFilterItems = within(activeFiltersContainer).getAllByTestId(
      'active-filter-item',
    );
    expect(activeFilterItems).toHaveLength(1);

    const clearActiveFilterButton = await within(
      activeFiltersContainer,
    ).findByRole('button', { name: clear });

    await user.click(clearActiveFilterButton);
    expect(activeFiltersContainer).not.toBeInTheDocument();
  });
});

describe('MRT_ActiveFilters — when multiple filter items are active', () => {
  const user = userEvent.setup();
  let activeFiltersContainer: HTMLElement;

  beforeEach(async () => {
    renderServerTable<MockRowData>({
      columns: DEFAULT_TEST_COLUMNS,
      data: DEFAULT_TEST_DATA,
      initialState: { filters: INITIAL_FILTERS_WITH_TWO_RULES },
    });
    activeFiltersContainer = await screen.findByTestId(
      'active-filters-container',
    );
  });

  afterEach(cleanup);

  it('should remove only the clicked filter item and keep the container when one of multiple items is cleared', async () => {
    const activeFilterItemsBeforeRemoval = within(
      activeFiltersContainer,
    ).getAllByTestId('active-filter-item');
    expect(activeFilterItemsBeforeRemoval).toHaveLength(2);

    const firstFilterItem = activeFilterItemsBeforeRemoval[0];
    const clearButtonOfFirstItem = within(firstFilterItem).getByRole('button', {
      name: clear,
    });

    await user.click(clearButtonOfFirstItem);

    expect(activeFiltersContainer).toBeInTheDocument();

    const activeFilterItemsAfterRemoval = within(
      activeFiltersContainer,
    ).getAllByTestId('active-filter-item');
    expect(activeFilterItemsAfterRemoval).toHaveLength(1);
  });
});

describe('MRT_ActiveFilters — loadData is triggered by filter changes', () => {
  const user = userEvent.setup();
  afterEach(cleanup);

  it('should call loadData without the cleared filter rule after clear button is clicked', async () => {
    const mockLoadData = vi.fn().mockResolvedValue({
      data: DEFAULT_TEST_DATA,
      rowCount: DEFAULT_TEST_DATA.length,
    });

    render(
      <MaterialReactServerTable<MockRowData>
        loadConfig={async () => ({
          columns: DEFAULT_TEST_COLUMNS,
          initialState: { filters: INITIAL_FILTERS_WITH_ONE_RULE },
        })}
        loadData={mockLoadData}
        saveState={async () => {}}
      />,
    );

    await screen.findByTestId('active-filters-container');
    const activeFiltersContainer = screen.getByTestId(
      'active-filters-container',
    );

    // Capture the only rule from initial state — this is the item that will be cleared
    const clearedFilterRule: MRT_FilterRule =
      INITIAL_FILTERS_WITH_ONE_RULE.rules[0];

    // Verify the filter rule is present in the last loadData call before clearing
    const lastCallBeforeClear =
      mockLoadData.mock.calls[mockLoadData.mock.calls.length - 1][0];
    const filterRulesBeforeClear: MRT_FilterRule[] =
      lastCallBeforeClear.filters.rules;
    expect(
      filterRulesBeforeClear.some((rule) => rule.id === clearedFilterRule.id),
    ).toBe(true);
    const clearButton = within(activeFiltersContainer).getByRole('button', {
      name: clear,
    });

    // Reset the spy so only post-clear calls are tracked
    mockLoadData.mockClear();

    await user.click(clearButton);

    await waitFor(() => {
      expect(mockLoadData).toHaveBeenCalled();
    });

    const lastCallAfterClear =
      mockLoadData.mock.calls[mockLoadData.mock.calls.length - 1][0];
    const filterRulesAfterClear: MRT_FilterRule[] =
      lastCallAfterClear.filters.rules;

    // Verify the cleared rule is no longer present among the active filter rules
    expect(
      filterRulesAfterClear.some((rule) => rule.id === clearedFilterRule.id),
    ).toBe(false);
  });

  it('should call loadData again after one of multiple active filters is removed', async () => {
    const mockLoadData = vi.fn().mockResolvedValue({
      data: DEFAULT_TEST_DATA,
      rowCount: DEFAULT_TEST_DATA.length,
    });

    render(
      <MaterialReactServerTable<MockRowData>
        loadConfig={async () => ({
          columns: DEFAULT_TEST_COLUMNS,
          initialState: { filters: INITIAL_FILTERS_WITH_TWO_RULES },
        })}
        loadData={mockLoadData}
        saveState={async () => {}}
      />,
    );

    await screen.findByTestId('active-filters-container');

    const activeFiltersContainer = screen.getByTestId(
      'active-filters-container',
    );

    // Capture the first rule from initial state — this is the item that will be removed
    const removedFilterRule: MRT_FilterRule =
      INITIAL_FILTERS_WITH_TWO_RULES.rules[0];

    // Verify the first filter rule is present in the last loadData call before removal
    const lastCallBeforeRemoval =
      mockLoadData.mock.calls[mockLoadData.mock.calls.length - 1][0];
    const filterRulesBeforeRemoval: MRT_FilterRule[] =
      lastCallBeforeRemoval.filters.rules;
    expect(
      filterRulesBeforeRemoval.some((rule) => rule.id === removedFilterRule.id),
    ).toBe(true);

    // Open the drawer and verify the removed rule's value is present among the rule rows
    await openAdvancedFiltersDrawer();
    const ruleRowValuesBeforeRemoval = await getRuleRowValuesFromDrawer();
    expect(ruleRowValuesBeforeRemoval).toContain(removedFilterRule.value);

    // Close the drawer so the active filter items are interactable again
    const closeDrawerButton = screen.getByRole('button', {
      name: advancedFilters,
    });
    await user.click(closeDrawerButton);
    await waitForElementToBeRemoved(() => screen.queryByRole('dialog'));

    // Re-query filter items after the drawer is closed to avoid stale element references
    const allActiveFilterItems = within(activeFiltersContainer).getAllByTestId(
      'active-filter-item',
    );

    // Pick the clear button that belongs only to the first filter item
    const clearButtonOfFirstItem = within(allActiveFilterItems[0]).getByRole(
      'button',
      { name: clear },
    );

    // Reset the spy so only post-removal calls are tracked
    mockLoadData.mockClear();

    await user.click(clearButtonOfFirstItem);

    await waitFor(() => {
      expect(mockLoadData).toHaveBeenCalled();
    });

    const lastCallTableState =
      mockLoadData.mock.calls[mockLoadData.mock.calls.length - 1][0];
    const filterRulesAfterRemoval: MRT_FilterRule[] =
      lastCallTableState.filters.rules;

    // Verify the removed rule is no longer present among the active filter rules
    expect(
      filterRulesAfterRemoval.some((rule) => rule.id === removedFilterRule.id),
    ).toBe(false);
    expect(filterRulesAfterRemoval).toHaveLength(1);

    // Open the drawer and verify the removed rule's value is absent from all rule rows
    await openAdvancedFiltersDrawer();
    const ruleRowValuesAfterRemoval = await getRuleRowValuesFromDrawer();
    // Verify the removed rule's value is no longer present in any drawer rule row
    expect(ruleRowValuesAfterRemoval).not.toContain(removedFilterRule.value);
  });
});
