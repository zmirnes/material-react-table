import { forwardRef } from 'react';
import Box from '@mui/material/Box';
import { type Theme } from '@mui/material/styles';

// Resolves a status color to a theme palette color when one matches (e.g. 'warning',
// 'error', 'success'), otherwise falls back to the raw value as a CSS color (e.g. '#d63031').
export const resolveStatusColor = (theme: Theme, color: string): string =>
  (theme.palette as unknown as Record<string, { main?: string } | undefined>)[
    color
  ]?.main ?? color;

// Small colored dot used to represent an icon column's status — meta.availableIcons
// only ever carries a color token/hex value, never an icon glyph name.
// Forwards its ref so it can be used directly as a MUI Tooltip child.
export const MRT_IconStatusDot = forwardRef<
  HTMLDivElement,
  { color: string; size?: number }
>(({ color, size = 12 }, ref) => (
  <Box
    ref={ref}
    sx={{
      bgcolor: (theme: Theme) => resolveStatusColor(theme, color),
      borderRadius: '50%',
      flexShrink: 0,
      height: size,
      width: size,
    }}
  />
));

MRT_IconStatusDot.displayName = 'MRT_IconStatusDot';
