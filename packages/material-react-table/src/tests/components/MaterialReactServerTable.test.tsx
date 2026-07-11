import { createRef } from 'react';
import { MaterialReactServerTable } from '../../components/MaterialReactServerTable';
import { type MaterialReactServerTableHandle } from '../../components/MaterialReactServerTableInstance';
import {
  DEFAULT_TEST_COLUMNS,
  DEFAULT_TEST_DATA,
  type MockRowData,
} from '../data/mock-data';
import { renderServerTable } from '../utils/renderServerTable';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('MaterialReactServerTable', () => {
  describe('loading skeleton', () => {
    beforeEach(() => {
      renderServerTable<MockRowData>(
        {
          columns: DEFAULT_TEST_COLUMNS,
          data: DEFAULT_TEST_DATA,
        },
        { configDelay: 600 },
      );
    });

    afterEach(() => {
      cleanup();
    });

    it('should render the top toolbar and remove the skeleton once the config has loaded', async () => {
      expect(screen.getByTestId('server-table-skeleton')).toBeInTheDocument();

      await waitFor(() =>
        expect(
          screen.queryByTestId('server-table-skeleton'),
        ).not.toBeInTheDocument(),
      );
    });
  });

  describe('error screen', () => {
    beforeEach(() => {
      renderServerTable<MockRowData>(
        {
          columns: DEFAULT_TEST_COLUMNS,
          data: DEFAULT_TEST_DATA,
        },
        { failConfig: true },
      );
    });

    afterEach(() => {
      cleanup();
    });

    it('should render the error component when no config is loaded', async () => {
      const error = await screen.findByTestId('server-table-error');
      expect(error).toBeInTheDocument();
    });
  });

  describe('manual refetch', () => {
    afterEach(() => {
      cleanup();
    });

    it('should re-run loadData when refetch() is called via the imperative handle, without changing pagination/sorting/filters', async () => {
      const ref = createRef<MaterialReactServerTableHandle<MockRowData>>();
      const loadData = vi.fn().mockResolvedValue({
        data: DEFAULT_TEST_DATA,
        rowCount: DEFAULT_TEST_DATA.length,
      });

      render(
        <MaterialReactServerTable<MockRowData>
          ref={ref}
          loadConfig={async () => ({ columns: DEFAULT_TEST_COLUMNS })}
          loadData={loadData}
          saveState={async () => {}}
        />,
      );

      await waitFor(() => expect(loadData).toHaveBeenCalledTimes(1));

      ref.current!.refetch();

      await waitFor(() => expect(loadData).toHaveBeenCalledTimes(2));
    });

    it('should also expose refetch() directly on the table instance', async () => {
      const ref = createRef<MaterialReactServerTableHandle<MockRowData>>();
      const loadData = vi.fn().mockResolvedValue({
        data: DEFAULT_TEST_DATA,
        rowCount: DEFAULT_TEST_DATA.length,
      });

      render(
        <MaterialReactServerTable<MockRowData>
          ref={ref}
          loadConfig={async () => ({ columns: DEFAULT_TEST_COLUMNS })}
          loadData={loadData}
          saveState={async () => {}}
        />,
      );

      await waitFor(() => expect(loadData).toHaveBeenCalledTimes(1));

      ref.current!.table.refetch!();

      await waitFor(() => expect(loadData).toHaveBeenCalledTimes(2));
    });
  });
});
