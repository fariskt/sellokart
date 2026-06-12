import * as React from "react";

import { cn } from "@/lib/utils";

interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

function Label({
  className,
  children,
  required,
  ...props
}: LabelProps) {
  return (
    <label
      className={cn(
        "text-sm font-medium text-foreground",
        className
      )}
      {...props}
    >
      {children}

      {required && (
        <span className="ml-1 text-destructive">*</span>
      )}
    </label>
  );
}

export { Label };