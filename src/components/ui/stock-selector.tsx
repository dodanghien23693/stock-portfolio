import React, { useState, useEffect, useRef } from "react";
import { Check, ChevronsUpDown, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Portal } from "@/components/ui/portal";

interface Stock {
  id: string;
  symbol: string;
  name: string;
  exchange?: string;
  currentPrice?: number;
  changePercent?: number;
}

interface StockSelectorProps {
  value?: string | string[];
  onValueChange: (value: string | string[]) => void;
  placeholder?: string;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  zIndex?: number; // Add zIndex prop for customization
  portalContainer?: Element | null; // Add portal container prop
}

export function StockSelector({
  value,
  onValueChange,
  placeholder = "Chọn mã cổ phiếu...",
  multiple = false,
  disabled = false,
  className,
  zIndex = 9999, // Default z-index, can be overridden
  portalContainer, // Portal container
}: StockSelectorProps) {
  const [open, setOpen] = useState(false);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-detect appropriate z-index if not provided
  const getEffectiveZIndex = () => {
    if (zIndex !== 9999) return zIndex; // Use custom z-index if provided

    // Check if we're inside a dialog or modal
    const dialogParent = containerRef.current?.closest(
      '[role="dialog"], .modal, [data-radix-dialog-content]'
    );
    if (dialogParent) {
      const dialogZIndex = window.getComputedStyle(dialogParent).zIndex;
      const numericZIndex = parseInt(dialogZIndex, 10);
      if (!isNaN(numericZIndex)) {
        return numericZIndex + 1000; // Ensure dropdown is above dialog
      }
    }

    return zIndex; // Default fallback
  };

  // Get selected stocks
  const selectedStocks = stocks.filter((stock) => {
    if (multiple) {
      return Array.isArray(value) && value.includes(stock.symbol);
    }
    return stock.symbol === value;
  });

  // Fetch stocks from API
  const fetchStocks = async (search?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      params.append("limit", "100");

      const response = await fetch(`/api/stocks?${params}`);
      if (response.ok) {
        const data = await response.json();
        setStocks(data);
      }
    } catch (error) {
      console.error("Error fetching stocks:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchStocks();
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchStocks(searchTerm || undefined);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchTerm]);

  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // Check if click is outside the container
      if (containerRef.current && !containerRef.current.contains(target)) {
        // Also check if click is outside the dropdown portal
        const dropdownElement = document.querySelector(
          "[data-stock-selector-dropdown]"
        );
        if (!dropdownElement || !dropdownElement.contains(target)) {
          setOpen(false);
        }
      }
    };

    if (open) {
      // Use capture phase to ensure we catch the event before Dialog might handle it
      document.addEventListener("mousedown", handleClickOutside, true);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside, true);
    };
  }, [open]);

  // Calculate dropdown position when opening
  useEffect(() => {
    if (open && containerRef.current) {
      const updatePosition = () => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const dropdownHeight = 400; // max height of dropdown
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;

        // Determine if dropdown should open upward or downward
        const shouldOpenUpward =
          spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

        setDropdownPosition({
          top: shouldOpenUpward
            ? rect.top + window.scrollY - dropdownHeight
            : rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
        });
      };

      updatePosition();

      // Update position on scroll and resize
      window.addEventListener("scroll", updatePosition);
      window.addEventListener("resize", updatePosition);

      return () => {
        window.removeEventListener("scroll", updatePosition);
        window.removeEventListener("resize", updatePosition);
      };
    }
  }, [open]);

  const handleSelect = (selectedSymbol: string) => {
    debugger;
    if (multiple) {
      const currentValue = Array.isArray(value) ? value : [];
      if (currentValue.includes(selectedSymbol)) {
        // Remove from selection
        onValueChange(
          currentValue.filter((symbol) => symbol !== selectedSymbol)
        );
      } else {
        // Add to selection
        onValueChange([...currentValue, selectedSymbol]);
      }
    } else {
      onValueChange(selectedSymbol);
      setOpen(false);
    }
  };

  const handleRemove = (symbolToRemove: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (multiple && Array.isArray(value)) {
      onValueChange(value.filter((symbol) => symbol !== symbolToRemove));
    } else {
      onValueChange("");
    }
  };

  const toggleDropdown = () => {
    if (!disabled) {
      setOpen(!open);
    }
  };

  const renderTrigger = () => {
    if (multiple) {
      return (
        <div className="flex flex-wrap gap-1 min-h-[40px] p-2 w-full">
          {selectedStocks.length > 0 ? (
            selectedStocks.map((stock) => (
              <Badge
                key={stock.symbol}
                variant="secondary"
                className="flex items-center gap-1"
              >
                <span className="font-medium">{stock.symbol}</span>
                <button
                  type="button"
                  className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                  onClick={(e) => handleRemove(stock.symbol, e)}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </div>
      );
    }

    const selectedStock = selectedStocks[0];
    return (
      <div className="flex items-center justify-between w-full px-3 py-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {selectedStock ? (
            <>
              <span className="font-medium">{selectedStock.symbol}</span>
              <span className="text-sm text-gray-600 truncate">
                {selectedStock.name}
              </span>
              {selectedStock.changePercent !== undefined && (
                <Badge
                  variant={
                    selectedStock.changePercent >= 0 ? "default" : "destructive"
                  }
                  className="text-xs"
                >
                  {selectedStock.changePercent >= 0 ? "+" : ""}
                  {selectedStock.changePercent.toFixed(2)}%
                </Badge>
              )}
            </>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </div>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </div>
    );
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <Button
        variant="outline"
        className={cn(
          "w-full justify-start h-auto min-h-[40px] p-0",
          !value && "text-muted-foreground",
          className
        )}
        disabled={disabled}
        onClick={toggleDropdown}
        type="button"
      >
        {renderTrigger()}
      </Button>

      {open && (
        <Portal container={portalContainer}>
          <div
            data-stock-selector-dropdown
            className="fixed bg-white border rounded-md shadow-lg max-h-[400px] overflow-hidden"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`,
              zIndex: getEffectiveZIndex(),
            }}
            onMouseDown={(e: React.MouseEvent) => {
              // Prevent event from bubbling to document
              e.stopPropagation();
            }}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            {/* Search Input */}
            <div className="flex items-center border-b px-3 py-2 bg-gray-50">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <input
                type="text"
                placeholder="Tìm kiếm mã cổ phiếu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent outline-none text-sm"
                autoFocus
              />
            </div>

            {/* Stock List */}
            <div className="max-h-[300px] overflow-y-auto">
              {loading ? (
                <div className="p-4 space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : stocks.length === 0 ? (
                <div className="py-6 text-center text-sm text-gray-500">
                  {searchTerm ? "Không tìm thấy mã cổ phiếu" : "Đang tải..."}
                </div>
              ) : (
                <div className="p-1">
                  {stocks.map((stock) => {
                    const isSelected = multiple
                      ? Array.isArray(value) && value.includes(stock.symbol)
                      : value === stock.symbol;

                    return (
                      <div
                        key={stock.symbol}
                        className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer rounded-sm transition-colors"
                        onMouseDown={(e: React.MouseEvent) => {
                          // Prevent mousedown from bubbling and triggering outside click
                          e.stopPropagation();
                        }}
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          handleSelect(stock.symbol);
                        }}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Check
                            className={cn(
                              "h-4 w-4 shrink-0",
                              isSelected
                                ? "opacity-100 text-blue-600"
                                : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {stock.symbol}
                              </span>
                              {stock.exchange && (
                                <Badge variant="outline" className="text-xs">
                                  {stock.exchange}
                                </Badge>
                              )}
                            </div>
                            <span className="text-sm text-gray-600 truncate">
                              {stock.name}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end text-sm shrink-0">
                          {stock.currentPrice && (
                            <span className="font-medium">
                              {stock.currentPrice.toLocaleString("vi-VN")}
                            </span>
                          )}
                          {stock.changePercent !== undefined && (
                            <span
                              className={cn(
                                "text-xs",
                                stock.changePercent >= 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              )}
                            >
                              {stock.changePercent >= 0 ? "+" : ""}
                              {stock.changePercent.toFixed(2)}%
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
