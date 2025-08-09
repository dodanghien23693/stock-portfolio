"use client";

import { NumberInput } from "@/components/ui/number-input";
import { useState } from "react";

export default function TestNumberPage() {
  const [value1, setValue1] = useState(100000000);
  const [value2, setValue2] = useState(15.5);
  const [value3, setValue3] = useState(0);

  return (
    <div className="container mx-auto p-8 space-y-8">
      <h1 className="text-2xl font-bold">Test NumberInput Component</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Test 1: Large Integer (formatWithCommas=true)
          </label>
          <NumberInput
            value={value1}
            onChange={setValue1}
            formatWithCommas={true}
            allowFloat={false}
            placeholder="Nhập số nguyên lớn..."
          />
          <p className="text-sm text-gray-600 mt-1">Current value: {value1}</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Test 2: Float Number (formatWithCommas=true, allowFloat=true)
          </label>
          <NumberInput
            value={value2}
            onChange={setValue2}
            formatWithCommas={true}
            allowFloat={true}
            placeholder="Nhập số thập phân..."
          />
          <p className="text-sm text-gray-600 mt-1">Current value: {value2}</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Test 3: Start from Zero
          </label>
          <NumberInput
            value={value3}
            onChange={setValue3}
            formatWithCommas={true}
            allowFloat={true}
            placeholder="Nhập số từ 0..."
          />
          <p className="text-sm text-gray-600 mt-1">Current value: {value3}</p>
        </div>
      </div>

      <div className="bg-gray-100 p-4 rounded">
        <h3 className="font-medium mb-2">Test Cases:</h3>
        <ul className="text-sm space-y-1">
          <li>1. Focus vào input với giá trị 100,000,000 → should show 100000000</li>
          <li>2. Type a new number like 123456789 → should work normally</li>
          <li>3. Blur out → should format to 123,456,789</li>
          <li>4. Focus again → should show 123456789 (raw number)</li>
          <li>5. Test float numbers like 15.5 → should format to 15.5</li>
        </ul>
      </div>
    </div>
  );
}
