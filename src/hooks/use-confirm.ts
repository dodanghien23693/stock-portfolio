"use client";

import { useState, useCallback } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
}

interface ConfirmState {
  open: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  destructive: boolean;
  onConfirm: () => void;
}

export function useConfirm() {
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    open: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    destructive: false,
    onConfirm: () => {},
  });

  const confirm = useCallback(
    (options: ConfirmOptions): Promise<boolean> => {
      return new Promise((resolve) => {
        setConfirmState({
          open: true,
          title: options.title,
          message: options.message,
          confirmText: options.confirmText || "Confirm",
          cancelText: options.cancelText || "Cancel",
          destructive: options.destructive || false,
          onConfirm: () => {
            resolve(true);
            setConfirmState(prev => ({ ...prev, open: false }));
          },
        });

        // Handle cancel/close
        const handleCancel = () => {
          resolve(false);
          setConfirmState(prev => ({ ...prev, open: false }));
        };

        // Store cancel handler for the dialog
        setConfirmState(prev => ({ ...prev, onCancel: handleCancel }));
      });
    },
    []
  );

  const handleClose = useCallback(() => {
    setConfirmState(prev => ({ ...prev, open: false }));
  }, []);

  const ConfirmComponent = (
    <ConfirmDialog
      open={confirmState.open}
      onClose={handleClose}
      onConfirm={confirmState.onConfirm}
      title={confirmState.title}
      message={confirmState.message}
      confirmText={confirmState.confirmText}
      cancelText={confirmState.cancelText}
      destructive={confirmState.destructive}
    />
  );

  return { confirm, ConfirmComponent };
}
