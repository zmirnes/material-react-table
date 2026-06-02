import { MRT_Localization_HR } from '../../../locales/hr';
import {
  DEFAULT_TEST_COLUMNS,
  DEFAULT_TEST_DATA,
  type MockRowData,
} from '../../data/mock-data';
import { openAdvancedFiltersDrawer } from '../../utils/openAdvancedFiltersDrawer';
import { renderServerTable } from '../../utils/renderServerTable';
import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { saveFilters } = MRT_Localization_HR;

describe('MRT_SaveFiltersInput', () => {
  beforeEach(async () => {
    renderServerTable<MockRowData>({
      columns: DEFAULT_TEST_COLUMNS,
      data: DEFAULT_TEST_DATA,
      onSaveFilters: vi.fn(),
    });
    await openAdvancedFiltersDrawer();
  });

  it('should render disabled save filters button when the drawer is open and no filter rules are added', async () => {
    expect(
      screen.queryByTestId('mrt-filter-rule-row-0'),
    ).not.toBeInTheDocument();

    const saveFiltersButton = await screen.findByRole('button', {
      name: saveFilters,
    });
    expect(saveFiltersButton).toBeDisabled();
  });
});
