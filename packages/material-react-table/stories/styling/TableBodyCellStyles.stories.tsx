import { type MRT_ColumnDef, MaterialReactTable } from '../../src';
import { faker } from '@faker-js/faker';
import { type Meta } from '@storybook/react-vite';

const meta: Meta = {
  title: 'Styling/Style Table Body Cells',
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
    accessorKey: 'age',
    header: 'Age',
    type: 'number',
  },
  {
    accessorKey: 'address',
    header: 'Address',
    type: 'string',
  },
];
const data = [...Array(21)].map(() => ({
  address: faker.location.streetAddress(),
  age: faker.number.int(80),
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
}));

export const DefaultTableBodyCellStyles = () => (
  <MaterialReactTable columns={columns} data={data} />
);

export const StyleAllMuiTableBodyCell = () => (
  <MaterialReactTable
    columns={columns}
    data={data}
    muiTableBodyCellProps={{
      sx: {
        backgroundColor: 'rgba(52, 210, 235, 0.1)',
        borderRight: '1px solid rgba(224,224,224,1)',
      },
    }}
  />
);

export const StyleMuiTableBodyCellConditionallyIn1Column = () => (
  <MaterialReactTable
    columns={[
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
        accessorKey: 'age',
        header: 'Age',
        muiTableBodyCellProps: ({ cell }) => ({
          sx: {
            backgroundColor:
              cell.getValue<number>() > 40
                ? 'rgba(22, 184, 44, 0.5)'
                : undefined,
            fontWeight:
              cell.column.id === 'age' && cell.getValue<number>() > 40
                ? '700'
                : '400',
          },
        }),
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

export const CustomCellRender = () => (
  <MaterialReactTable
    columns={[
      {
        Cell: ({ cell }) => (
          <span style={{ fontStyle: 'italic' }}>{cell.getValue<string>()}</span>
        ),
        accessorKey: 'firstName',
        header: 'First Name',
        type: 'string',
      },
      {
        Cell: ({ cell }) => (
          <span style={{ color: 'red' }}>{cell.getValue<string>()}</span>
        ),
        accessorKey: 'lastName',
        header: 'Last Name',
        type: 'string',
      },
      {
        Cell: ({ cell }) => (
          <span
            style={{
              backgroundColor:
                cell.column.id === 'age' && cell.getValue<number>() > 40
                  ? 'rgba(22, 184, 44, 0.5)'
                  : undefined,
              fontStyle: 'italic',
              padding: '0.5rem',
            }}
          >
            {cell.getValue<string>()}
          </span>
        ),
        accessorKey: 'age',
        header: 'Age',
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
