import { type PropsWithChildren } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import {
  type MRT_TableInstance,
  type MRT_RowData,
  type MRT_FilterRule,
  type MRT_FilterOperator,
} from '../..';
import { getFilterColumn } from '../advanced-filters/utils';

interface MRT_ActiveFilterItemContainerProps<TData extends MRT_RowData>
  extends PropsWithChildren {
  table: MRT_TableInstance<TData>;
  rule: MRT_FilterRule;
}

export const convertDateTimeOperatorToPascalCase = (
  operator: MRT_FilterOperator,
) => {
  switch (operator) {
    case 'current-month':
      return 'CurrentMonth';
    case 'current-week':
      return 'CurrentWeek';
    case 'from-today':
      return 'FromToday';
    case 'to-today':
      return 'ToToday';
    case 'last-7-days':
      return 'Last7Days';
    case 'last-week':
      return 'LastWeek';
    case 'last-month':
      return 'LastMonth';
    default:
      return operator;
  }
};

const MRT_ActiveFilterItemContainer = <TData extends MRT_RowData>({
  children,
  table,
  rule,
}: MRT_ActiveFilterItemContainerProps<TData>) => {
  const {
    options: {
      icons: { CloseIcon },
      localization,
    },
  } = table;

  const handleRemoveFilter = () => {
    table.setFilters((currentFilters) => ({
      ...currentFilters,
      rules: currentFilters.rules.filter(
        (currentRule) => currentRule.id !== rule.id,
      ),
    }));
  };

  const column = getFilterColumn(table, rule.columnId);

  const { operator } = rule;

  const pascalCaseOperator = convertDateTimeOperatorToPascalCase(operator);

  const localizationKey = `filter${pascalCaseOperator.charAt(0).toUpperCase()}${pascalCaseOperator.slice(1)}`;

  const localizedOperator = localization[localizationKey];

  const filterOperatorFormatted = localizedOperator?.toLowerCase() || operator;

  return (
    <Box
      p={0.5}
      sx={{
        alignItems: 'center',
        border: (theme) => `1px dashed ${theme.palette.divider}`,
        borderRadius: 1,
        display: 'flex',
        gap: 0.5,
      }}
    >
      <Box sx={{ alignItems: 'center', display: 'flex' }}>
        <Typography variant="body2" sx={{ mr: 0.5 }}>
          {`${column?.columnDef.header} ${filterOperatorFormatted}`}
        </Typography>
        {children}
      </Box>
      <Tooltip title={localization.clear}>
        <IconButton
          aria-label={localization.clear}
          onClick={handleRemoveFilter}
          size="small"
          sx={{ p: 0.25 }}
        >
          <CloseIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default MRT_ActiveFilterItemContainer;
