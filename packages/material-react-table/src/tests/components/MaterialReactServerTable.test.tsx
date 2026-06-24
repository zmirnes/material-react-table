import {
  DEFAULT_TEST_COLUMNS,
  DEFAULT_TEST_DATA,
  type MockRowData,
} from '../data/mock-data';
import { renderServerTable } from '../utils/renderServerTable';
import { cleanup, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

describe('MaterialReactServerTable', () => {
  describe('loading skeleton', () => {
    beforeEach(() => {
      renderServerTable<MockRowData>({
        columns: DEFAULT_TEST_COLUMNS,
        data: DEFAULT_TEST_DATA,
      });
    });

    afterEach(() => {
      cleanup();
    });

    it('should render the top toolbar and remove the skeleton once the config has loaded', async () => {
      expect(screen.getByTestId('server-table-skeleton')).toBeInTheDocument();
      expect(await screen.findByTestId('mrt-top-toolbar')).toBeInTheDocument();

      await waitFor(() =>
        expect(
          screen.queryByTestId('server-table-skeleton'),
        ).not.toBeInTheDocument(),
      );
    });
  });
});
