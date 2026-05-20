import { type MRT_ColumnDef, MaterialReactTable } from '../../src';
import { faker } from '@faker-js/faker';
import { type Meta } from '@storybook/react-vite';

const meta: Meta = {
  title: 'Features/Dense Padding Examples',
};

export default meta;

const columns: MRT_ColumnDef<(typeof data)[0]>[] = [
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
  {
    accessorKey: 'zipCode',
    header: 'Zip Code',
    type: 'string',
  },
  {
    accessorKey: 'phoneNumber',
    header: 'Phone Number',
    type: 'string',
  },
];

const data = [...Array(25)].map(() => ({
  address: faker.location.streetAddress(),
  city: faker.location.city(),
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  phoneNumber: faker.phone.number(),
  state: faker.location.state(),
  zipCode: faker.location.zipCode(),
}));

export const DensePaddingToggleEnabledDefault = () => (
  <MaterialReactTable columns={columns} data={data} />
);

export const DensePaddingDisabled = () => (
  <MaterialReactTable
    columns={columns}
    data={data}
    enableDensityToggle={false}
  />
);

export const DefaultToDensePadding = () => (
  <MaterialReactTable
    columns={columns}
    data={data}
    initialState={{
      density: 'compact',
      pagination: { pageIndex: 0, pageSize: 25 },
    }}
  />
);
