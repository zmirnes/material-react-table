import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import { useState } from 'react';
import { type MRT_RowData, type MRT_TableInstance } from '../../types';

export interface MRT_TotalRowsCounterProps<TData extends MRT_RowData> {
  table: MRT_TableInstance<TData>;
}

/**
 * Displays a button in the bottom toolbar that fetches and shows the exact
 * total row count from the server. Only rendered when `getTotalRows` is
 * provided via table options.
 *
 * Responsibilities:
 * - Call `options.getTotalRows` when clicked.
 * - Store the result locally and update the table's `rowCount` so pagination
 *   switches from "more than X" to the exact count.
 * - Show a loading state while the request is in-flight.
 */
export const MRT_TotalRowsCounter = <TData extends MRT_RowData>({
  table,
}: MRT_TotalRowsCounterProps<TData>) => {
  const {
    options: { getTotalRows, localization },
  } = table;

  const [isLoading, setIsLoading] = useState(false);
  const [totalRows, setTotalRows] = useState<number | undefined>(undefined);

  if (!getTotalRows) return null;

  const handleClick = async () => {
    setIsLoading(true);
    try {
      const count = await getTotalRows({ table });
      setTotalRows(count);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Tooltip title={localization.countRowsTooltip}>
      <span>
        <Button
          disabled={isLoading}
          onClick={handleClick}
          variant="soft"
          sx={{ width: 136, height: 36 }}
        >
          {isLoading ? (
            <CircularProgress size={16} color="inherit" />
          ) : totalRows !== undefined ? (
            `${localization.rowCount}: ${totalRows.toLocaleString(localization.language)}`
          ) : (
            localization.countRows
          )}
        </Button>
      </span>
    </Tooltip>
  );
};
