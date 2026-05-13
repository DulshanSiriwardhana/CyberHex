import NavBar from "@/components/navbar/navbar"
import { useLocation } from "react-router-dom"
import { useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"

const Layer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation()

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-neutral-950 text-white antialiased">
      <NavBar />
      <div className="pt-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Layer