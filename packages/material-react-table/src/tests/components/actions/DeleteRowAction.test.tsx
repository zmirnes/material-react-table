import DeleteRowAction from '../../../components/actions/DeleteRowAction';
import { useMaterialReactTable } from '../../../hooks/useMaterialReactTable';
import { render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

type TestRow = { id: string };
describe('DeleteRowAction', () => {
  const { result } = renderHook(() =>
    useMaterialReactTable<TestRow>({
      columns: [{ accessorKey: 'id', header: 'ID', type: 'string' }],
      data: [{ id: 'row-1' }],
    }),
  );
  const table = result.current;
  /**
   * 1. render the component
   * 2. dialog does not exist
   * 3. user clicks the delete button
   * 4. dialog appears
   */
  it('should open confirmation dialog when delete icon button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnDeleteConfirm = vi.fn();

    render(
      <DeleteRowAction onDeleteConfirm={mockOnDeleteConfirm} table={table} />,
    );

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();

    // The only interactive element rendered initially is the delete icon button
    const deleteIconButton = screen.getByRole('button');
    await user.click(deleteIconButton);

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });

  it('should not bubble clicks to an ancestor onClick (e.g. row onClick) — neither the delete icon nor the dialog buttons', async () => {
    const user = userEvent.setup();
    const mockOnDeleteConfirm = vi.fn();
    const mockRowClick = vi.fn();

    render(
      <div onClick={mockRowClick}>
        <DeleteRowAction onDeleteConfirm={mockOnDeleteConfirm} table={table} />
      </div>,
    );

    await user.click(screen.getByRole('button'));
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(mockRowClick).not.toHaveBeenCalled();

    await user.click(screen.getByText('Delete'));
    expect(mockOnDeleteConfirm).toHaveBeenCalled();
    expect(mockRowClick).not.toHaveBeenCalled();
  });
});
