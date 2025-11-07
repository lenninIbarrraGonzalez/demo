import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-[hsl(var(--input))] bg-transparent px-3 py-2 text-base md:text-sm ring-offset-[hsl(var(--background))] file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:h-12", // Tablet-optimized height
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
