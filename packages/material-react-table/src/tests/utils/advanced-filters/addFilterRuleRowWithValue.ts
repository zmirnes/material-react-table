import { FILTER_RULE_VALUE_TEST_ID } from '../../../components/advanced-filters/MRT_AdvancedFiltersRuleRow';
import { MRT_Localization_HR } from '../../../locales/hr';
import { screen, within } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event/dist/cjs/index.js';

const FILTER_RULE_ROW_TEST_ID = 'mrt-filter-rule-row';
const { add } = MRT_Localization_HR;
const clickAddFilterButton = async (user: UserEvent) => {
  await user.click(await screen.findByRole('button', { name: add }));
};
const typeValueIntoLastRuleRow = async (user: UserEvent, value: string) => {
  const allRuleRows = await screen.findAllByTestId(FILTER_RULE_ROW_TEST_ID);
  const lastRuleRow = allRuleRows[allRuleRows.length - 1];
  const valueEditorBox = await within(lastRuleRow).findByTestId(
    FILTER_RULE_VALUE_TEST_ID,
  );
  const actualTextInput = within(valueEditorBox).getByRole('textbox');
  await user.type(actualTextInput, value);
};
export const addFilterRuleRowWithValue = async (
  user: UserEvent,
  value: string,
) => {
  await clickAddFilterButton(user);
  await typeValueIntoLastRuleRow(user, value);
};
