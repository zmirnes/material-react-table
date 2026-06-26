import {
  DEFAULT_TEST_COLUMNS,
  DEFAULT_TEST_DATA,
  type MockRowData,
} from '../../data/mock-data';
import { renderServerTable } from '../../utils/renderServerTable';
import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

const TOP_TOOLBAR_TEST_ID = 'top-toolbar';
const CUSTOM_ACTION_LABEL = 'Custom top toolbar action';

describe('MRT_TopToolbar', () => {
  it('should render renderTopToolbarCustomActions content inside the top toolbar when provided', async () => {
    renderServerTable<MockRowData>({
      columns: DEFAULT_TEST_COLUMNS,
      data: DEFAULT_TEST_DATA,
      renderTopToolbarCustomActions: () => (
        <button type="button">{CUSTOM_ACTION_LABEL}</button>
      ),
    });

    const topToolbar = await screen.findByTestId(TOP_TOOLBAR_TEST_ID);
    expect(
      within(topToolbar).getByRole('button', {
        name: CUSTOM_ACTION_LABEL,
      }),
    ).toBeInTheDocument();
  });
});
