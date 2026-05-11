import { useEffect, useState } from 'react';
import { createTheme } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import ThemeProvider from '../src/theme';
import { type Preview } from '@storybook/react';
import { DARK_MODE_EVENT_NAME } from 'storybook-dark-mode';
import { addons } from 'storybook/preview-api';

const channel = addons.getChannel();

const lightTheme = createTheme({
  palette: { mode: 'light' },
});

const darkTheme = createTheme({
  palette: { mode: 'dark' },
});

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },

    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },

    docs: {
      codePanel: true,
    },
  },
  decorators: [
    (Story, context) => {
      const [isDark, setDark] = useState(false);
      const theme = isDark ? darkTheme : lightTheme;

      useEffect(() => {
        const sbRoot = document.getElementsByClassName(
          'sb-show-main',
        )[0] as HTMLElement;
        channel.on(DARK_MODE_EVENT_NAME, setDark);
        if (sbRoot) {
          sbRoot.style.backgroundColor = theme.palette.background.default;
          sbRoot.style.height = '100%';
          sbRoot.style.padding = '0';
        }
        return () => channel.off(DARK_MODE_EVENT_NAME, setDark);
      }, [theme]);

      return (
        <ThemeProvider mode={isDark ? 'dark' : 'light'}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Story {...context} />
          </LocalizationProvider>
        </ThemeProvider>
      );
    },
  ],
};

export default preview;
