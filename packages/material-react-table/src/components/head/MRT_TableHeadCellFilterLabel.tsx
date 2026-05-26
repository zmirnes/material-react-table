import { type MouseEvent } from 'react';
import Box from '@mui/material/Box';
import Grow from '@mui/material/Grow';
import IconButton, { type IconButtonProps } from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import {
  type MRT_Header,
  type MRT_RowData,
  type MRT_TableInstance,
} from '../../types';
import {
  getColumnFilterInfo,
  useDropdownOptions,
} from '../../utils/column.utils';
import { getValueAndLabel, parseFromValuesOrFunc } from '../../utils/utils';

export interface MRT_TableHeadCellFilterLabelProps<TData extends MRT_RowData>
  extends IconButtonProps {
  header: MRT_Header<TData>;
  table: MRT_TableInstance<TData>;
}

export const MRT_TableHeadCellFilterLabel = <TData extends MRT_RowData = {}>({
  header,
  table,
  ...rest
}: MRT_TableHeadCellFilterLabelProps<TData>) => {
  const {
    options: {
      columnFilterDisplayMode,
      icons: { FilterAltIcon },
      localization,
    },
    refs: { filterInputRefs },
    setShowColumnFilters,
  } = table;
  const { column } = header;
  const { columnDef } = column;

  const filterValue = column.getFilterValue() as [string, string] | string;

  const {
    currentFilterOption,
    isMultiSelectFilter,
    isRangeFilter,
    isSelectFilter,
  } = getColumnFilterInfo({ header, table });

  const dropdownOptions = useDropdownOptions({ header, table });

  const getSelectLabel = (index?: number) =>
    getValueAndLabel(
      dropdownOptions?.find(
        (option) =>
          getValueAndLabel(option).value ===
          (index !== undefined ? filterValue[index] : filterValue),
      ),
    ).label;

  const isFilterActive =
    (Array.isArray(filterValue) && filterValue.some(Boolean)) ||
    (!!filterValue && !Array.isArray(filterValue));

  const filterTooltip =
    columnFilterDisplayMode === 'popover' && !isFilterActive
      ? localization.filterByColumn?.replace(
          '{column}',
          String(columnDef.header),
        )
      : localization.filteringByColumn
          .replace('{column}', String(columnDef.header))
          .replace(
            '{filterType}',
            currentFilterOption
              ? (localization[
                  `filter${
                    currentFilterOption.charAt(0).toUpperCase() +
                    currentFilterOption.slice(1)
                  }` as keyof typeof localization
                ] as string)
              : '',
          )
          .replace(
            '{filterValue}',
            `"${
              Array.isArray(filterValue)
                ? (filterValue as [string, string])
                    .map((value, index) =>
                      isMultiSelectFilter ? getSelectLabel(index) : value,
                    )
                    .join(
                      `" ${isRangeFilter ? localization.and : localization.or} "`,
                    )
                : isSelectFilter
                  ? getSelectLabel()
                  : (filterValue as string)
            }"`,
          )
          .replace('" "', '');

  return (
    <>
      <Grow
        in={
          columnFilterDisplayMode === 'popover' ||
          (!!filterValue && !isRangeFilter) ||
          (isRangeFilter && (!!filterValue?.[0] || !!filterValue?.[1]))
        }
        unmountOnExit
      >
        <Box component="span" sx={{ flex: '0 0' }}>
          <Tooltip placement="top" title={filterTooltip}>
            <IconButton
              disableRipple
              onClick={(event: MouseEvent<HTMLButtonElement>) => {
                setShowColumnFilters(true);
                queueMicrotask(() => {
                  filterInputRefs.current?.[`${column.id}-0`]?.focus?.();
                  filterInputRefs.current?.[`${column.id}-0`]?.select?.();
                });
                event.stopPropagation();
              }}
              size="small"
              {...rest}
              sx={(theme) => ({
                height: '16px',
                ml: '4px',
                opacity: isFilterActive ? 1 : 0.3,
                p: '8px',
                transform: 'scale(0.75)',
                transition: 'all 150ms ease-in-out',
                width: '16px',
                ...(parseFromValuesOrFunc(rest?.sx, theme) as Record<
                  string,
                  unknown
                >),
              })}
            >
              <FilterAltIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Grow>
    </>
  );
};
