import { MRT_Localization_HR } from '../../locales/hr';
import { screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';

const { showAdvancedFilters } = MRT_Localization_HR;

export const openAdvancedFiltersDrawer = async (
  user: UserEvent = userEvent.setup({ delay: null }),
) => {
  const filtersButton = await screen.findByRole('button', {
    name: showAdvancedFilters,
  });
  await user.click(filtersButton);
};
