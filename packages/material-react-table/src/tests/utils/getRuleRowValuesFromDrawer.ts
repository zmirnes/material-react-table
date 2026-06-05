import { FILTER_RULE_VALUE_TEST_ID } from '../../components/advanced-filters/MRT_AdvancedFiltersRuleRow';
import { screen, within } from '@testing-library/react';

// Identifier used to locate each filter rule row rendered inside the advanced filters drawer
const FILTER_RULE_ROW_TEST_ID = 'mrt-filter-rule-row';

export const getRuleRowValuesFromDrawer = async (): Promise<string[]> => {
  // Find every rule row that is currently rendered inside the drawer
  const allRuleRows = await screen.findAllByTestId(FILTER_RULE_ROW_TEST_ID);

  // Extract the text value from the value editor textbox of each rule row and return them
  return Promise.all(
    allRuleRows.map(async (ruleRow) => {
      const valueEditorBox = await within(ruleRow).findByTestId(
        FILTER_RULE_VALUE_TEST_ID,
      );
      const textInput: HTMLInputElement =
        within(valueEditorBox).getByRole('textbox');
      return textInput.value;
    }),
  );
};
