# NumberInput Component

A reusable number input component with automatic formatting and comma separation for thousands.

## Features

- ✅ **Auto-formatting with commas**: Displays numbers with thousands separators (e.g., 1,000,000)
- ✅ **Float/Integer support**: Can handle both integers and decimal numbers
- ✅ **Focus/Blur behavior**: Removes formatting during editing, applies on blur
- ✅ **Vietnamese locale**: Uses Vietnamese number formatting
- ✅ **Input validation**: Only allows valid numeric characters
- ✅ **Controlled component**: Works with React state management

## Props

```typescript
interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> {
  value?: number                // The numeric value
  onChange?: (value: number) => void  // Callback when value changes
  formatWithCommas?: boolean    // Enable/disable comma formatting (default: true)
  allowFloat?: boolean          // Allow decimal numbers (default: false)
}
```

## Usage Examples

### Basic Usage (Integer with commas)
```tsx
import { NumberInput } from "@/components/ui/number-input"

const [quantity, setQuantity] = useState(1000)

<NumberInput
  value={quantity}
  onChange={setQuantity}
  placeholder="Enter quantity..."
/>
// Displays: "1,000"
```

### Float Numbers
```tsx
const [price, setPrice] = useState(25500.50)

<NumberInput
  value={price}
  onChange={setPrice}
  allowFloat={true}
  placeholder="Enter price..."
/>
// Displays: "25,500.5"
```

### Without Formatting
```tsx
const [count, setCount] = useState(100)

<NumberInput
  value={count}
  onChange={setCount}
  formatWithCommas={false}
  placeholder="Enter count..."
/>
// Displays: "100" (no commas)
```

### Complete Form Example
```tsx
const [stock, setStock] = useState({
  symbol: "",
  quantity: 0,
  avgPrice: 0,
})

<form>
  <div className="space-y-4">
    <div>
      <Label htmlFor="quantity">Số lượng</Label>
      <NumberInput
        id="quantity"
        value={stock.quantity}
        onChange={(value) => setStock({...stock, quantity: value})}
        placeholder="Nhập số lượng..."
        formatWithCommas={true}
        allowFloat={false}
        required
      />
    </div>
    
    <div>
      <Label htmlFor="price">Giá (VND)</Label>
      <NumberInput
        id="price"
        value={stock.avgPrice}
        onChange={(value) => setStock({...stock, avgPrice: value})}
        placeholder="Nhập giá..."
        formatWithCommas={true}
        allowFloat={true}
        required
      />
    </div>
  </div>
</form>
```

## Behavior

1. **On Focus**: Removes comma formatting for easier editing
   - Input: "1,000,000" → Shows: "1000000"

2. **On Blur**: Applies comma formatting
   - Input: "1000000" → Shows: "1,000,000"

3. **On Change**: 
   - Validates input (only numbers, commas, dots allowed)
   - Calls onChange with parsed numeric value
   - Invalid characters are ignored

4. **Value Parsing**:
   - Integers: "1,000" → 1000
   - Floats: "1,000.50" → 1000.5
   - Empty: "" → 0

## Implementation Details

- Uses Vietnamese locale (`vi-VN`) for number formatting
- Input type is "text" to support custom formatting
- Extends all standard HTML input props except `type`, `value`, and `onChange`
- Forwards ref for form libraries compatibility
- Built on top of shadcn/ui Input component

## Files Modified

- Created: `src/components/ui/number-input.tsx`
- Updated: `src/app/portfolio/page.tsx` - Uses NumberInput for quantity and price
- Updated: `src/app/backtest/page.tsx` - Uses NumberInput for initial cash

## Benefits

- **Reusable**: Single component for all number inputs
- **Consistent UX**: Same behavior across the application  
- **Better readability**: Numbers are easier to read with comma separators
- **Type-safe**: TypeScript support with proper typing
- **Form-friendly**: Works with form libraries and validation
