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
});
