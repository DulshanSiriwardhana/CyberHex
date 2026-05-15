import NavBar from "@/components/navbar/navbar"
import { Sidebar } from "@/components/navbar/Sidebar"
import { useLocation } from "react-router-dom"
import { useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useAuth } from "@/contexts/auth"

const AUTHENTICATED_PATHS = ["/dashboard", "/experiments", "/models", "/cyber-games", "/settings"]

const Layer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation()
  const { user } = useAuth()

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [location.pathname])

  const showSidebar = user && AUTHENTICATED_PATHS.some((path) =>
    location.pathname.startsWith(path)
  )

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-white antialiased">
      <NavBar />
      {showSidebar && <Sidebar />}
      <div className={`pt-16 ${showSidebar ? "pl-18 lg:pl-20" : ""}`}>
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
