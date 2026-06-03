import { MRT_Localization_HR } from '../../locales/hr';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect } from 'vitest';

const { apply } = MRT_Localization_HR;
export const applyAdvancedFilter = async () => {
  const user = userEvent.setup();

  const applyButton = await screen.findByRole('button', {
    name: apply,
  });
  expect(applyButton).toBeInTheDocument();

  await user.click(applyButton);
};
