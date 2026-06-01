import { MRT_Localization_HR } from '../../../locales/hr';
import { type MRT_FiltersState } from '../../../types';
import {
  DEFAULT_TEST_COLUMNS,
  DEFAULT_TEST_DATA,
  type MockRowData,
} from '../../data/mock-data';
import { renderServerTable } from '../../utils/renderServerTable';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

const { clear } = MRT_Localization_HR;
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
  beforeEach(() => {
    renderServerTable<MockRowData>({
      columns: DEFAULT_TEST_COLUMNS,
      data: DEFAULT_TEST_DATA,
      initialState: { filters: INITIAL_FILTERS_WITH_ONE_RULE },
    });
  });
  it('should render active filters for currently active filters', async () => {
    const activeFiltersContainer = await screen.findByTestId(
      'active-filters-container',
    );
    expect(activeFiltersContainer).toBeInTheDocument();
  });
  it('should remove active filters container when clear active filter button is clicked', async () => {
    const activeFiltersContainer = await screen.findByTestId(
      'active-filters-container',
    );
    // Verify the container holds exactly one filter item before clearing
    const activeFilterItems = within(activeFiltersContainer).getAllByTestId(
      'active-filter-item',
    );
    expect(activeFilterItems).toHaveLength(1);
    const clearActiveFilterButton = await within(
      activeFiltersContainer,
    ).findByRole('button', {
      name: clear,
    });
    await user.click(clearActiveFilterButton);
    expect(activeFiltersContainer).not.toBeInTheDocument();
  });
});
