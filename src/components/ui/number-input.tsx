"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import * as React from "react";

export interface NumberInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "type" | "value" | "onChange"
  > {
  value?: number;
  onChange?: (value: number) => void;
  formatWithCommas?: boolean;
  allowFloat?: boolean;
}

// Utility functions for number formatting
const formatNumberWithCommas = (value: number | string): string => {
  if (value === null || value === undefined) return "";
  if (value === "" || value === "0") return "0";
  
  const numStr = value.toString().replace(/,/g, "");
  const num = parseFloat(numStr);
  
  if (isNaN(num)) return "";
  if (num === 0) return "0";
  
  return num.toLocaleString("vi-VN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0
  });
};

const parseNumberFromFormatted = (
  value: string,
  allowFloat: boolean = false
): number => {
  if (!value || value.trim() === "") return 0;

  // Remove commas and extra spaces
  const cleanValue = value.replace(/,/g, "").replace(/\s/g, "");

  if (!cleanValue) return 0;

  // Validate that the clean value only contains valid number characters
  const validPattern = allowFloat ? /^-?\d*\.?\d*$/ : /^-?\d*$/;
  if (!validPattern.test(cleanValue)) return 0;

  // Parse based on allowFloat
  const num = allowFloat ? parseFloat(cleanValue) : parseInt(cleanValue, 10);

  // Return 0 if parsing failed, otherwise return the parsed number
  return isNaN(num) ? 0 : num;
};

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      className,
      value = 0,
      onChange,
      formatWithCommas = true,
      allowFloat = false,
      ...props
    },
    ref
  ) => {
    const [displayValue, setDisplayValue] = React.useState<string>(
      formatWithCommas ? formatNumberWithCommas(value) : value.toString()
    );
    const [isFocused, setIsFocused] = React.useState(false);

    // Update display value when value prop changes, but only when not focused
    React.useEffect(() => {
      if (!isFocused) {
        const newDisplayValue = formatWithCommas
          ? formatNumberWithCommas(value)
          : value.toString();
        setDisplayValue(newDisplayValue);
      }
    }, [value, formatWithCommas, isFocused]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;

      if (formatWithCommas) {
        // Allow typing numbers, commas, and dots only
        const allowedChars = allowFloat ? /^[\d,.\s]*$/ : /^[\d,\s]*$/;
        if (inputValue && !allowedChars.test(inputValue)) {
          return; // Don't update if invalid characters
        }

        // Update display value immediately for smooth typing
        setDisplayValue(inputValue);

        // Only parse and call onChange if the input is not empty
        if (inputValue.trim()) {
          const numericValue = parseNumberFromFormatted(inputValue, allowFloat);
          onChange?.(numericValue);
        } else {
          onChange?.(0);
        }
      } else {
        // Direct number input without formatting
        const allowedChars = allowFloat ? /^[\d.]*$/ : /^[\d]*$/;
        if (inputValue && !allowedChars.test(inputValue)) {
          return; // Don't update if invalid characters
        }

        setDisplayValue(inputValue);

        if (inputValue.trim()) {
          const numericValue = allowFloat
            ? parseFloat(inputValue) || 0
            : parseInt(inputValue, 10) || 0;
          onChange?.(numericValue);
        } else {
          onChange?.(0);
        }
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);

      if (formatWithCommas && displayValue.trim()) {
        // Parse the current display value and format it properly
        const numericValue = parseNumberFromFormatted(displayValue, allowFloat);
        const formattedValue = formatNumberWithCommas(numericValue);
        setDisplayValue(formattedValue);
        
        // Make sure the onChange is called with the correct value
        onChange?.(numericValue);
      } else if (!displayValue.trim()) {
        // If empty, set to 0
        setDisplayValue(formatWithCommas ? "0" : "0");
        onChange?.(0);
      }

      // Call original onBlur if provided
      props.onBlur?.(e);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);

      if (formatWithCommas) {
        // Remove formatting on focus for easier editing
        // Use the actual numeric value from props, not from display
        const rawValue = value || 0;
        setDisplayValue(rawValue.toString());
      }

      // Call original onFocus if provided
      props.onFocus?.(e);
    };

    return (
      <Input
        type="text"
        className={cn(className)}
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        ref={ref}
        {...props}
      />
    );
  }
);

NumberInput.displayName = "NumberInput";

export { NumberInput };
