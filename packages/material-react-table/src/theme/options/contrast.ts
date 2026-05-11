import { customShadows } from '../custom-shadows';
import { grey } from '../palette';

// ----------------------------------------------------------------------

export function createContrast(
  contrast: 'default' | 'bold',
  mode: 'light' | 'dark',
) {
  const theme = {
    ...(contrast === 'bold' &&
      mode === 'light' && {
        palette: {
          background: {
            default: grey[200],
          },
        },
      }),
  };

  const components = {
    ...(contrast === 'bold' && {
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: customShadows(mode).z1,
          },
        },
      },
    }),
  };

  return {
    ...theme,
    components,
  };
}
