import { screen, within } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import { expect } from 'vitest';

const QUICK_FILTERS_BAR_TEST_ID = 'quick-filters-bar';
const QUICK_FILTER_TEST_ID = 'quick-filter';

export type QuickFilterBarValues = {
  // The raw string value currently inside the quick filter text input
  quickFilterInputValue: string;
  // Combined column + operator label (e.g. "First Name contains"), with &nbsp; normalised to spaces
  quickFilterLabel: string;
};

// Clears the quick filter bar input, types the given value, and returns the typed value + label
export const replaceQuickFilterInputValue = async (
  user: UserEvent,
  newValue: string,
): Promise<QuickFilterBarValues> => {
  const quickFilterBar = await screen.findByTestId(QUICK_FILTERS_BAR_TEST_ID);
  expect(quickFilterBar).toBeInTheDocument();

  // The quick-filter div contains exactly two <span> elements: column label and operator label
  const quickFilter =
    await within(quickFilterBar).findByTestId(QUICK_FILTER_TEST_ID);
  const [columnLabelSpan, operatorLabelSpan] =
    quickFilter.querySelectorAll('span');

  // Replace the existing quick filter value with the new one
  const quickFilterTextInput: HTMLInputElement =
    within(quickFilterBar).getByRole('textbox');
  await user.clear(quickFilterTextInput);
  await user.type(quickFilterTextInput, newValue);

  return {
    quickFilterInputValue: quickFilterTextInput.value,
    // Replace non-breaking spaces (\u00a0 from &nbsp;) with regular spaces so string comparisons work correctly
    quickFilterLabel:
      `${columnLabelSpan?.textContent ?? ''}${operatorLabelSpan?.textContent ?? ''}`
        .replace(/\u00a0/g, ' ')
        .trim(),
  };
};
