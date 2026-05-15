import { useMaterialReactTable } from '../../../hooks/useMaterialReactTable';
import { createEditAction } from '../../../utils/actions/createEditAction';
import { render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event/dist/cjs/index.js';
import { describe, expect, it, vi } from 'vitest';

type TestRow = { id: string };

const user = userEvent.setup();

describe('createEditAction', () => {
  const { result } = renderHook(() =>
    useMaterialReactTable<TestRow>({
      columns: [{ accessorKey: 'id', header: 'ID', type: 'string' }],
      data: [{ id: 'row-1' }],
    }),
  );
  const table = result.current;
  const row = table.getRowModel().rows[0];

  describe('action name', () => {
    it('should return action name equal to "edit"', () => {
      const action = createEditAction<TestRow>({});
      expect(action.name).toBe('edit');
    });
  });

  describe('renderRow', () => {
    it('should render the default EditRowAction button when no custom renderRow is provided', () => {
      const action = createEditAction<TestRow>({});
      render(action.renderRow({ table, row }));
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should render the custom renderRow when it is provided', () => {
      const action = createEditAction<TestRow>({
        renderRow: () => <button>Custom edit row button</button>,
      });
      render(action.renderRow({ table, row }));

      expect(
        screen.getByRole('button', { name: 'Custom edit row button' }),
      ).toBeInTheDocument();
    });
  });

  describe('customRenderRow with onEdit wired', () => {
    it('should call onEdit when the custom renderRow button is clicked', async () => {
      const onEditMock = vi.fn();

      const action = createEditAction<TestRow>({
        onEdit: onEditMock,
        renderRow: ({ onEdit }) => (
          <button onClick={onEdit}>Custom edit row button</button>
        ),
      });

      render(action.renderRow({ table, row }));

      const customEditButton = screen.getByRole('button', {
        name: 'Custom edit row button',
      });
      expect(customEditButton).toBeInTheDocument();

      await user.click(customEditButton);

      expect(onEditMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('default edit behavior without editRowFn', () => {
    it('should call setNewEntryModal with open=true and mode=edit when no editRowFn is configured', async () => {
      const setNewEntryModalSpy = vi.spyOn(table, 'setNewEntryModal');

      const action = createEditAction<TestRow>({});
      render(action.renderRow({ table, row }));

      const defaultEditButton = screen.getByRole('button');
      await user.click(defaultEditButton);

      expect(setNewEntryModalSpy).toHaveBeenCalledWith({
        open: true,
        mode: 'edit',
      });

      setNewEntryModalSpy.mockRestore();
    });
  });

  describe('default edit behavior with editRowFn', () => {
    it('should call editRowFn when it is configured on table options', async () => {
      const editRowFnMock = vi.fn();

      // Re-initialize table with a custom editRowFn to verify the fn is called.
      const { result: resultWithEditFn } = renderHook(() =>
        useMaterialReactTable<TestRow>({
          columns: [{ accessorKey: 'id', header: 'ID', type: 'string' }],
          data: [{ id: 'row-1' }],
          editRowFn: editRowFnMock,
        }),
      );
      const tableWithEditFn = resultWithEditFn.current;
      const rowWithEditFn = tableWithEditFn.getRowModel().rows[0];

      const action = createEditAction<TestRow>({});
      render(action.renderRow({ table: tableWithEditFn, row: rowWithEditFn }));

      const defaultEditButton = screen.getByRole('button');
      await user.click(defaultEditButton);

      expect(editRowFnMock).toHaveBeenCalledTimes(1);
      expect(editRowFnMock).toHaveBeenCalledWith(
        expect.objectContaining({
          rowToEdit: rowWithEditFn,
          table: tableWithEditFn,
        }),
      );
    });
  });
});
