import { MaterialReactTable, type MRT_ColumnDef } from '../../src';
import { faker } from '@faker-js/faker';
import { type Meta } from '@storybook/react-vite';

const meta: Meta = {
  title: 'Fixed Bugs/Grid Layout',
};

export default meta;

type Person = {
  address: string;
  city: string;
  firstName: string;
  lastName: string;
  state: string;
};

const columns: MRT_ColumnDef<Person>[] = [
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
    accessorKey: 'address',
    header: 'Address',
    type: 'string',
  },
  {
    accessorKey: 'city',
    header: 'City',
    type: 'string',
  },
  {
    accessorKey: 'state',
    header: 'State',
    type: 'string',
  },
];

const data = [...Array(6)].map(() => ({
  address: faker.location.streetAddress(),
  city: faker.location.city(),
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  state: faker.location.state(),
}));

export const CenterAlignInGridLayoutMode = () => {
  return (
    <MaterialReactTable
      columns={columns}
      data={data}
      layoutMode="grid"
      muiTableBodyCellProps={{
        align: 'center',
      }}
      muiTableHeadCellProps={{
        align: 'center',
      }}
    />
  );
};

export const RightAlignInGridLayoutMode = () => {
  return (
    <MaterialReactTable
      columns={columns}
      data={data}
      layoutMode="grid"
      muiTableBodyCellProps={{
        align: 'right',
      }}
      muiTableHeadCellProps={{
        align: 'right',
      }}
    />
  );
};
