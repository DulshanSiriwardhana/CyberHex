import { useState, useCallback, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Terminal,
  User,
  LogOut,
  LayoutDashboard,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import SignIn from "@/components/signin";
import { useAuth } from "@/contexts/auth";

const NavBar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [signInDialogOpen, setSignInDialogOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const closeMobile = useCallback(() => setIsMobileOpen(false), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    closeMobile();
  }, [location.pathname, closeMobile]);

  const handleSignInSuccess = () => {
    setSignInDialogOpen(false);
  };

  const isLanding = location.pathname === "/";

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`
        fixed top-0 left-0 right-0 z-[200] transition-all duration-300
        ${scrolled
          ? "bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-800/50 shadow-[0_1px_20px_rgba(0,0,0,0.3)]"
          : "bg-transparent"
        }
      `}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 group"
          onClick={closeMobile}
        >
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-700 shadow-[0_0_15px_rgba(6,182,212,0.4)] group-hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] transition-shadow duration-300">
            <Terminal className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-extrabold tracking-tight text-white">
            Cyber<span className="text-cyan-400">Hex</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          <Link
            to="/"
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              location.pathname === "/"
                ? "text-cyan-400 bg-cyan-500/10"
                : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
            }`}
          >
            Home
          </Link>
          <Link
            to="/about"
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              location.pathname === "/about"
                ? "text-cyan-400 bg-cyan-500/10"
                : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
            }`}
          >
            About
          </Link>
          <Link
            to="/contact"
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              location.pathname === "/contact"
                ? "text-cyan-400 bg-cyan-500/10"
                : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
            }`}
          >
            Contact
          </Link>
        </div>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 rounded-xl border border-neutral-700/50 bg-neutral-800/50 px-3 py-2 text-sm font-medium text-white hover:border-neutral-600/50 hover:bg-neutral-800 transition-all duration-200"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-violet-500 text-[10px] font-bold text-white">
                    {user.username?.[0]?.toUpperCase() || "U"}
                  </div>
                  <span className="max-w-[100px] truncate">
                    {user.username}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 rounded-xl border border-neutral-700/50 bg-neutral-900/95 backdrop-blur-xl p-1.5 shadow-[0_0_30px_rgba(0,0,0,0.5)]"
                    >
                      <div className="px-3 py-2 border-b border-neutral-800/50 mb-1">
                        <p className="text-sm font-medium text-white truncate">
                          {user.username}
                        </p>
                        <p className="text-xs text-neutral-500 truncate">
                          {user.email}
                        </p>
                      </div>
                      <Link
                        to="/settings"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                          navigate("/");
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <>
              <Dialog open={signInDialogOpen} onOpenChange={setSignInDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    Sign in
                  </Button>
                </DialogTrigger>
                <SignIn onSuccess={handleSignInSuccess} />
              </Dialog>
              <Link to="/signup">
                <Button size="sm">
                  <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="inline-flex md:hidden items-center justify-center rounded-lg p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-neutral-800/50 bg-neutral-950/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              <Link
                to="/"
                onClick={closeMobile}
                className={`block rounded-lg px-3 py-2.5 text-sm font-medium ${
                  location.pathname === "/"
                    ? "text-cyan-400 bg-cyan-500/10"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
                }`}
              >
                Home
              </Link>
              <Link
                to="/about"
                onClick={closeMobile}
                className={`block rounded-lg px-3 py-2.5 text-sm font-medium ${
                  location.pathname === "/about"
                    ? "text-cyan-400 bg-cyan-500/10"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
                }`}
              >
                About
              </Link>
              <Link
                to="/contact"
                onClick={closeMobile}
                className={`block rounded-lg px-3 py-2.5 text-sm font-medium ${
                  location.pathname === "/contact"
                    ? "text-cyan-400 bg-cyan-500/10"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
                }`}
              >
                Contact
              </Link>
              <div className="pt-3 mt-3 border-t border-neutral-800/50 space-y-2">
                {user ? (
                  <>
                    <Link
                      to="/dashboard"
                      onClick={closeMobile}
                      className="block w-full rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800/50"
                    >
                      <LayoutDashboard className="h-4 w-4 inline mr-2" />
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        closeMobile();
                        navigate("/");
                      }}
                      className="block w-full text-left rounded-lg px-3 py-2.5 text-sm font-medium text-rose-400 hover:bg-rose-500/10"
                    >
                      <LogOut className="h-4 w-4 inline mr-2" />
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Dialog open={signInDialogOpen} onOpenChange={setSignInDialogOpen}>
                      <DialogTrigger asChild>
                        <button
                          className="block w-full rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800/50"
                          onClick={closeMobile}
                        >
                          Sign in
                        </button>
                      </DialogTrigger>
                      <SignIn onSuccess={handleSignInSuccess} />
                    </Dialog>
                    <Link
                      to="/signup"
                      onClick={closeMobile}
                      className="block w-full rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 px-3 py-2.5 text-center text-sm font-semibold text-white"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default NavBar;