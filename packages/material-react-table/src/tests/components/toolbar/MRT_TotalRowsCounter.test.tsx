import { MRT_TotalRowsCounter } from '../../../components/toolbar/MRT_TotalRowsCounter';
import { useMaterialReactTable } from '../../../hooks/useMaterialReactTable';
import { MRT_Localization_EN } from '../../../locales/en';
import { type MRT_TableInstance } from '../../../types';
import { act, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

type TestRow = { id: string };

const COUNT_ROWS_LABEL = MRT_Localization_EN.countRows;

function createTable(
  getTotalRows?: (props: {
    table: MRT_TableInstance<TestRow>;
  }) => Promise<number>,
) {
  const { result } = renderHook(() =>
    useMaterialReactTable<TestRow>({
      columns: [{ accessorKey: 'id', header: 'ID', type: 'string' }],
      data: [{ id: 'row-1' }],
      getTotalRows,
    }),
  );
  return result.current;
}

describe('MRT_TotalRowsCounter', () => {
  const user = userEvent.setup();
  it('should not render the button when getTotalRows is not provided', () => {
    const table = createTable();
    const { container } = render(<MRT_TotalRowsCounter table={table} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('should render the button when getTotalRows is provided', () => {
    const mockGetTotalRows = vi.fn().mockResolvedValue(100);
    const table = createTable(mockGetTotalRows);

    render(<MRT_TotalRowsCounter table={table} />);

    const button = screen.getByRole('button', { name: COUNT_ROWS_LABEL });
    expect(button).toBeInTheDocument();
  });

  it('should show CircularProgress while loading and display row count after resolving', async () => {
    let resolveGetTotalRows: (value: number) => void;
    const mockGetTotalRows = vi.fn(
      () =>
        new Promise<number>((resolve) => {
          resolveGetTotalRows = resolve;
        }),
    );
    const table = createTable(mockGetTotalRows);

    render(<MRT_TotalRowsCounter table={table} />);

    const button = screen.getByRole('button', { name: COUNT_ROWS_LABEL });

    await act(async () => {
      await user.click(button);
    });

    // While the promise is pending, CircularProgress should be visible
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    // Resolve the promise to finish loading
    await act(async () => {
      resolveGetTotalRows(42);
    });

    // After resolving, CircularProgress should no longer be visible
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();

    // The button should now display the total row count text
    const expectedRowCountText = `${MRT_Localization_EN.rowCount}: ${(42).toLocaleString(MRT_Localization_EN.language)}`;
    expect(
      screen.getByRole('button', { name: expectedRowCountText }),
    ).toBeInTheDocument();
  });
});
