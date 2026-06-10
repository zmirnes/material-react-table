import { MaterialReactTable } from '../../src';
import { faker } from '@faker-js/faker';
import { type Meta } from '@storybook/react-vite';

const meta: Meta = {
  title: 'Fixed Bugs/mobile date pickers',
};

export default meta;

const data = [...Array(120)].map(() => ({
  arrivalTime: faker.date.recent(),
  birthDate: faker.date.birthdate({ max: 2020, min: 1980, mode: 'age' }),
  deliverySlot: faker.date.recent(),
  departureTime: faker.date.recent(),
  hireDate: faker.date.birthdate({ max: 2024, min: 2011, mode: 'age' }),
  startTime: faker.date.recent(),
}));

export const MobileDateTimePickers = () => (
  <MaterialReactTable
    columns={[
      {
        Cell: ({ cell }) => cell.getValue<Date>().toLocaleDateString(), //transform data to readable format for cell render
        accessorKey: 'birthDate',
        filterFn: 'lessThan',
        filterVariant: 'date',
        header: 'Birth Date',
        id: 'birthDate',
        type: 'string',
      },
      {
        Cell: ({ cell }) => cell.getValue<Date>().toLocaleDateString(), //transform data to readable format for cell render
        accessorKey: 'hireDate',
        filterVariant: 'date-range',
        header: 'Hire Date',
        id: 'hireDate',
        type: 'string',
      },
      {
        Cell: ({ cell }) => cell.getValue<Date>().toLocaleString(), //transform data to readable format for cell render
        accessorKey: 'departureTime',
        filterVariant: 'datetime',
        header: 'Departure',
        id: 'departureTime',
        type: 'string',
      },
      {
        Cell: ({ cell }) => cell.getValue<Date>().toLocaleString(), //transform data to readable format for cell render
        accessorKey: 'arrivalTime',
        filterVariant: 'datetime-range',
        header: 'Arrival time',
        id: 'arrivalTime',
        type: 'string',
      },
      {
        Cell: ({ cell }) => cell.getValue<Date>().toLocaleString(), //transform data to readable format for cell render
        accessorKey: 'startTime',
        filterVariant: 'time',
        header: 'Start Time',
        id: 'startTime',
        type: 'string',
      },
      {
        Cell: ({ cell }) => cell.getValue<Date>().toLocaleString(), //transform data to readable format for cell render
        accessorKey: 'deliverySlot',
        filterVariant: 'time-range',
        header: 'Delivery Slot',
        id: 'deliverySlot',
        type: 'string',
      },
    ]}
    data={data}
    initialState={{ showColumnFilters: true }}
  />
);
