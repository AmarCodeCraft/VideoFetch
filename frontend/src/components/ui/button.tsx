import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-surface-950 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-[0_4px_15px_rgba(255,59,59,0.25)] hover:shadow-[0_6px_25px_rgba(255,59,59,0.4)] hover:-translate-y-0.5 active:translate-y-0",
        destructive:
          "bg-red-600 text-white hover:bg-red-700",
        outline:
          "border border-surface-700/50 bg-surface-800/40 text-surface-200 hover:bg-surface-700/50 hover:border-surface-600/50 hover:text-surface-100",
        secondary:
          "bg-surface-800 text-surface-200 hover:bg-surface-700",
        ghost:
          "text-surface-400 hover:bg-surface-800/60 hover:text-surface-200",
        link:
          "text-brand-400 underline-offset-4 hover:underline",
        glow:
          "bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-neon hover:shadow-neon-lg hover:-translate-y-0.5 active:translate-y-0",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-9 w-9 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
