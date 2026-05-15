import * as React from "react";
import { cn } from "@/lib/utils";

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl border border-neutral-800/60 bg-neutral-900/60 backdrop-blur-lg",
        "shadow-[0_4px_24px_rgba(0,0,0,0.4)]",
        "hover:border-neutral-700/60 hover:shadow-[0_4px_24px_rgba(0,0,0,0.4),0_0_20px_rgba(6,182,212,0.06)]",
        "transition-all duration-300",
        className,
      )}
      {...props}
    />
  ),
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  ),
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-bold leading-tight tracking-tight text-white",
      className,
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-neutral-400 leading-relaxed", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  ),
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center p-6 pt-0", className)}
      {...props}
    />
  ),
);
CardFooter.displayName = "CardFooter";

// ---- Glow Card: card with a subtle neon border glow -------------------------
const GlowCard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl border border-cyan-500/20 bg-neutral-900/60 backdrop-blur-lg",
        "shadow-[0_0_15px_rgba(6,182,212,0.1)]",
        "hover:border-cyan-500/30 hover:shadow-[0_0_25px_rgba(6,182,212,0.15)]",
        "transition-all duration-300",
        className,
      )}
      {...props}
    />
  ),
);
GlowCard.displayName = "GlowCard";

// ---- Stat Card: for metric displays ----------------------------------------
const StatCard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-col gap-2 rounded-2xl border border-neutral-800/60 bg-neutral-900/50 backdrop-blur-lg p-5",
        "transition-all duration-300 hover:border-neutral-700/60",
        className,
      )}
      {...props}
    />
  ),
);
StatCard.displayName = "StatCard";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  GlowCard,
  StatCard,
};