import { MRT_Localization_HR } from '../../../locales/hr';
import { type MRT_FiltersState } from '../../../types';
import {
  DEFAULT_TEST_COLUMNS,
  DEFAULT_TEST_DATA,
  type MockRowData,
} from '../../data/mock-data';
import {
  isDomElementBefore,
  renderServerTable,
} from '../../utils/renderServerTable';
import { cleanup, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const { clear } = MRT_Localization_HR;
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

  it('should render active filters container above the table container', () => {
    const table = screen.getByRole('table');
    expect(isDomElementBefore(activeFiltersContainer, table)).toBe(true);
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
