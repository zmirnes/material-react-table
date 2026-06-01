import { MRT_Localization_HR } from '../../../locales/hr';
import {
  DEFAULT_TEST_COLUMNS,
  DEFAULT_TEST_DATA,
  type MockRowData,
} from '../../data/mock-data';
import { renderServerTable } from '../../utils/renderServerTable';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

const { showAdvancedFilters, advancedFilters } = MRT_Localization_HR;
describe('MRT_ToggleAdvancedFiltersButton', () => {
  beforeEach(() => {
    renderServerTable<MockRowData>({
      columns: DEFAULT_TEST_COLUMNS,
      data: DEFAULT_TEST_DATA,
    });
  });
  it('render filters button correctly', async () => {
    const filtersButton = await screen.findByRole('button', {
      name: showAdvancedFilters,
    });

    expect(filtersButton).toBeInTheDocument();
  });
  it('render drawer after clicking on filters button', async () => {
    const user = userEvent.setup();
    const filtersButton = await screen.findByRole('button', {
      name: showAdvancedFilters,
    });
    await user.click(filtersButton);
    const drawer = await screen.findByRole('dialog');
    expect(drawer).toBeInTheDocument();

    const advancedFiltersHeading = await screen.findByRole('heading', {
      level: 6,
      name: advancedFilters,
    });
    expect(advancedFiltersHeading).toBeInTheDocument();
  });
});
