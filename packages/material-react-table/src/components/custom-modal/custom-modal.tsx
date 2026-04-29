import CancelIcon from '@mui/icons-material/Cancel';
import { Modal } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import { SxProps, Theme, useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import React, { ComponentProps } from 'react';

type TModalPosition = {
  vertical: 'top' | 'center' | 'bottom';
  horizontal: 'left' | 'center' | 'right';
  verticalOffset?: number;
  horizontalOffset?: number;
};

export interface CustomModalProps {
  children: React.ReactNode;
  title?: string;
  disableHeader?: boolean;
  open: boolean;
  onClose: () => void;
  position?: TModalPosition;
  modalProps?: Partial<ComponentProps<typeof Modal>>;
  contentContainerSx?: SxProps<Theme>;
  contentInnerContainerSx?: SxProps<Theme>;
  headerContainerSx?: SxProps<Theme>;
  headerComponents?: React.ReactNode;
}

const CustomModal = ({
  children,
  open,
  title,
  onClose,
  position,
  modalProps,
  contentContainerSx,
  contentInnerContainerSx,
  headerContainerSx,
  headerComponents,
  disableHeader = false,
}: CustomModalProps) => {
  const theme = useTheme();
  const getVerticalAlign = () => {
    if (!position) return 'top';
    if (position.vertical === 'top') return 'flex-start';
    if (position.vertical === 'center') return 'center';
    if (position.vertical === 'bottom') return 'flex-end';
    return 'center';
  };

  const getHorizontalAlign = () => {
    if (!position) return 'center';
    if (position.horizontal === 'left') return 'flex-start';
    if (position.horizontal === 'center') return 'center';
    if (position.horizontal === 'right') return 'flex-end';
    return 'center';
  };

  const getVerticalOffset = () => {
    if (!position?.verticalOffset) return 10;
    if (position?.verticalOffset > 100) return 100;
    if (position?.verticalOffset < -100) return -100;
    return position.verticalOffset;
  };

  const getHorizontalOffset = () => {
    if (!position?.horizontalOffset) return 0;
    if (position?.horizontalOffset > 100) return 100;
    if (position?.horizontalOffset < -100) return -100;
    return position.horizontalOffset;
  };

  const modalPosition = {
    display: 'flex',
    alignItems: getVerticalAlign(),
    justifyContent: getHorizontalAlign(),
  };

  const containerProps = contentContainerSx || {};
  const { sx: modalStyleProps, ...otherModalProps } = modalProps || {};

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{ maxHeight: '90%', zIndex: 1300, ...modalPosition, ...modalStyleProps }}
      {...otherModalProps}
      disableAutoFocus
    >
      <Stack
        sx={{
          position: 'relative',
          background: theme.palette.background.paper,
          top: `${getVerticalOffset()}%`,
          left: `${getHorizontalOffset()}%`,
          maxHeight: '90%',
          maxWidth: '90%',
          overflow: 'hidden',
          transition: '300ms',
          height: 'min-content',
          willChange: 'transform',
          borderRadius: 1,
          py: 1,
          ...containerProps,
        }}
      >
        {disableHeader ? null : (
          <Stack
            justifyContent="space-between"
            direction="row"
            alignItems="center"
            sx={{ px: 1, ...headerContainerSx }}
          >
            <Typography variant="h6">{title && title}</Typography>
            {headerComponents && headerComponents}
            <IconButton color="error" sx={{ ml: 'auto' }} onClick={onClose}>
              <CancelIcon />
            </IconButton>
          </Stack>
        )}
        <Stack overflow="auto" height="100%" px={2} sx={{ ...contentInnerContainerSx }}>
          {children}
        </Stack>
      </Stack>
    </Modal>
  );
};

export default CustomModal;
