import Typography from '@mui/material/Typography';
import MRT_ActiveFilterItemContainer from '../../components/toolbar/MRT_ActiveFilterItemContainer';
import {
  type MRT_FilterRule,
  type MRT_RowData,
  type MRT_TableInstance,
} from '../../types';
import dayjs from 'dayjs';

type DateTimeRangeValue = {
  from: number | null;
  to: number | null;
};

const DATE_TIME_FORMAT = 'DD.MM.YYYY HH:mm';

const formatDateTimeValue = (value: number | null): string => {
  if (typeof value !== 'number') return '-';
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format(DATE_TIME_FORMAT) : '-';
};

const isDateTimeRangeValue = (value: unknown): value is DateTimeRangeValue => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  return 'from' in value && 'to' in value;
};

const DateTimeActiveFilterItem = <TData extends MRT_RowData>(
  table: MRT_TableInstance<TData>,
  rule: MRT_FilterRule,
) => {
  if (typeof rule.value !== 'number' && !isDateTimeRangeValue(rule.value)) {
    return null;
  }

  if (isDateTimeRangeValue(rule.value)) {
    return (
      <MRT_ActiveFilterItemContainer table={table} rule={rule}>
        <Typography variant="body2">
          {`${formatDateTimeValue(rule.value.from)} - ${formatDateTimeValue(rule.value.to)}`}
        </Typography>
      </MRT_ActiveFilterItemContainer>
    );
  }

  return (
    <MRT_ActiveFilterItemContainer table={table} rule={rule}>
      <Typography variant="body2">{formatDateTimeValue(rule.value)}</Typography>
    </MRT_ActiveFilterItemContainer>
  );
};

export default DateTimeActiveFilterItem;
