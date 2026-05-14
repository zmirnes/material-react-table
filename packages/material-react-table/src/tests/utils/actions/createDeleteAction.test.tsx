import { useMaterialReactTable } from '../../../hooks/useMaterialReactTable';
import { createDeleteAction } from '../../../utils/actions/createDeleteAction';
import { render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event/dist/cjs/index.js';
import { describe, expect, it, vi } from 'vitest';

type TestRow = { id: string };

const user = userEvent.setup();
describe('createDeleteAction', () => {
  const { result } = renderHook(() =>
    useMaterialReactTable<TestRow>({
      columns: [{ accessorKey: 'id', header: 'ID', type: 'string' }],
      data: [{ id: 'row-1' }],
    }),
  );
  const table = result.current;
  const row = table.getRowModel().rows[0];
  describe('renderRow', () => {
    it('should render the custom renderRow when it is provided', async () => {
      const action = createDeleteAction<TestRow>({
        renderRow: () => <button>Render row button</button>,
      });
      render(
        action.renderRow?.({
          table,
          row,
        }),
      );
      expect(
        screen.getByRole('button', { name: 'Render row button' }),
      ).toBeInTheDocument();
    });
  });

  describe('renderToolbar', () => {
    it('should render the custom renderToolbar when it is provided', async () => {
      const action = createDeleteAction<TestRow>({
        renderToolbar: () => <button>Render toolbar button</button>,
      });
      render(
        action.renderToolbar?.({
          table,
        }),
      );
      expect(
        screen.getByRole('button', { name: 'Render toolbar button' }),
      ).toBeInTheDocument();
    });
  });

  describe('customRenderRow', () => {
    it('should render the custom renderRow with onDelete wired when it is provided', async () => {
      const onDeleteMock = vi.fn();

      const action = createDeleteAction<TestRow>({
        onDelete: onDeleteMock,
        renderRow: ({ onDelete }) => (
          <button onClick={onDelete}>Render row button</button>
        ),
      });

      render(
        action.renderRow?.({
          table,
          row,
        }),
      );
      expect(
        screen.getByRole('button', { name: 'Render row button' }),
      ).toBeInTheDocument();
      const renderRowButton = screen.getByRole('button');
      await user.click(renderRowButton);

      expect(onDeleteMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('customRenderToolbar', () => {
    it('should render the custom renderToolbar with onDelete wired when it is provided', async () => {
      const onDeleteMock = vi.fn();

      const action = createDeleteAction<TestRow>({
        onDelete: onDeleteMock,
        renderToolbar: ({ onDelete }) => (
          <button onClick={onDelete}>Render toolbar button</button>
        ),
      });

      expect(
        screen.queryByRole('button', { name: 'Render toolbar button' }),
      ).not.toBeInTheDocument();
      render(
        action.renderToolbar?.({
          table,
        }),
      );
      expect(
        screen.getByRole('button', { name: 'Render toolbar button' }),
      ).toBeInTheDocument();
      const renderToolbarButton = screen.getByRole('button');
      await user.click(renderToolbarButton);

      expect(onDeleteMock).toHaveBeenCalledTimes(1);
    });
  });
});
