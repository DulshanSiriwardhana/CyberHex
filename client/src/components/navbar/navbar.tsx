import { useState, useCallback, useRef, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Terminal, Cpu, User, LogOut, LayoutDashboard, Settings, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { items } from "@/const/data"
import SignIn from "@/components/signin"
import MainPopup from "@/components/mainpopup"
import { useAuth } from "@/contexts/auth"

const navItems = items.filter(item => item.name !== "Machine Learning")

const NavBar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [signInDialogOpen, setSignInDialogOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const closeMobile = useCallback(() => setIsMobileOpen(false), [])

  // Close user dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [userMenuOpen])

  const handleLogout = async () => {
    await logout()
    setUserMenuOpen(false)
    navigate("/")
  }

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

            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-800 hover:border-neutral-700 bg-neutral-900/50 text-white transition-all duration-200"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-600 to-red-400 flex items-center justify-center text-white text-xs font-bold">
                    {user.username?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium max-w-[100px] truncate">{user.username}</span>
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute right-0 mt-2 w-56 rounded-xl border border-neutral-800 bg-neutral-900 shadow-2xl shadow-black/40 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-neutral-800">
                        <p className="text-sm font-medium text-white">{user.username}</p>
                        <p className="text-xs text-neutral-400 truncate">{user.email}</p>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={() => { navigate("/dashboard"); setUserMenuOpen(false) }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Dashboard
                        </button>
                        <button
                          onClick={() => { navigate("/models"); setUserMenuOpen(false) }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
                        >
                          <Brain className="w-4 h-4" />
                          Models
                        </button>
                        <button
                          onClick={() => { navigate("/settings"); setUserMenuOpen(false) }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          Settings
                        </button>
                      </div>
                      <div className="border-t border-neutral-800 py-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Dialog open={signInDialogOpen} onOpenChange={setSignInDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="cyber" size="sm" aria-label="Sign In">
                    <User className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <SignIn onSuccess={() => setSignInDialogOpen(false)} onSignUpClick={() => { setSignInDialogOpen(false); navigate("/signup") }} />
                </DialogContent>
              </Dialog>
            )}
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

              {user && (
                <>
                  <hr className="border-neutral-800 my-3" />
                  <Link to="/dashboard" onClick={closeMobile} className="block px-4 py-3 rounded-lg text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-800/50">
                    <LayoutDashboard className="w-4 h-4 inline mr-2" />
                    Dashboard
                  </Link>
                  <Link to="/models" onClick={closeMobile} className="block px-4 py-3 rounded-lg text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-800/50">
                    <Brain className="w-4 h-4 inline mr-2" />
                    Models
                  </Link>
                  <Link to="/settings" onClick={closeMobile} className="block px-4 py-3 rounded-lg text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-800/50">
                    <Settings className="w-4 h-4 inline mr-2" />
                    Settings
                  </Link>
                </>
              )}

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

                {user ? (
                  <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => { handleLogout(); closeMobile() }}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                ) : (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="cyber" size="sm" className="w-full justify-start">
                        <User className="w-4 h-4 mr-2" />
                        Sign In
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <SignIn onSuccess={() => closeMobile()} />
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

export default NavBar
