import { MRT_Localization_HR } from '../../locales/hr';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect } from 'vitest';

const { showAdvancedFilters } = MRT_Localization_HR;
export const openAdvancedFiltersDrawer = async () => {
  const user = userEvent.setup();

  const filtersButton = await screen.findByRole('button', {
    name: showAdvancedFilters,
  });
  expect(filtersButton).toBeInTheDocument();

  await user.click(filtersButton);

  const drawer = await screen.findByRole('dialog');
  expect(drawer).toBeInTheDocument();
};
