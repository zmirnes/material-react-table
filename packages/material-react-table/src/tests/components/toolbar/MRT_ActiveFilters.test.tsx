import { MaterialReactServerTable } from '../../../components/MaterialReactServerTable';
import { MRT_Localization_HR } from '../../../locales/hr';
import { type MRT_FiltersState } from '../../../types';
import {
  DEFAULT_TEST_COLUMNS,
  DEFAULT_TEST_DATA,
  type MockRowData,
} from '../../data/mock-data';
import { renderServerTable } from '../../utils/renderServerTable';
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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

  it('should call loadData after clear button click and pass filters that differ from the filters passed before the active filter was removed', async () => {
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
    const mockCalls = mockLoadData.mock.calls;
    const callCountBeforeClear = mockCalls.length;
    const lastCallBeforeClear = mockCalls[callCountBeforeClear - 1][0];
    const loadDataFiltersBeforeClear: MRT_FiltersState =
      lastCallBeforeClear.filters;

    const clearButton = within(activeFiltersContainer).getByRole('button', {
      name: clear,
    });
    await user.click(clearButton);

    await waitFor(() => {
      expect(mockCalls.length).toBeGreaterThan(callCountBeforeClear);
    });

    const callCountAfterClear = mockCalls.length;
    const lastCallAfterClear = mockCalls[callCountAfterClear - 1][0];
    const loadDataFiltersAfterClear: MRT_FiltersState =
      lastCallAfterClear.filters;

    expect(loadDataFiltersAfterClear).not.toEqual(loadDataFiltersBeforeClear);
  });
  it('should call loadData with empty filter rules after all filters are cleared', async () => {
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
    const clearButton = within(activeFiltersContainer).getByRole('button', {
      name: clear,
    });
    // Reset the spy so only post-clear calls are counted
    mockLoadData.mockClear();

    await user.click(clearButton);

    // Wait for loadData to be invoked after the filter state update
    await waitFor(() => {
      expect(mockLoadData).toHaveBeenCalled();
    });

    const lastCallTableState =
      mockLoadData.mock.calls[mockLoadData.mock.calls.length - 1][0];

    expect(lastCallTableState.filters.rules).toHaveLength(0);
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
    const allFilterItems = within(activeFiltersContainer).getAllByTestId(
      'active-filter-item',
    );

    // Pick the clear button that belongs only to the first filter item
    const clearButtonOfFirstItem = within(allFilterItems[0]).getByRole(
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

    expect(lastCallTableState.filters.rules).toHaveLength(1);
  });
});
