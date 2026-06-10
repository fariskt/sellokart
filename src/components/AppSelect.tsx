"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SelectOption {
  label: string;
  value: string;
}

interface AppSelectProps {
  value?: string;
  defaultValue?: string;

  placeholder?: string;

  options: SelectOption[];

  onValueChange?: (
    value: string
  ) => void;

  className?: string;

  disabled?: boolean;
}

export function AppSelect({
  value,
  defaultValue,
  placeholder = "Select",
  options,
  onValueChange,
  className,
  disabled,
}: AppSelectProps) {
  return (
    <Select
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <SelectTrigger className={className}>
        <SelectValue
          placeholder={placeholder}
        />
      </SelectTrigger>

      <SelectContent>
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}