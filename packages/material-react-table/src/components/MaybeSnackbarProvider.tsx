import { type ReactNode } from 'react';
import { SnackbarProvider, useSnackbar } from 'notistack';

interface MaybeSnackbarProviderProps {
  children: ReactNode;
}

// Detects whether a real SnackbarProvider exists in the tree.
// In notistack's default context both enqueueSnackbar and closeSnackbar point to
// the same no-op reference. A real provider binds them to different functions.
const useHasSnackbarProvider = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  return enqueueSnackbar !== (closeSnackbar as unknown);
};

const Inner = ({ children }: MaybeSnackbarProviderProps) => {
  const hasProvider = useHasSnackbarProvider();
  if (hasProvider) return <>{children}</>;
  return (
    <SnackbarProvider
      maxSnack={5}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      {
        // Cast needed because notistack's bundled types predate a @types/react
        // 19.2 change to ReactPortal's shape, which they haven't caught up to
        // yet — this is a types-only mismatch, not an actual runtime issue.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        children as any
      }
    </SnackbarProvider>
  );
};

// Wraps children with SnackbarProvider only when no provider exists in the tree.
// When the user's app already has a SnackbarProvider, notifications from MRT
// will appear there — inheriting its position and styling.
export const MaybeSnackbarProvider = ({
  children,
}: MaybeSnackbarProviderProps) => <Inner>{children}</Inner>;
