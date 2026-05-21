import { MRT_TableOptionsMenu } from '../../../components/options/MRT_TableOptionsMenu';
import { useMaterialReactTable } from '../../../hooks/useMaterialReactTable';
import { MRT_Localization_EN } from '../../../locales/en';
import { render, renderHook, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

type TestRow = { id: string };

const RESET_STATE_LABEL = MRT_Localization_EN.resetState;

function createTable(options?: { enableResetState?: boolean }) {
  const { result } = renderHook(() =>
    useMaterialReactTable<TestRow>({
      columns: [{ accessorKey: 'id', header: 'ID', type: 'string' }],
      data: [{ id: 'row-1' }],
      ...options,
    }),
  );
  return result.current;
}

function renderMenu({
  open = true,
  enableResetState,
}: { open?: boolean; enableResetState?: boolean } = {}) {
  const table = createTable(
    enableResetState !== undefined ? { enableResetState } : undefined,
  );
  const anchorEl = document.createElement('button');
  document.body.appendChild(anchorEl);
  const onClose = vi.fn();

  render(
    <MRT_TableOptionsMenu
      anchorEl={anchorEl}
      onClose={onClose}
      open={open}
      table={table}
    />,
  );

  return { table, onClose, anchorEl };
}

describe('MRT_TableOptionsMenu', () => {
  it('should render the menu when open is true', () => {
    renderMenu({ open: true });

    // MUI Menu renders a presentation container when open
    expect(screen.getByRole('presentation')).toBeInTheDocument();
  });

  it('should not render menu content when open is false', () => {
    renderMenu({ open: false });

    expect(screen.queryByRole('presentation')).not.toBeInTheDocument();
  });

  it('should render the reset state menu item by default', () => {
    renderMenu();

    expect(screen.getByText(RESET_STATE_LABEL)).toBeInTheDocument();
  });

  it('should not render the reset state menu item when enableResetState is false', () => {
    renderMenu({ enableResetState: false });

    expect(screen.queryByText(RESET_STATE_LABEL)).not.toBeInTheDocument();
  });

  it('should render a menu item when enableResetState is true explicitly', () => {
    renderMenu({ enableResetState: true });

    expect(screen.getByRole('menuitem')).toBeInTheDocument();
  });

  it('should pass custom menuProps to the Menu component', () => {
    const table = createTable();
    const anchorEl = document.createElement('button');
    document.body.appendChild(anchorEl);
    const onClose = vi.fn();
    const customClassName = 'custom-menu-class';

    render(
      <MRT_TableOptionsMenu
        anchorEl={anchorEl}
        onClose={onClose}
        open={true}
        table={table}
        menuProps={{ className: customClassName }}
      />,
    );

    const menuContainer = screen.getByRole('presentation');
    expect(menuContainer).toHaveClass(customClassName);
  });
});
