import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface PageLayoutProps {
  children: React.ReactNode
  className?: string
  id?: string
}

export function PageLayout({ children, className, id }: PageLayoutProps) {
  return (
    <motion.main
      id={id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "w-full min-h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-8 py-8 mx-auto max-w-boundary",
        className
      )}
    >
      {children}
    </motion.main>
  )
}

interface SectionProps {
  children: React.ReactNode
  className?: string
  id?: string
  dark?: boolean
}

export function Section({ children, className, id, dark }: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "w-full py-12 sm:py-16 lg:py-24",
        dark && "bg-neutral-900/50",
        className
      )}
    >
      <div className="mx-auto max-w-boundary px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  )
}

interface ContainerProps {
  children: React.ReactNode
  className?: string
}

export function Container({ children, className }: ContainerProps) {
  return (
    <div className={cn("mx-auto max-w-boundary px-4 sm:px-6 lg:px-8", className)}>
      {children}
    </div>
  )
}

interface GridProps {
  children: React.ReactNode
  className?: string
  cols?: 1 | 2 | 3 | 4
}

export function Grid({ children, className, cols = 3 }: GridProps) {
  return (
    <div
      className={cn(
        "grid gap-6 sm:gap-8",
        {
          "grid-cols-1": cols === 1,
          "grid-cols-1 sm:grid-cols-2": cols === 2,
          "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3": cols === 3,
          "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4": cols === 4,
        },
        className
      )}
    >
      {children}
    </div>
  )
}