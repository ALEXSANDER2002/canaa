import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-plum-700 text-white hover:bg-plum-800 focus-visible:ring-plum-400",
  secondary:
    "bg-clay-600 text-white hover:bg-clay-700 focus-visible:ring-clay-400",
  outline:
    "border border-line bg-transparent text-ink hover:border-plum-300 hover:text-plum-700 focus-visible:ring-plum-300",
  ghost: "text-plum-700 hover:bg-plum-50 focus-visible:ring-plum-300",
  danger:
    "bg-danger-600 text-white hover:bg-danger-700 focus-visible:ring-danger-600",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-7 text-base",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-full font-semibold shadow-sm transition-[transform,background-color,box-shadow] hover:shadow-md active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:pointer-events-none disabled:opacity-50",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
