import { createTheme, ThemeProvider } from '@mui/material/styles';
import { MaterialReactTable, type MRT_ColumnDef } from '../../src';
import { faker } from '@faker-js/faker';
import { type Meta } from '@storybook/react-vite';

const meta: Meta = {
  title: 'Styling/Theming',
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

export const DefaultTheme = () => (
  <MaterialReactTable columns={columns} data={data} enableRowSelection />
);

export const CustomLightTheme = () => {
  const theme = createTheme({
    palette: {
      background: {
        default: '#ffffef',
      },
      primary: {
        main: '#ff9800',
      },
      secondary: {
        main: '#00bcd4',
      },
    },
  });
  return (
    <ThemeProvider theme={theme}>
      <MaterialReactTable columns={columns} data={data} enableRowSelection />
    </ThemeProvider>
  );
};

export const CustomDarkTheme = () => {
  const theme = createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#81980f',
      },
      secondary: {
        main: '#00bcd4',
      },
    },
  });
  return (
    <ThemeProvider theme={theme}>
      <MaterialReactTable columns={columns} data={data} enableRowSelection />
    </ThemeProvider>
  );
};
