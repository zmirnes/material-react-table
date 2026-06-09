import { type MRT_FiltersState } from '../../../types';
import {
  DEFAULT_TEST_COLUMNS,
  DEFAULT_TEST_DATA,
  type MockRowData,
} from '../../data/mock-data';
import { updateFirstDrawerRuleRowValueAndSubmit } from '../../utils/advanced-filters/updateFirstDrawerRuleRowValueAndSubmit';
import { openAdvancedFiltersDrawer } from '../../utils/openAdvancedFiltersDrawer';
import { renderServerTable } from '../../utils/renderServerTable';
import { cleanup, screen, within } from '@testing-library/react';
import { type UserEvent } from '@testing-library/user-event';
import userEvent from '@testing-library/user-event/dist/cjs/index.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

// Value used exclusively to verify that the quick filter bar syncs forward from the drawer rule row
const UPDATED_DRAWER_RULE_INPUT_VALUE = 'b';

// The first DEFAULT_TEST_COLUMNS column is 'firstName' — used as the preset rule's target column
const PRESET_RULE_ID = 'preset-rule-1';
const PRESET_RULE_COLUMN_ID = 'firstName';

// Pre-populated filter state: one rule with a single-character value, pinned to the quick filter bar.
// This replaces the addFilterRuleRowWithValue + pinFirstRuleRow UI steps, making the test faster.
const PINNED_FILTER_INITIAL_STATE: MRT_FiltersState = {
  logicOperator: 'and',
  rules: [
    {
      id: PRESET_RULE_ID,
      columnId: PRESET_RULE_COLUMN_ID,
      operator: 'contains',
      value: 'a',
    },
  ],
  pinnedFilters: [
    {
      id: PRESET_RULE_ID,
      columnId: PRESET_RULE_COLUMN_ID,
      operator: 'contains',
    },
  ],
};

describe('MRT_SyncDrawerRuleToQuickFilter', () => {
  let user: UserEvent;

  beforeEach(async () => {
    user = userEvent.setup({ delay: null });
    renderServerTable<MockRowData>({
      columns: DEFAULT_TEST_COLUMNS,
      data: DEFAULT_TEST_DATA,
      // initialState pre-populates the pinned rule — no UI clicks needed to set up
      initialState: { filters: PINNED_FILTER_INITIAL_STATE },
    });
    await openAdvancedFiltersDrawer(user);
  });

  afterEach(cleanup);

  it('should reflect drawer rule row input value in quick filter input after typing new value in rule row and submit', async () => {
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
});
