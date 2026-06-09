import { FILTER_RULE_VALUE_TEST_ID } from '../../../components/advanced-filters/MRT_AdvancedFiltersRuleRow';
import { screen, waitFor, within } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import { expect } from 'vitest';

const FILTER_RULE_ROW_TEST_ID = 'mrt-filter-rule-row';

export type DrawerRuleRowSubmitResult = {
  // The value that was typed into the first rule row input before submitting
  drawerRuleInputValue: string;
  // Reference to the text input element — useful for post-submit value assertions
  drawerRuleTextInput: HTMLInputElement;
};

// Clears the first rule row input, types the given value, submits via Enter, and waits for the drawer to close
export const updateFirstDrawerRuleRowValueAndSubmit = async (
  user: UserEvent,
  newValue: string,
): Promise<DrawerRuleRowSubmitResult> => {
  const allRuleRows = await screen.findAllByTestId(FILTER_RULE_ROW_TEST_ID);
  const firstRuleRow = allRuleRows[0];

  const valueEditorBox = await within(firstRuleRow).findByTestId(
    FILTER_RULE_VALUE_TEST_ID,
  );
  const drawerRuleTextInput: HTMLInputElement =
    within(valueEditorBox).getByRole('textbox');

  // Replace the existing rule row value with a new one
  await user.clear(drawerRuleTextInput);
  await user.type(drawerRuleTextInput, newValue);
  const drawerRuleInputValue = drawerRuleTextInput.value;

  expect(screen.getByRole('dialog')).toBeInTheDocument();
  // Pressing Enter commits the new value and closes the drawer
  await user.keyboard('{Enter}');
  await waitFor(() => {
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  return { drawerRuleInputValue, drawerRuleTextInput };
};
