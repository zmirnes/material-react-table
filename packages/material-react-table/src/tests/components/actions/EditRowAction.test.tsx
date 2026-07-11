import EditRowAction from '../../../components/actions/EditRowAction';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

describe('EditRowAction', () => {
  it('should render edit button and call handler on click', async () => {
    const user = userEvent.setup();
    const mockOnEditButtonClick = vi.fn();

    render(<EditRowAction onEditButtonClick={mockOnEditButtonClick} />);

    const editButton = screen.getByRole('button');
    expect(editButton).toBeInTheDocument();

    await user.click(editButton);
    expect(mockOnEditButtonClick).toHaveBeenCalled();
  });

  it('should not bubble the click to an ancestor onClick (e.g. row onClick)', async () => {
    const user = userEvent.setup();
    const mockOnEditButtonClick = vi.fn();
    const mockRowClick = vi.fn();

    render(
      <div onClick={mockRowClick}>
        <EditRowAction onEditButtonClick={mockOnEditButtonClick} />
      </div>,
    );

    await user.click(screen.getByRole('button'));

    expect(mockOnEditButtonClick).toHaveBeenCalled();
    expect(mockRowClick).not.toHaveBeenCalled();
  });
});
