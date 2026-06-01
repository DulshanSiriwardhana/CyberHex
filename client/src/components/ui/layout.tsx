import React, { type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
}

export function PageLayout({ children, className }: PageLayoutProps) {
  return (
    <div
      className={cn(
        "min-h-screen bg-neutral-950 bg-cyber-grid selection:bg-green-500/30 selection:text-white",
        className,
      )}
    >
      <div className="noise-overlay" />
      <div className="scanline-overlay" />
      <div className="vignette" />
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

interface SectionHeadingProps {
  title: string;
  description?: string;
  subtitle?: string;
  className?: string;
  align?: "left" | "center";
  center?: boolean;
  actions?: React.ReactNode;
}

export function SectionHeading({
  title,
  description,
  subtitle,
  className,
  align = "center",
  center,
  actions,
}: SectionHeadingProps) {
  const isCentered = center || align === "center";
  const displayDescription = subtitle || description;

  // Split title if it has a slash or just use it as is
  const parts = title.split(" / ");

  return (
    <div
      className={cn(
        "mb-16",
        isCentered && "text-center",
        className,
      )}
    >
      <div className={cn("flex flex-col md:flex-row md:items-end justify-between gap-6", isCentered && "md:items-center md:text-center")}>
        <div className="flex-1">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[10px] font-black uppercase tracking-[0.4em] text-green-500 mb-4"
          >
            Signal Intel / 7.0L
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-black tracking-tighter text-white sm:text-5xl lg:text-6xl uppercase"
          >
            {parts.map((part, i) => (
              <React.Fragment key={part}>
                {i > 0 && <span className="text-neutral-800 mx-2">/</span>}
                <span className={i === 0 ? "text-white" : "bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent"}>
                  {part}
                </span>
              </React.Fragment>
            ))}
          </motion.h2>

          {displayDescription && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className={cn(
                "mt-6 max-w-2xl text-lg text-neutral-400 font-medium leading-relaxed",
                isCentered && "mx-auto"
              )}
            >
              {displayDescription}
            </motion.p>
          )}
        </div>

        {actions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex-shrink-0"
          >
            {actions}
          </motion.div>
        )}
      </div>

      <motion.div
        initial={{ width: 0, opacity: 0 }}
        whileInView={{ width: 120, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className={cn("h-1 bg-green-500 relative mt-8 rounded-full", isCentered && "mx-auto")}
      >
        <div className="absolute inset-0 bg-green-400 blur-sm opacity-50" />
      </motion.div>
    </div>
  );
}
