import { screen } from '@testing-library/react';
import type userEvent from '@testing-library/user-event';
import { expect } from 'vitest';

interface AdvancedFiltersDrawerLabels {
  showAdvancedFilters: string;
  add: string;
}
interface OpenAdvancedFiltersDrawerResult {
  addFilterButton: HTMLElement;
}

export const openAdvancedFiltersDrawer = async (
  user: ReturnType<typeof userEvent.setup>,
  labels: AdvancedFiltersDrawerLabels,
): Promise<OpenAdvancedFiltersDrawerResult> => {
  const filtersButton = await screen.findByRole('button', {
    name: labels.showAdvancedFilters,
  });
  expect(filtersButton).toBeInTheDocument();

  await user.click(filtersButton);

  const drawer = await screen.findByRole('dialog');
  expect(drawer).toBeInTheDocument();

  const addFilterButton = await screen.findByRole('button', {
    name: labels.add,
  });
  expect(addFilterButton).toBeInTheDocument();

  return { addFilterButton };
};
