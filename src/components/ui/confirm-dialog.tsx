"use client";

import React from "react";
import { Button } from "@mui/material";
import { MUIDialog } from "./mui-dialog";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: "primary" | "secondary" | "error" | "warning" | "info" | "success";
  destructive?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmColor = "primary",
  destructive = false,
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const actions = (
    <>
      <Button
        onClick={onClose}
        variant="outlined"
        color="inherit"
        size="medium"
      >
        {cancelText}
      </Button>
      <Button
        onClick={handleConfirm}
        variant="contained"
        color={destructive ? "error" : confirmColor}
        size="medium"
        autoFocus
      >
        {confirmText}
      </Button>
    </>
  );

  return (
    <MUIDialog
      open={open}
      onClose={onClose}
      title={title}
      actions={actions}
      maxWidth="xs"
      showCloseButton={false}
    >
      <div style={{ padding: "8px 0" }}>
        {message}
      </div>
    </MUIDialog>
  );
}
