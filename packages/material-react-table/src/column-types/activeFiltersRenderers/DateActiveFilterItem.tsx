import Typography from '@mui/material/Typography';
import MRT_ActiveFilterItemContainer from '../../components/toolbar/MRT_ActiveFilterItemContainer';
import {
  type MRT_FilterRule,
  type MRT_RowData,
  type MRT_TableInstance,
} from '../../types';
import dayjs from 'dayjs';

type DateRangeValue = {
  from: number | null;
  to: number | null;
};

const DATE_FORMAT = 'DD.MM.YYYY';

const formatDateValue = (value: number | null): string => {
  if (typeof value !== 'number') return '-';
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format(DATE_FORMAT) : '-';
};

const isDateRangeValue = (value: unknown): value is DateRangeValue => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  return 'from' in value && 'to' in value;
};

const DateActiveFilterItem = <TData extends MRT_RowData>(
  table: MRT_TableInstance<TData>,
  rule: MRT_FilterRule,
) => {
  if (typeof rule.value !== 'number' && !isDateRangeValue(rule.value)) {
    return null;
  }

  if (isDateRangeValue(rule.value)) {
    return (
      <MRT_ActiveFilterItemContainer table={table} rule={rule}>
        <Typography variant="body2">
          {`${formatDateValue(rule.value.from)} - ${formatDateValue(rule.value.to)}`}
        </Typography>
      </MRT_ActiveFilterItemContainer>
    );
  }

  return (
    <MRT_ActiveFilterItemContainer table={table} rule={rule}>
      <Typography variant="body2">{formatDateValue(rule.value)}</Typography>
    </MRT_ActiveFilterItemContainer>
  );
};

export default DateActiveFilterItem;
