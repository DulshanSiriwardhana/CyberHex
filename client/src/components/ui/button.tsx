import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 disabled:pointer-events-none disabled:opacity-40 select-none active:scale-[0.97]",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] hover:from-cyan-400 hover:to-cyan-500 border border-cyan-400/30",
        secondary:
          "bg-gradient-to-r from-violet-600 to-violet-700 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] hover:from-violet-500 hover:to-violet-600 border border-violet-400/30",
        outline:
          "border border-cyan-500/40 text-cyan-400 bg-transparent hover:bg-cyan-500/10 hover:border-cyan-400/60 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)]",
        ghost:
          "text-neutral-400 hover:text-white hover:bg-neutral-800/60",
        destructive:
          "bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-[0_0_15px_rgba(244,63,94,0.3)] hover:shadow-[0_0_25px_rgba(244,63,94,0.5)] border border-rose-400/30",
        success:
          "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] border border-emerald-400/30",
        link:
          "text-cyan-400 underline-offset-4 hover:underline hover:text-cyan-300",
        glass:
          "glass-medium text-white hover:bg-neutral-800/80 hover:border-neutral-600/50",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 rounded-lg px-3.5 text-xs",
        lg: "h-12 rounded-xl px-7 text-base",
        xl: "h-14 rounded-2xl px-9 text-lg",
        icon: "h-10 w-10 rounded-xl",
        "icon-sm": "h-8 w-8 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };