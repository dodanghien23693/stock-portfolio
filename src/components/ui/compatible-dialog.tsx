"use client";

import React from 'react';
import { MUIDialog } from './mui-dialog';
import { MUIThemeProvider } from './mui-theme-provider';
import { Button } from '@mui/material';

// Simple wrapper để thay thế Dialog pattern hiện tại
interface SimpleDialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | false;
}

export function SimpleDialog({
  open,
  onClose,
  title,
  description,
  children,
  actions,
  maxWidth = "sm"
}: SimpleDialogProps) {
  return (
    <MUIThemeProvider>
      <MUIDialog
        open={open}
        onClose={onClose}
        title={title}
        maxWidth={maxWidth}
        fullWidth
        actions={actions}
      >
        {description && (
          <div style={{ marginBottom: 16, color: '#666', fontSize: '14px' }}>
            {description}
          </div>
        )}
        {children}
      </MUIDialog>
    </MUIThemeProvider>
  );
}

// Export để dễ sử dụng
export { SimpleDialog as Dialog };
