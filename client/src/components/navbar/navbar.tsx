import { useState, useCallback } from "react"
import { Link, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Terminal, Cpu, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { items } from "@/const/data"
import SignIn from "@/components/signin"
import MainPopup from "@/components/mainpopup"

const navItems = items.filter(item => item.name !== "Machine Learning")

const NavBar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const location = useLocation()

  const closeMobile = useCallback(() => setIsMobileOpen(false), [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-xl">
      <nav className="mx-auto max-w-boundary px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 group"
            aria-label="CyberHex Home"
          >
            <div className="relative">
              <Cpu className="w-6 h-6 text-red-500 transition-transform duration-300 group-hover:rotate-90" />
              <div className="absolute inset-0 bg-red-500/20 blur-lg rounded-full group-hover:bg-red-500/30 transition-all duration-300" />
            </div>
            <span className="font-spectral text-xl font-extrabold text-white tracking-tight">
              Cyber<span className="text-red-500">Hex</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? "text-white bg-red-600/10"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.name}
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-red-500 rounded-full"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              )
            })}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" aria-label="Open Terminal">
                  <Terminal className="w-4 h-4 mr-2" />
                  Console
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <MainPopup />
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="cyber" size="sm" aria-label="Sign In">
                  <User className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <SignIn />
              </DialogContent>
            </Dialog>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="md:hidden p-2 text-neutral-400 hover:text-white transition-colors"
            aria-label={isMobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileOpen}
          >
            {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="md:hidden border-t border-neutral-800 bg-neutral-950"
          >
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={closeMobile}
                    className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? "text-white bg-red-600/10 border-l-2 border-red-500"
                        : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
                    }`}
                  >
                    {item.name}
                  </Link>
                )
              })}
              <hr className="border-neutral-800 my-3" />
              <div className="flex flex-col gap-2 px-1">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      <Terminal className="w-4 h-4 mr-2" />
                      Console
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <MainPopup />
                  </DialogContent>
                </Dialog>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="cyber" size="sm" className="w-full justify-start">
                      <User className="w-4 h-4 mr-2" />
                      Sign In
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <SignIn />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

export default NavBar