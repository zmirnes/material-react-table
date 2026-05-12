import DeleteRowAction from '../../../components/actions/DeleteRowAction';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

describe('DeleteRowAction', () => {
  /**
   * 1. render the component
   * 2. dialog does not exist
   * 3. user clicks the delete button
   * 4. dialog appears
   */
  it('should open confirmation dialog when delete icon button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnDeleteConfirm = vi.fn();
    render(<DeleteRowAction onDeleteConfirm={mockOnDeleteConfirm} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // The only interactive element rendered initially is the delete icon button
    const deleteIconButton = screen.getByRole('button');
    await user.click(deleteIconButton);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
