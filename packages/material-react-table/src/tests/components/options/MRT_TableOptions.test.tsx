import MRT_TableOptions from '../../../components/options/MRT_TableOptions';
import { useMaterialReactTable } from '../../../hooks/useMaterialReactTable';
import { MRT_Localization_EN } from '../../../locales/en';
import { render, renderHook, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

type TestRow = { id: string };

const TABLE_OPTIONS_LABEL = MRT_Localization_EN.tableOptions;
const RESET_STATE_LABEL = MRT_Localization_EN.resetState;

function createTable() {
  const { result } = renderHook(() =>
    useMaterialReactTable<TestRow>({
      columns: [{ accessorKey: 'id', header: 'ID', type: 'string' }],
      data: [{ id: 'row-1' }],
    }),
  );
  return result.current;
}

// Opens the options menu and returns the user event instance for further interactions
async function openOptionsMenu() {
  const user = userEvent.setup();
  const table = createTable();

  render(<MRT_TableOptions table={table} />);

  const iconButton = screen.getByRole('button', {
    name: TABLE_OPTIONS_LABEL,
  });
  await user.click(iconButton);

  await waitFor(() => {
    expect(screen.getByRole('menuitem')).toBeInTheDocument();
  });

  return { user };
}

describe('MRT_TableOptions', () => {
  it('should render the icon button with correct aria-label from localization', () => {
    const table = createTable();

    render(<MRT_TableOptions table={table} />);

    const optionButton = screen.getByRole('button', {
      name: TABLE_OPTIONS_LABEL,
    });
    expect(optionButton).toBeInTheDocument();
  });

  it('should use custom tooltipTitle when provided', () => {
    const table = createTable();
    const customTooltip = 'Custom Tooltip';

    render(<MRT_TableOptions table={table} tooltipTitle={customTooltip} />);

    const optionButton = screen.getByRole('button', { name: customTooltip });
    expect(optionButton).toBeInTheDocument();
  });

  it('should open the options menu when the button is clicked', async () => {
    await openOptionsMenu();

    expect(screen.getByRole('menuitem')).toBeInTheDocument();
  });

  it('should show reset state menu item inside the opened menu', async () => {
    await openOptionsMenu();

    expect(screen.getByText(RESET_STATE_LABEL)).toBeInTheDocument();
  });

  it('should close the menu when a menu item is clicked', async () => {
    const { user } = await openOptionsMenu();

    // Click the reset state menu item to close the menu
    const resetMenuItem = screen.getByText(RESET_STATE_LABEL);
    await user.click(resetMenuItem);

    await waitFor(() => {
      expect(screen.queryByRole('menuitem')).not.toBeInTheDocument();
    });
  });
});
