import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
}

/** Full-page wrapper with cyber grid background and radial gradient */
export function PageLayout({ children, className }: PageLayoutProps) {
  return (
    <div
      className={cn(
        "min-h-screen bg-neutral-950 bg-cyber-grid",
        className,
      )}
    >
      {/* Radial glow at top */}
      <div className="pointer-events-none fixed inset-0 bg-cyber-radial" />
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}

interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

export function Section({ children, className, id }: SectionProps) {
  return (
    <section
      id={id}
      className={cn("relative px-4 py-16 sm:px-6 lg:px-8 xl:py-24", className)}
    >
      <div className="mx-auto max-w-7xl">{children}</div>
    </section>
  );
}

interface ContainerProps {
  children: ReactNode;
  className?: string;
  /** Narrower max-width for content-heavy pages */
  narrow?: boolean;
}

export function Container({ children, className, narrow }: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        narrow ? "max-w-4xl" : "max-w-7xl",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface GridProps {
  children: ReactNode;
  className?: string;
  cols?: 1 | 2 | 3 | 4;
  gap?: "sm" | "md" | "lg";
}

const gridColsMap = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
};

const gapMap = {
  sm: "gap-4",
  md: "gap-6",
  lg: "gap-8",
};

export function Grid({ children, className, cols = 3, gap = "md" }: GridProps) {
  return (
    <div
      className={cn(
        "grid",
        gridColsMap[cols],
        gapMap[gap],
        className,
      )}
    >
      {children}
    </div>
  );
}

interface StackProps {
  children: ReactNode;
  className?: string;
  gap?: "sm" | "md" | "lg";
}

const stackGapMap = {
  sm: "space-y-2",
  md: "space-y-4",
  lg: "space-y-6",
};

export function Stack({ children, className, gap = "md" }: StackProps) {
  return (
    <div className={cn("flex flex-col", stackGapMap[gap], className)}>
      {children}
    </div>
  );
}

interface FlexProps {
  children: ReactNode;
  className?: string;
  justify?: "start" | "center" | "end" | "between" | "around";
  align?: "start" | "center" | "end" | "stretch";
  gap?: "sm" | "md" | "lg";
  wrap?: boolean;
}

const justifyMap = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
};

const alignMap = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
};

export function Flex({
  children,
  className,
  justify = "start",
  align = "center",
  gap = "md",
  wrap,
}: FlexProps) {
  return (
    <div
      className={cn(
        "flex",
        justifyMap[justify],
        alignMap[align],
        gapMap[gap],
        wrap && "flex-wrap",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Glass panel with optional glow */
interface PanelProps {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}

export function Panel({ children, className, glow }: PanelProps) {
  return (
    <div
      className={cn(
        glow ? "glass-glow" : "glass-medium",
        "rounded-2xl p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** A section heading with optional gradient line */
interface SectionHeadingProps {
  title: string;
  description?: string;
  className?: string;
  align?: "left" | "center";
}

export function SectionHeading({
  title,
  description,
  className,
  align = "center",
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "mb-12",
        align === "center" && "text-center",
        className,
      )}
    >
      <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-3 max-w-2xl text-lg text-neutral-400 mx-auto">
          {description}
        </p>
      )}
      <div className={cn("mt-4 divider-cyber", align === "center" && "mx-auto max-w-md")} />
    </div>
  );
}