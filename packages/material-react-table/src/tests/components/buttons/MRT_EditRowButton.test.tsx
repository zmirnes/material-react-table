import MRT_EditRowButton from '../../../components/buttons/MRT_EditRowButton';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

describe('MRT_EditRowButton', () => {
  it('should render the edit icon button', () => {
    render(<MRT_EditRowButton />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should call onClick handler when the button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnClick = vi.fn();

    render(<MRT_EditRowButton onClick={mockOnClick} />);
    await user.click(screen.getByRole('button'));

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
});
