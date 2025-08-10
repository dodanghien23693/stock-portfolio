"use client";

import React, { useState } from "react";
import { Button, Box, Typography, Chip } from "@mui/material";
import { MUIDialog } from "./mui-dialog";
import { MUIStockSelector } from "./mui-stock-selector";

interface DialogStockSelectorDemoProps {
  multiple?: boolean;
}

export function DialogStockSelectorDemo({
  multiple = false,
}: DialogStockSelectorDemoProps) {
  const [open, setOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<string | string[]>(
    multiple ? [] : ""
  );

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSave = () => {
    console.log("Selected stocks:", selectedStock);
    handleClose();
  };

  return (
    <Box>
      <Button variant="contained" onClick={handleOpen}>
        {multiple ? "Chọn nhiều cổ phiếu" : "Chọn cổ phiếu"}
      </Button>

      {/* Display selected stocks */}
      {selectedStock && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Đã chọn:
          </Typography>
          {multiple && Array.isArray(selectedStock) ? (
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {selectedStock.map((symbol) => (
                <Chip key={symbol} label={symbol} size="small" />
              ))}
            </Box>
          ) : (
            <Chip label={selectedStock} size="small" />
          )}
        </Box>
      )}

      <MUIDialog
        open={open}
        onClose={handleClose}
        title={multiple ? "Chọn các mã cổ phiếu" : "Chọn mã cổ phiếu"}
        maxWidth="md"
        actions={
          <>
            <Button onClick={handleClose} color="inherit">
              Hủy
            </Button>
            <Button onClick={handleSave} variant="contained">
              Lưu
            </Button>
          </>
        }
      >
        <Box sx={{ minHeight: 300, py: 2 }}>
          <MUIStockSelector
            value={selectedStock}
            onValueChange={setSelectedStock}
            multiple={multiple}
            placeholder={
              multiple
                ? "Tìm và chọn nhiều cổ phiếu..."
                : "Tìm và chọn cổ phiếu..."
            }
            label={multiple ? "Danh sách cổ phiếu" : "Mã cổ phiếu"}
            variant="outlined"
            size="medium"
          />

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Gõ tên hoặc mã cổ phiếu để tìm kiếm. Hệ thống sẽ tự động lọc kết quả
            phù hợp.
          </Typography>
        </Box>
      </MUIDialog>
    </Box>
  );
}

// Export both individual components and the demo
export { MUIDialog } from "./mui-dialog";
export { MUIStockSelector } from "./mui-stock-selector";
