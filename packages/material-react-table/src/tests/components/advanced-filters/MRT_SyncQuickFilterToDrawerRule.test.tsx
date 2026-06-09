import { FILTER_RULE_VALUE_TEST_ID } from '../../../components/advanced-filters/MRT_AdvancedFiltersRuleRow';
import {
  DEFAULT_PINNED_FILTER_STATE,
  DEFAULT_TEST_COLUMNS,
  DEFAULT_TEST_DATA,
  type MockRowData,
} from '../../data/mock-data';
import { replaceQuickFilterInputValue } from '../../utils/advanced-filters/replaceQuickFilterInputValue';
import { openAdvancedFiltersDrawer } from '../../utils/openAdvancedFiltersDrawer';
import { renderServerTable } from '../../utils/renderServerTable';
import { cleanup, screen, within } from '@testing-library/react';
import { type UserEvent } from '@testing-library/user-event';
import userEvent from '@testing-library/user-event/dist/cjs/index.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const FILTER_RULE_ROW_TEST_ID = 'mrt-filter-rule-row';

const UPDATED_QUICK_FILTER_VALUE = 'b';

describe('MRT_SyncQuickFilterToDrawerRule', () => {
  let user: UserEvent;

  beforeEach(() => {
    user = userEvent.setup({ delay: null });
    renderServerTable<MockRowData>({
      columns: DEFAULT_TEST_COLUMNS,
      data: DEFAULT_TEST_DATA,
      initialState: { filters: DEFAULT_PINNED_FILTER_STATE },
    });
  });

  afterEach(cleanup);

  it('should reflect quick filter input value in drawer rule row input after typing in the quick filter and submit', async () => {
    // Type a new value into the visible quick filter bar
    const { quickFilterInputValue } = await replaceQuickFilterInputValue(
      user,
      UPDATED_QUICK_FILTER_VALUE,
    );
    // Submit so the new value is committed and synced back to the drawer rule row
    await user.keyboard('{Enter}');

    // Open the drawer to inspect whether the rule row reflects the updated quick filter value
    await openAdvancedFiltersDrawer(user);

    const allRuleRows = await screen.findAllByTestId(FILTER_RULE_ROW_TEST_ID);
    const firstRuleRow = allRuleRows[0];
    const valueEditorBox = await within(firstRuleRow).findByTestId(
      FILTER_RULE_VALUE_TEST_ID,
    );
    const drawerRuleTextInput: HTMLInputElement =
      within(valueEditorBox).getByRole('textbox');

    // The drawer rule row input must now contain the value that was typed in the quick filter bar
    expect(drawerRuleTextInput.value).toBe(quickFilterInputValue);
  });
});
