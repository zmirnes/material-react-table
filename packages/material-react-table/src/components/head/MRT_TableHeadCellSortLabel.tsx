import Badge from '@mui/material/Badge';
import TableSortLabel, {
  type TableSortLabelProps,
} from '@mui/material/TableSortLabel';
import Tooltip from '@mui/material/Tooltip';
import {
  type MRT_Header,
  type MRT_RowData,
  type MRT_TableInstance,
} from '../../types';
import { getCommonTooltipProps } from '../../utils/style.utils';
import { parseFromValuesOrFunc } from '../../utils/utils';
import { useState } from 'react';

export interface MRT_TableHeadCellSortLabelProps<TData extends MRT_RowData>
  extends TableSortLabelProps {
  header: MRT_Header<TData>;
  table: MRT_TableInstance<TData>;
}

export const MRT_TableHeadCellSortLabel = <TData extends MRT_RowData>({
  header,
  table,
  ...rest
}: MRT_TableHeadCellSortLabelProps<TData>) => {
  const {
    getState,
    options: {
      icons: { ArrowDownwardIcon, SyncAltIcon },
      localization,
    },
  } = table;
  const { column } = header;
  const { columnDef } = column;
  const { isLoading, showSkeletons, sorting } = getState();

  const isSorted = !!column.getIsSorted();
  const [isHovered, setIsHovered] = useState(false);
  const sortTooltip =
    isLoading || showSkeletons
      ? ''
      : column.getIsSorted()
        ? column.getIsSorted() === 'desc'
          ? localization.sortedByColumnDesc.replace(
              '{column}',
              columnDef.header,
            )
          : localization.sortedByColumnAsc.replace('{column}', columnDef.header)
        : column.getNextSortingOrder() === 'desc'
          ? localization.sortByColumnDesc.replace('{column}', columnDef.header)
          : localization.sortByColumnAsc.replace('{column}', columnDef.header);

  const direction = isSorted
    ? (column.getIsSorted() as 'asc' | 'desc')
    : undefined;

  return (
    <Tooltip {...getCommonTooltipProps('top')} title={sortTooltip}>
      <Badge
        badgeContent={sorting.length > 1 ? column.getSortIndex() + 1 : 0}
        overlap="circular"
      >
        <TableSortLabel
          IconComponent={
            !isSorted
              ? (props) => (
                  <SyncAltIcon
                    {...props}
                    direction={direction}
                    style={{
                      transform: 'rotate(-90deg) scaleX(0.9) translateX(-1px)',
                    }}
                  />
                )
              : ArrowDownwardIcon
          }
          active
          aria-label={sortTooltip}
          direction={direction}
          onClick={(e) => {
            e.stopPropagation();
            header.column.getToggleSortingHandler()?.(e);
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          {...rest}
          sx={(theme) => ({
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
            borderRadius: '50%',
            '.MuiTableSortLabel-icon': {
              color: `${
                theme.palette.mode === 'dark'
                  ? theme.palette.text.primary
                  : theme.palette.text.secondary
              } !important`,
              opacity: `${isSorted || isHovered ? 1 : 0.3} !important`,
            },
            flex: '0 0',
            width: '1.5rem',
            height: '1.5rem',
            justifyContent: 'center',
            ...(parseFromValuesOrFunc(rest?.sx, theme) as any),
          })}
        />
      </Badge>
    </Tooltip>
  );
};
