import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { MRT_Localization_HR } from '../locales/hr';
import { type MRT_Localization } from '../types';

export interface MaterialReactServerTableErrorProps {
  description?: string;
  localization?: MRT_Localization;
  title?: string;
}

export const MaterialReactServerTableError = ({
  description,
  localization = MRT_Localization_HR,
  title,
}: MaterialReactServerTableErrorProps) => (
  <Paper
    data-testid="server-table-error"
    sx={{
      alignItems: 'center',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      height: '100%',
      justifyContent: 'center',
      minHeight: '12rem',
      px: '2rem',
      py: '3rem',
      textAlign: 'center',
    }}
  >
    <Box
      sx={(theme) => ({
        alignItems: 'center',
        backgroundColor: theme.palette.error.main + '14',
        borderRadius: '50%',
        color: theme.palette.error.main,
        display: 'flex',
        height: '4rem',
        justifyContent: 'center',
        width: '4rem',
      })}
    >
      <ErrorOutlineRoundedIcon sx={{ fontSize: '2.25rem' }} />
    </Box>

    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
      <Typography fontWeight={600} variant="h6">
        {title ?? localization.errorTitle}
      </Typography>
      <Typography
        color="text.secondary"
        sx={{ maxWidth: '28rem' }}
        variant="body2"
      >
        {description ?? localization.errorMessage}
      </Typography>
    </Box>
  </Paper>
);
