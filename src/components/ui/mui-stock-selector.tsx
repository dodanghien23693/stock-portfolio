"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import {
  Autocomplete,
  TextField,
  Box,
  Typography,
  Chip,
  CircularProgress,
  Paper,
  Popper,
  IconButton,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Clear as ClearIcon } from "@mui/icons-material";

// Create a custom theme for Vietnamese language support
const theme = createTheme({
  typography: {
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
    ].join(","),
  },
});

interface Stock {
  id: string;
  symbol: string;
  name: string;
  exchange?: string;
  currentPrice?: number;
  changePercent?: number;
}

interface MUIStockSelectorProps {
  value?: string | string[];
  onValueChange: (value: string | string[]) => void;
  placeholder?: string;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  label?: string;
  variant?: "outlined" | "filled" | "standard";
  size?: "small" | "medium";
}

export function MUIStockSelector({
  value,
  onValueChange,
  placeholder = "Chọn mã cổ phiếu...",
  multiple = false,
  disabled = false,
  className,
  label = "Mã cổ phiếu",
  variant = "outlined",
  size = "small", // Changed default to small
}: MUIStockSelectorProps) {
  const [open, setOpen] = useState(false);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastSearchRef = useRef<string>("");

  // Memoize selected stocks to prevent unnecessary recalculations
  const selectedStocks = useMemo(() => {
    return stocks.filter((stock) => {
      if (multiple) {
        return Array.isArray(value) && value.includes(stock.symbol);
      }
      return stock.symbol === value;
    });
  }, [stocks, value, multiple]);

  // Memoize the selected value for Autocomplete
  const autocompleteValue = useMemo(() => {
    return multiple ? selectedStocks : selectedStocks[0] || null;
  }, [multiple, selectedStocks]);

  // Fetch stocks from API with optimization
  const fetchStocks = useCallback(async (search?: string) => {
    const searchTerm = search || "";

    // Prevent duplicate API calls
    if (lastSearchRef.current === searchTerm) {
      return;
    }

    setLoading(true);

    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      params.append("limit", "100");

      const response = await fetch(`/api/stocks?${params}`);
      if (response.ok) {
        const data = await response.json();
        setStocks(data);
        // Only update lastSearchRef after successful API call
        lastSearchRef.current = searchTerm;
      }
    } catch (error) {
      console.error("Error fetching stocks:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchStocks();
  }, []);

  // Sync inputValue when external value changes (for controlled component behavior)
  useEffect(() => {
    if (!multiple && !value) {
      // If external value is cleared, clear internal input
      setInputValue("");
    } else if (multiple && Array.isArray(value) && value.length === 0) {
      // If external array is empty, clear internal input
      setInputValue("");
    }
  }, [value, multiple]);

  // Debounced search with improved logic
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    const searchTerm = inputValue.trim();

    debounceRef.current = setTimeout(() => {
      fetchStocks(searchTerm || undefined);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [inputValue, fetchStocks]);

  const handleChange = useCallback(
    (event: any, newValue: Stock | Stock[] | null) => {
      if (multiple) {
        const symbols = Array.isArray(newValue)
          ? newValue.map((stock) => stock.symbol)
          : [];
        onValueChange(symbols);

        // Clear search input after selection in multiple mode
        if (symbols.length > 0) {
          setInputValue("");
        }
      } else {
        const symbol = newValue ? (newValue as Stock).symbol : "";
        onValueChange(symbol);

        // Clear search input after selection in single mode
        if (symbol) {
          setInputValue("");
        }
      }
    },
    [multiple, onValueChange]
  );

  const handleInputChange = useCallback(
    (event: any, newInputValue: string, reason: string) => {
      // Always update internal inputValue for search functionality
      setInputValue(newInputValue);

      // If user clears the input completely, also clear the selection
      if (newInputValue === "" && reason === "input") {
        if (multiple) {
          onValueChange([]);
        } else {
          onValueChange("");
        }
      }
    },
    [multiple, onValueChange]
  );

  const getOptionLabel = useCallback((option: Stock) => {
    return `${option.symbol} - ${option.name}`;
  }, []);

  const handleClear = useCallback(() => {
    setInputValue("");
    if (multiple) {
      onValueChange([]);
    } else {
      onValueChange("");
    }
  }, [multiple, onValueChange]);

  const showClearButton = useMemo(() => {
    return value && value !== "";
  }, [value]);

  // Compute display value - empty when no selection, otherwise use inputValue for search
  const displayValue = useMemo(() => {
    // If there's no selection, show empty (but preserve inputValue for search)
    const hasSelection = multiple
      ? Array.isArray(value) && value.length > 0
      : value && value !== "";

    // If user is actively typing (input has focus), show inputValue
    // Otherwise, show empty when no selection
    if (!hasSelection && !open) {
      return "";
    }

    return inputValue;
  }, [inputValue, value, multiple, open]);

  const renderOption = (props: any, option: Stock) => (
    <Box component="li" {...props}>
      <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="body2" fontWeight="bold">
            {option.symbol}
          </Typography>
          {option.exchange && (
            <Chip
              label={option.exchange}
              size="small"
              variant="outlined"
              sx={{ fontSize: "0.7rem", height: 20 }}
            />
          )}
          {option.changePercent !== undefined && (
            <Chip
              label={`${
                option.changePercent >= 0 ? "+" : ""
              }${option.changePercent.toFixed(2)}%`}
              size="small"
              color={option.changePercent >= 0 ? "success" : "error"}
              sx={{ fontSize: "0.7rem", height: 20, ml: "auto" }}
            />
          )}
        </Box>
        <Typography variant="caption" color="text.secondary" noWrap>
          {option.name}
        </Typography>
        {option.currentPrice && (
          <Typography variant="caption" fontWeight="medium">
            {(option.currentPrice * 1000).toLocaleString("vi-VN")} VND
          </Typography>
        )}
      </Box>
    </Box>
  );

  const renderTags = (tagValue: Stock[], getTagProps: any) =>
    tagValue.map((option, index) => (
      <Chip
        {...getTagProps({ index })}
        key={option.symbol}
        label={option.symbol}
        size="small"
        color="primary"
        variant="outlined"
        sx={{
          height: size === "small" ? "22px" : "24px", // Smaller tags for consistency
          fontSize: size === "small" ? "0.7rem" : "0.75rem",
          "& .MuiChip-deleteIcon": {
            fontSize: size === "small" ? "14px" : "16px",
          },
        }}
      />
    ));

  return (
    <ThemeProvider theme={theme}>
      <Autocomplete
        multiple={multiple}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        value={autocompleteValue}
        onChange={handleChange}
        inputValue={displayValue}
        onInputChange={handleInputChange}
        options={stocks}
        getOptionLabel={getOptionLabel}
        renderOption={renderOption}
        renderTags={multiple ? renderTags : undefined}
        loading={loading}
        disabled={disabled}
        className={className}
        isOptionEqualToValue={(option, value) => option.symbol === value.symbol}
        filterOptions={(options) => options} // We handle filtering server-side
        noOptionsText={
          inputValue ? "Không tìm thấy mã cổ phiếu" : "Nhập để tìm kiếm..."
        }
        loadingText="Đang tải..."
        clearOnBlur={false} // Prevent clearing input on blur
        clearOnEscape={false} // Prevent clearing input on escape
        selectOnFocus={false} // Prevent selecting all text on focus
        blurOnSelect={false} // Prevent blur after selection
        PopperComponent={(props) => (
          <Popper
            {...props}
            style={{
              ...props.style,
              zIndex: 1300, // Higher than MUI Dialog default (1300)
            }}
          />
        )}
        PaperComponent={(props) => (
          <Paper
            {...props}
            elevation={8}
            sx={{
              mt: 1,
              "& .MuiAutocomplete-listbox": {
                maxHeight: 300,
                "& .MuiAutocomplete-option": {
                  padding: "12px 16px",
                  borderBottom: "1px solid #f0f0f0",
                  "&:last-child": {
                    borderBottom: "none",
                  },
                },
              },
            }}
          />
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={placeholder}
            variant={variant}
            size={size}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? (
                    <CircularProgress color="inherit" size={16} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
            onKeyDown={(event) => {
              // Handle keyboard clearing
              if (event.key === "Backspace" || event.key === "Delete") {
                if (inputValue === "" && !multiple) {
                  // If input is already empty and it's single select, clear the value
                  onValueChange("");
                } else if (inputValue === "" && multiple) {
                  // If input is empty and it's multiple select, clear the array
                  onValueChange([]);
                }
              }

              // Handle Escape to clear
              if (event.key === "Escape") {
                setInputValue("");
                if (multiple) {
                  onValueChange([]);
                } else {
                  onValueChange("");
                }
              }
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                minHeight: size === "small" ? "36px" : "40px", // Consistent height
                "& .MuiOutlinedInput-input": {
                  padding: size === "small" ? "8px 12px" : "12px 14px", // Compact padding
                  fontSize: size === "small" ? "0.875rem" : "1rem", // Smaller font for small size
                },
                "& fieldset": {
                  borderColor: "rgba(0, 0, 0, 0.23)",
                },
                "&:hover fieldset": {
                  borderColor: "rgba(0, 0, 0, 0.87)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "primary.main",
                },
              },
              "& .MuiAutocomplete-tag": {
                height: size === "small" ? "24px" : "28px", // Smaller tags for small size
                fontSize: size === "small" ? "0.75rem" : "0.875rem",
              },
            }}
          />
        )}
      />
    </ThemeProvider>
  );
}
