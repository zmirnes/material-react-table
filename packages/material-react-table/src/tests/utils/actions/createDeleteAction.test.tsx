import { useMaterialReactTable } from '../../../hooks/useMaterialReactTable';
import { type CustomOnDeleteActionContext } from '../../../types/actions/actions.types';
import { createDeleteAction } from '../../../utils/actions/createDeleteAction';
import {
  act,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react';
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

  describe('default renderRow confirmation modal', () => {
    it('should keep the confirmation modal open until the async onDelete resolves', async () => {
      let resolveDelete: () => void = () => {};
      const onDeleteMock = vi.fn(
        () =>
          new Promise<void>((resolve) => {
            resolveDelete = resolve;
          }),
      );

      const action = createDeleteAction<TestRow>({ onDelete: onDeleteMock });

      render(action.renderRow?.({ table, row }));

      // Open the confirmation dialog
      await user.click(screen.getByRole('button'));
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();

      // Confirm delete — onDelete is now pending
      await user.click(screen.getByRole('button', { name: 'Delete' }));
      expect(onDeleteMock).toHaveBeenCalledTimes(1);

      // The modal must stay open (and show the deleting state) while the promise is pending
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Deleting...' }),
      ).toBeInTheDocument();

      // Only once onDelete resolves should the modal close
      resolveDelete();
      await waitFor(() =>
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument(),
      );
    });
  });

  describe('default renderToolbar confirmation modal (multi-row delete)', () => {
    it('should keep the confirmation modal open until the async onDelete resolves', async () => {
      const { result: multiResult } = renderHook(() =>
        useMaterialReactTable<TestRow>({
          columns: [{ accessorKey: 'id', header: 'ID', type: 'string' }],
          data: [{ id: 'row-1' }, { id: 'row-2' }],
          enableRowSelection: true,
        }),
      );
      const multiTable = multiResult.current;

      act(() => {
        multiTable.setRowSelection({ '0': true, '1': true });
      });

      let resolveDelete: () => void = () => {};
      const onDeleteMock = vi.fn(
        (_context: CustomOnDeleteActionContext<TestRow>) =>
          new Promise<void>((resolve) => {
            resolveDelete = resolve;
          }),
      );

      const action = createDeleteAction<TestRow>({ onDelete: onDeleteMock });

      render(action.renderToolbar?.({ table: multiTable }));

      // Open the confirmation dialog
      await user.click(screen.getByRole('button'));
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();

      // Confirm delete — onDelete is now pending, invoked with both selected rows
      await user.click(screen.getByRole('button', { name: 'Delete' }));
      expect(onDeleteMock).toHaveBeenCalledTimes(1);
      expect(onDeleteMock.mock.calls[0][0].rowsToDelete).toHaveLength(2);

      // The modal must stay open (and show the deleting state) while the promise is pending
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Deleting...' }),
      ).toBeInTheDocument();

      // Only once onDelete resolves should the modal close
      resolveDelete();
      await waitFor(() =>
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument(),
      );
    });
  });
});
