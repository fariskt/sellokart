"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

interface SelectOption {
  label: string;
  value: string;
}

interface AppSelectProps {
  name: string;
  value?: string;
  defaultValue?: string;

  placeholder?: string;

  options: SelectOption[];

  onValueChange?: (value: string) => void;

  className?: string;

  disabled?: boolean;
}

export function AppSelect({
  name,
  value,
  defaultValue,
  placeholder = "Select",
  options,
  onValueChange,
  className,
  disabled,
}: AppSelectProps) {
  const [selectedValue, setSelectedValue] = useState(
    value ?? defaultValue ?? "",
  );
  return (
    <>
      <Select
        value={selectedValue}
        onValueChange={(newValue) => {
          setSelectedValue(newValue);

          onValueChange?.(newValue);
        }}
        disabled={disabled}
      >
        <SelectTrigger className={className}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>

        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {name && <input type="hidden" name={name} value={selectedValue} />}
    </>
  );
}
