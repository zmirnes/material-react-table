import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper, { type PaperProps } from '@mui/material/Paper';
import Select from '@mui/material/Select';
import { MRT_ActiveFilters } from '../toolbar/MRT_ActiveFilters';
import { MRT_BottomToolbar } from '../toolbar/MRT_BottomToolbar';
import { MRT_QuickFiltersBar } from '../toolbar/MRT_QuickFiltersBar';
import { MRT_TopToolbar } from '../toolbar/MRT_TopToolbar';
import { MRT_TableContainer } from './MRT_TableContainer';
import { type MRT_RowData, type MRT_TableInstance } from '../../types';
import { parseFromValuesOrFunc } from '../../utils/utils';

export interface MRT_TablePaperProps<TData extends MRT_RowData>
  extends PaperProps {
  table: MRT_TableInstance<TData>;
}

export const MRT_TablePaper = <TData extends MRT_RowData>({
  table,
  ...rest
}: MRT_TablePaperProps<TData>) => {
  const {
    options: {
      enableBottomToolbar,
      enableTopToolbar,
      muiTablePaperProps,
      renderBottomToolbar,
      renderTopToolbar,
    },
    refs: { tablePaperRef },
  } = table;

  const paperProps = {
    ...parseFromValuesOrFunc(muiTablePaperProps, { table }),
    ...rest,
  };

  return (
    <Paper
      elevation={2}
      {...paperProps}
      ref={(ref: HTMLDivElement) => {
        tablePaperRef.current = ref;
        if (paperProps?.ref) {
          //@ts-expect-error
          paperProps.ref.current = ref;
        }
      }}
      style={{
        ...paperProps?.style,
      }}
      sx={(theme) => ({
        backgroundImage: 'unset',
        borderRadius: 0,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        transition: 'all 100ms ease-in-out',
        ...(parseFromValuesOrFunc(paperProps?.sx, theme) as Record<
          string,
          unknown
        >),
      })}
    >
      <FormControl>
        <InputLabel>Test</InputLabel>
        <Select>
          <MenuItem>Test 1</MenuItem>
          <MenuItem>Test 2</MenuItem>
          <MenuItem>Test 3</MenuItem>
        </Select>
      </FormControl>
      <MRT_QuickFiltersBar table={table} />
      <MRT_ActiveFilters table={table} />
      {enableTopToolbar &&
        (parseFromValuesOrFunc(renderTopToolbar, { table }) ?? (
          <MRT_TopToolbar table={table} />
        ))}
      <MRT_TableContainer table={table} />
      {enableBottomToolbar &&
        (parseFromValuesOrFunc(renderBottomToolbar, { table }) ?? (
          <MRT_BottomToolbar table={table} />
        ))}
    </Paper>
  );
};
