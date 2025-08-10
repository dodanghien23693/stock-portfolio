"use client";

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
  Slide,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { TransitionProps } from "@mui/material/transitions";

// Slide transition for mobile
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface MUIDialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | false;
  fullWidth?: boolean;
  fullScreen?: boolean;
  disableEscapeKeyDown?: boolean;
  disableBackdropClick?: boolean;
  showCloseButton?: boolean;
  sx?: any;
}

export function MUIDialog({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = "sm",
  fullWidth = true,
  fullScreen: fullScreenProp,
  disableEscapeKeyDown = false,
  disableBackdropClick = false,
  showCloseButton = true,
  sx,
}: MUIDialogProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const fullScreen = fullScreenProp || isMobile;

  const handleClose = (event: {}, reason: "backdropClick" | "escapeKeyDown") => {
    if (reason === "backdropClick" && disableBackdropClick) {
      return;
    }
    if (reason === "escapeKeyDown" && disableEscapeKeyDown) {
      return;
    }
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      fullScreen={fullScreen}
      TransitionComponent={fullScreen ? Transition : undefined}
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: fullScreen ? 0 : 2,
          margin: fullScreen ? 0 : 2,
          maxHeight: fullScreen ? "100%" : "calc(100% - 64px)",
        },
        "& .MuiBackdrop-root": {
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        },
        ...sx,
      }}
      // Ensure proper z-index for nested components like Autocomplete
      style={{ zIndex: 1300 }}
    >
      {title && (
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pb: 1,
          }}
        >
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          {showCloseButton && (
            <IconButton
              onClick={onClose}
              size="small"
              sx={{
                color: "grey.500",
                "&:hover": {
                  backgroundColor: "grey.100",
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </DialogTitle>
      )}

      <DialogContent
        sx={{
          padding: title ? "0 24px 24px 24px" : "24px",
          "&:first-of-type": {
            paddingTop: title ? 0 : "24px",
          },
        }}
      >
        {children}
      </DialogContent>

      {actions && (
        <DialogActions
          sx={{
            padding: "16px 24px 24px 24px",
            gap: 1,
          }}
        >
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
}
