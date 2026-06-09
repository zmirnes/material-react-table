import { MaterialReactServerTable } from '../../../components/MaterialReactServerTable';
import { MRT_Localization_HR } from '../../../locales/hr';
import { type MRT_TableData, type MRT_TableState } from '../../../types';
import {
  DEFAULT_TEST_COLUMNS,
  DEFAULT_TEST_DATA,
  type MockRowData,
} from '../../data/mock-data';
import { addFilterRuleRowWithValue } from '../../utils/advanced-filters/addFilterRuleRowWithValue';
import { getRuleRowValuesFromDrawer } from '../../utils/getRuleRowValuesFromDrawer';
import { openAdvancedFiltersDrawer } from '../../utils/openAdvancedFiltersDrawer';
import { render, screen } from '@testing-library/react';
import { type UserEvent } from '@testing-library/user-event';
import userEvent from '@testing-library/user-event/dist/cjs/index.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

type MockLoadDataFn = (
  state: MRT_TableState<MockRowData>,
) => Promise<MRT_TableData<MockRowData>>;

const { discardChanges } = MRT_Localization_HR;
const renderTableWithMockLoadData = (mockLoadData: MockLoadDataFn) => {
  render(
    <MaterialReactServerTable<MockRowData>
      loadConfig={async () => ({
        columns: DEFAULT_TEST_COLUMNS,
      })}
      loadData={mockLoadData}
      saveState={async () => {}}
    />,
  );
};
describe('MRT_DiscardChange', () => {
  let user: UserEvent;
  const testInputValue = 'a';
  let mockLoadData: ReturnType<typeof vi.fn<MockLoadDataFn>>;

  beforeEach(async () => {
    user = userEvent.setup({ delay: null });
    mockLoadData = vi.fn<MockLoadDataFn>().mockResolvedValue({
      data: DEFAULT_TEST_DATA,
      rowCount: DEFAULT_TEST_DATA.length,
    });
    renderTableWithMockLoadData(mockLoadData);
    await openAdvancedFiltersDrawer(user);
  });
  it('should discard changes in filters drawer after click on discard changes button', async () => {
    // Add a filter rule row with a known value so we can verify it disappears after discard
    await addFilterRuleRowWithValue(user, testInputValue);

    // Capture the rule row values BEFORE discard — the typed value must be present
    const ruleRowValuesBeforeDiscard = await getRuleRowValuesFromDrawer();

    const discardChangesButton = await screen.findByRole('button', {
      name: discardChanges,
    });
    await user.click(discardChangesButton);

    // Capture the rule row values AFTER discard — the typed value must be gone
    const ruleRowValuesAfterDiscard = await getRuleRowValuesFromDrawer();

    // The added value must appear in the drawer before discarding
    expect(ruleRowValuesBeforeDiscard).toContain(testInputValue);
    // The row count must shrink after discarding the uncommitted row
    expect(ruleRowValuesAfterDiscard.length).toBeLessThan(
      ruleRowValuesBeforeDiscard.length,
    );
    // The typed value must no longer be present in the drawer after discard
    expect(ruleRowValuesAfterDiscard).not.toContain(testInputValue);
  });
});
