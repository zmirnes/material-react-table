import { useState } from 'react';
import { type MRT_ColumnDef, MaterialReactTable } from '../../src';
import { faker } from '@faker-js/faker';
import { type Meta } from '@storybook/react-vite';

const meta: Meta = {
  title: 'Features/Full Screen Examples',
};

export default meta;

const columns: MRT_ColumnDef<(typeof data)[0]>[] = [
  {
    columns: [
      {
        accessorKey: 'firstName',
        header: 'First Name',
        type: 'string',
      },
      {
        accessorKey: 'lastName',
        header: 'Last Name',
        type: 'string',
      },
      {
        accessorKey: 'email',
        header: 'Email',
        type: 'string',
      },
    ],
    header: 'Employee',
    id: 'employee',
    type: 'string',
  },
  {
    columns: [
      {
        accessorKey: 'jobTitle',
        header: 'Job Title',
        type: 'string',
      },
      {
        accessorKey: 'salary',
        header: 'Salary',
        type: 'number',
      },
      {
        accessorKey: 'startDate',
        header: 'Start Date',
        type: 'date',
      },
    ],
    header: 'Job Info',
    id: 'jobInfo',
    type: 'string',
  },
];

const data = [...Array(128)].map(() => ({
  avatar: faker.image.avatar(),
  email: faker.internet.email(),
  firstName: faker.person.firstName(),
  jobTitle: faker.person.jobTitle(),
  lastName: faker.person.lastName(),
  salary: +faker.finance.amount({ dec: 0, max: 150000, min: 20000 }),
  signatureCatchPhrase: faker.company.catchPhrase(),
  startDate: faker.date.past({ years: 8 }).toLocaleDateString(),
}));

export const FullScreenToggleEnabledDefault = () => (
  <MaterialReactTable columns={columns} data={data} />
);

export const DisableFullScreenToggle = () => (
  <MaterialReactTable
    columns={columns}
    data={data}
    enableFullScreenToggle={false}
  />
);

export const DefaultFullScreenOn = () => (
  <MaterialReactTable
    columns={columns}
    data={data}
    initialState={{ isFullScreen: true }}
  />
);

export const ControlledFullScreen = () => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  return (
    <MaterialReactTable
      columns={columns}
      data={data}
      muiTableBodyCellProps={({ cell }) => ({
        title: cell.getValue<string>(),
      })}
      onIsFullScreenChange={setIsFullScreen}
      state={{ isFullScreen }}
    />
  );
};
