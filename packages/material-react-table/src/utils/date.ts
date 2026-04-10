import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);

export const formatApiDate = (
  apiDate: { date: string; timezone: string },
  format: string = 'DD.MM.YYYY',
) => {
  const clean = apiDate.date.split('.')[0];

  return dayjs.tz(clean, apiDate.timezone).format(format);
};

export const formatApiDateTime = (
  apiDate: { date: string; timezone: string },
  format: string = 'DD.MM.YYYY HH:mm',
) => {
  const clean = apiDate.date.split('.')[0];
  return dayjs.tz(clean, apiDate.timezone).format(format);
};
