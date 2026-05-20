import { MaterialReactTable } from '../../src';
import { faker } from '@faker-js/faker';
import { type Meta } from '@storybook/react-vite';

const meta: Meta = {
  title: 'Styling/Custom Column Widths',
};

export default meta;

const data = [...Array(21)].map(() => ({
  address: faker.location.streetAddress(),
  age: faker.number.int(80),
  firstName: faker.person.firstName(),
  id: faker.number.int(100),
  lastName: faker.person.lastName(),
}));

export const CustomWidthsSemantic = () => (
  <MaterialReactTable
    columns={[
      {
        accessorKey: 'id',
        header: 'ID',
        size: 50,
        type: 'string',
      },
      {
        accessorKey: 'firstName',
        header: 'First Name',
        size: 300,
        type: 'string',
      },
      {
        accessorKey: 'lastName',
        header: 'Last Name',
        size: 100,
        type: 'string',
      },
      {
        accessorKey: 'age',
        header: 'Age',
        size: 50,
        type: 'number',
      },
      {
        accessorKey: 'address',
        header: 'Address',
        type: 'string',
      },
    ]}
    data={data}
  />
);

export const CustomWidthsGrid = () => (
  <MaterialReactTable
    columns={[
      {
        accessorKey: 'id',
        header: 'ID',
        size: 50,
        type: 'string',
      },
      {
        accessorKey: 'firstName',
        header: 'First Name',
        size: 300,
        type: 'string',
      },
      {
        accessorKey: 'lastName',
        header: 'Last Name',
        size: 100,
        type: 'string',
      },
      {
        accessorKey: 'age',
        header: 'Age',
        size: 50,
        type: 'number',
      },
      {
        accessorKey: 'address',
        header: 'Address',
        type: 'string',
      },
    ]}
    data={data}
    layoutMode="grid"
  />
);

export const CustomWidthsGridNoGrow = () => (
  <MaterialReactTable
    columns={[
      {
        accessorKey: 'id',
        header: 'ID',
        size: 50,
        type: 'string',
      },
      {
        accessorKey: 'firstName',
        header: 'First Name',
        size: 300,
        type: 'string',
      },
      {
        accessorKey: 'lastName',
        header: 'Last Name',
        size: 100,
        type: 'string',
      },
      {
        accessorKey: 'age',
        header: 'Age',
        size: 50,
        type: 'number',
      },
      {
        accessorKey: 'address',
        header: 'Address',
        type: 'string',
      },
    ]}
    data={data}
    layoutMode="grid-no-grow"
  />
);

export const CustomWidthsGridNoGrowIndividualGrow = () => (
  <MaterialReactTable
    columns={[
      {
        accessorKey: 'id',
        header: 'ID',
        size: 50,
        type: 'string',
      },
      {
        accessorKey: 'firstName',
        header: 'First Name',
        size: 300,
        type: 'string',
      },
      {
        accessorKey: 'lastName',
        header: 'Last Name',
        size: 100,
        type: 'string',
      },
      {
        accessorKey: 'age',
        header: 'Age',
        size: 50,
        type: 'number',
      },
      {
        accessorKey: 'address',
        grow: true,
        header: 'Address',
        type: 'string',
      },
    ]}
    data={data}
    layoutMode="grid-no-grow"
  />
);

export const CustomWidthsGridIndividualShrink = () => (
  <MaterialReactTable
    columns={[
      {
        accessorKey: 'id',
        grow: false,
        header: 'ID',
        size: 50,
        type: 'string',
      },
      {
        accessorKey: 'firstName',
        header: 'First Name',
        size: 300,
        type: 'string',
      },
      {
        accessorKey: 'lastName',
        header: 'Last Name',
        size: 100,
        type: 'string',
      },
      {
        accessorKey: 'age',
        header: 'Age',
        size: 50,
        type: 'number',
      },
      {
        accessorKey: 'address',
        header: 'Address',
        type: 'string',
      },
    ]}
    data={data}
    layoutMode="grid"
  />
);

export const SmallWidthsSemantic = () => (
  <MaterialReactTable
    columns={[
      {
        accessorKey: 'id',
        header: 'ID',
        size: 10,
        type: 'string',
      },
      {
        accessorKey: 'firstName',
        header: 'First Name',
        size: 10,
        type: 'string',
      },
      {
        accessorKey: 'lastName',
        header: 'Last Name',
        size: 10,
        type: 'string',
      },
      {
        accessorKey: 'age',
        header: 'Age',
        size: 10,
        type: 'number',
      },
      {
        accessorKey: 'address',
        header: 'Address',
        size: 10,
        type: 'string',
      },
    ]}
    data={data}
  />
);

export const SmallWidthsGrid = () => (
  <MaterialReactTable
    columns={[
      {
        accessorKey: 'id',
        header: 'ID',
        size: 10,
        type: 'string',
      },
      {
        accessorKey: 'firstName',
        header: 'First Name',
        size: 10,
        type: 'string',
      },
      {
        accessorKey: 'lastName',
        header: 'Last Name',
        size: 10,
        type: 'string',
      },
      {
        accessorKey: 'age',
        header: 'Age',
        size: 10,
        type: 'number',
      },
      {
        accessorKey: 'address',
        header: 'Address',
        size: 10,
        type: 'string',
      },
    ]}
    data={data}
    layoutMode="grid"
  />
);

export const SmallWidthsGridNoGrow = () => (
  <MaterialReactTable
    columns={[
      {
        accessorKey: 'id',
        header: 'ID',
        size: 10,
        type: 'string',
      },
      {
        accessorKey: 'firstName',
        header: 'First Name',
        size: 10,
        type: 'string',
      },
      {
        accessorKey: 'lastName',
        header: 'Last Name',
        size: 10,
        type: 'string',
      },
      {
        accessorKey: 'age',
        header: 'Age',
        size: 10,
        type: 'number',
      },
      {
        accessorKey: 'address',
        header: 'Address',
        size: 10,
        type: 'string',
      },
    ]}
    data={data}
    layoutMode="grid-no-grow"
  />
);

export const SmallWidthsGridNoGrowIndividualGrow = () => (
  <MaterialReactTable
    columns={[
      {
        accessorKey: 'id',
        header: 'ID',
        size: 10,
        type: 'string',
      },
      {
        accessorKey: 'firstName',
        grow: 1,
        header: 'First Name',
        size: 10,
        type: 'string',
      },
      {
        accessorKey: 'lastName',
        grow: 1,
        header: 'Last Name',
        size: 10,
        type: 'string',
      },
      {
        accessorKey: 'age',
        header: 'Age',
        size: 80,
        type: 'number',
      },
      {
        accessorKey: 'address',
        header: 'Address',
        size: 200,
        type: 'string',
      },
    ]}
    data={data}
    layoutMode="grid-no-grow"
  />
);
