import { MRT_Localization_HR } from '../../locales/hr';
import { screen, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect } from 'vitest';

const { apply } = MRT_Localization_HR;

// Clicks the apply button and waits for the advanced filters dialog to be removed from the DOM.
// Using { delay: null } to match the timing used across all tests.
export const applyAdvancedFilter = async () => {
  const user = userEvent.setup({ delay: null });

  const applyButton = await screen.findByRole('button', {
    name: apply,
  });
  expect(applyButton).toBeInTheDocument();

  await user.click(applyButton);

  // Wait for the dialog to fully close before returning —
  // the dialog removal is async and callers must not assert on it immediately after click
  await waitForElementToBeRemoved(() => screen.queryByRole('dialog'));
};
