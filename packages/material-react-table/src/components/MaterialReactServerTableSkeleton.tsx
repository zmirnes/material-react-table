import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';

export const MaterialReactServerTableSkeleton = () => (
  <Paper
    data-testid="server-table-skeleton"
    sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    }}
  >
    {/* Top toolbar placeholder (global filter + internal action buttons) */}
    <Box
      sx={(theme) => ({
        alignItems: 'center',
        borderBottom: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        height: '4rem',
        justifyContent: 'space-between',
        paddingLeft: '1.3rem',
        paddingRight: '0.3rem',
      })}
    >
      <Box sx={{ alignItems: 'center', display: 'flex', gap: '0.5rem' }}>
        <Skeleton animation="wave" height={30} variant="rounded" width={73} />
        <Skeleton animation="wave" height={30} variant="rounded" width={80} />
        <Skeleton animation="wave" height={30} variant="rounded" width={67} />
        <Skeleton animation="wave" height={30} variant="rounded" width={135} />
      </Box>

      <Box sx={{ alignItems: 'center', display: 'flex', gap: '0.5rem' }}>
        <Skeleton animation="wave" height={24} variant="circular" width={24} />
      </Box>
    </Box>

    {/* Table body placeholder — fills the whole space between the toolbars */}
    <Box sx={{ display: 'flex', flex: 1, padding: '1.3rem' }}>
      <Skeleton
        animation="wave"
        variant="rounded"
        sx={{ flex: 1, height: '100%' }}
      />
    </Box>

    {/* Bottom toolbar placeholder (pagination) — pinned to the bottom */}
    <Box
      sx={(theme) => ({
        alignItems: 'center',
        borderTop: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        height: '3.30rem',
        justifyContent: 'flex-end',
        px: '1.3rem',
      })}
    >
      {/* Right pagination group (rows per page, range, prev/next) */}
      <Box sx={{ alignItems: 'center', display: 'flex', gap: '1rem' }}>
        <Skeleton animation="wave" height={36} variant="rounded" width={136} />
        <Skeleton animation="wave" height={31} variant="text" width={176} />
        <Skeleton animation="wave" height={22} variant="text" width={70} />
        <Skeleton animation="wave" height={24} variant="circular" width={24} />
        <Skeleton animation="wave" height={24} variant="circular" width={24} />
      </Box>
    </Box>
  </Paper>
);
