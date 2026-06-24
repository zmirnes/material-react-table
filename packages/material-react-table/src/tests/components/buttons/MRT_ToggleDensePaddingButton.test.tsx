import { MaterialReactServerTable } from '../../../components/MaterialReactServerTable';
import { MRT_Localization_HR } from '../../../locales/hr';
import { type MRT_TableData, type MRT_TableState } from '../../../types';
import {
  DEFAULT_TEST_COLUMNS,
  DEFAULT_TEST_DATA,
  type MockRowData,
} from '../../data/mock-data';
import { renderServerTable } from '../../utils/renderServerTable';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

type MockLoadDataFn = (
  state: MRT_TableState<MockRowData>,
) => Promise<MRT_TableData<MockRowData>>;

const { densityCompact, densityComfortable, densityStandard, toggleDensity } =
  MRT_Localization_HR;

describe('MRT_ToggleDensePaddingButton', () => {
  it('should open density menu when density button is clicked', async () => {
    const user = userEvent.setup();

    renderServerTable<MockRowData>({
      columns: DEFAULT_TEST_COLUMNS,
      data: DEFAULT_TEST_DATA,
    });

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    const densityButton = await screen.findByRole('button', {
      name: toggleDensity,
    });

    await user.click(densityButton);

    const densityMenu = await screen.findByRole('menu');

    expect(
      within(densityMenu).getByRole('menuitem', { name: densityCompact }),
    ).toBeInTheDocument();
    expect(
      within(densityMenu).getByRole('menuitem', { name: densityStandard }),
    ).toBeInTheDocument();
    expect(
      within(densityMenu).getByRole('menuitem', { name: densityComfortable }),
    ).toBeInTheDocument();
  });

  it('should save updated density after selecting a density menu item', async () => {
    const user = userEvent.setup();
    const mockLoadData = vi.fn<MockLoadDataFn>().mockResolvedValue({
      data: DEFAULT_TEST_DATA,
      rowCount: DEFAULT_TEST_DATA.length,
    });
    const mockSaveState = vi.fn();

    render(
      <MaterialReactServerTable<MockRowData>
        loadConfig={async () => ({
          columns: DEFAULT_TEST_COLUMNS,
        })}
        loadData={mockLoadData}
        saveState={mockSaveState}
      />,
    );

    const densityButton = await screen.findByRole('button', {
      name: toggleDensity,
    });

    await user.click(densityButton);
    await user.click(
      await screen.findByRole('menuitem', { name: densityCompact }),
    );

    await waitFor(() => {
      const lastSavedState =
        mockSaveState.mock.calls[mockSaveState.mock.calls.length - 1][0];

      expect(lastSavedState.density).toBe('compact');
    });

    await user.click(densityButton);
    await user.click(
      await screen.findByRole('menuitem', { name: densityStandard }),
    );

    await waitFor(() => {
      const lastSavedState =
        mockSaveState.mock.calls[mockSaveState.mock.calls.length - 1][0];

      expect(lastSavedState.density).toBe('comfortable');
    });

    await user.click(densityButton);
    await user.click(
      await screen.findByRole('menuitem', { name: densityComfortable }),
    );

    await waitFor(() => {
      const lastSavedState =
        mockSaveState.mock.calls[mockSaveState.mock.calls.length - 1][0];

      expect(lastSavedState.density).toBe('spacious');
    });
  });
});
