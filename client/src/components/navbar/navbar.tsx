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
  Sun,
  Moon,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth";
import { useThemeStore } from "@/stores/theme";
import { THEME_REGISTRY } from "@/lib/design-tokens";
import type { ThemeVariant } from "@/lib/design-tokens";
import { CyberHexWord } from "@/components/brand";

const NavBar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const themeMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { resolved, variant, toggle, setVariant } = useThemeStore();
  const themeVariantEntries = Object.values(THEME_REGISTRY);

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
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setThemeMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    closeMobile();
  }, [location.pathname, closeMobile]);

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
          <CyberHexWord size="sm" showSerial={false} />
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
          {/* ── Theme Controls ── */}
          <div className="flex items-center gap-0.5 rounded-xl border border-neutral-700/50 bg-neutral-800/30 p-0.5 mr-1">
            {/* Dark / Light toggle */}
            <button
              onClick={toggle}
              className="relative rounded-lg p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-700/50 transition-all duration-200"
              aria-label={`Switch to ${resolved === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${resolved === 'dark' ? 'light' : 'dark'} mode`}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={resolved}
                  initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.2 }}
                  className="block"
                >
                  {resolved === 'dark' ? (
                    <Moon className="h-3.5 w-3.5" />
                  ) : (
                    <Sun className="h-3.5 w-3.5" />
                  )}
                </motion.span>
              </AnimatePresence>
            </button>
            {/* Theme variant dropdown */}
            <div className="relative" ref={themeMenuRef}>
              <button
                onClick={() => setThemeMenuOpen(!themeMenuOpen)}
                className="rounded-lg p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-700/50 transition-all duration-200 flex items-center gap-0.5"
                aria-label="Choose color theme"
                title="Choose color theme"
              >
                <Palette className="h-3.5 w-3.5" />
                <ChevronDown className={`h-2.5 w-2.5 transition-transform duration-200 ${themeMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {themeMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 rounded-xl border border-neutral-700/50 bg-neutral-900/95 backdrop-blur-xl p-1.5 shadow-[0_0_30px_rgba(0,0,0,0.5)]"
                  >
                    <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
                      Color Theme
                    </p>
                    {themeVariantEntries.map((t) => {
                      const isActive = t.id === variant;
                      return (
                        <button
                          key={t.id}
                          onClick={() => {
                            setVariant(t.id as ThemeVariant);
                            setThemeMenuOpen(false);
                          }}
                          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                            isActive
                              ? 'bg-neutral-800 text-white'
                              : 'text-neutral-300 hover:text-white hover:bg-neutral-800/60'
                          }`}
                        >
                          <span
                            className="h-3.5 w-3.5 rounded-full ring-1 ring-white/10 flex-shrink-0"
                            style={{ background: t.preview }}
                          />
                          <span className="flex-1 text-left">{t.name}</span>
                          {isActive && (
                            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.5)]" />
                          )}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

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
              <Link to="/signin">
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm">
                  <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile theme toggle + hamburger */}
        <div className="flex md:hidden items-center gap-1">
          <button
            onClick={toggle}
            className="inline-flex items-center justify-center rounded-lg p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            aria-label={`Switch to ${resolved === 'dark' ? 'light' : 'dark'} mode`}
          >
            {resolved === 'dark' ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </button>
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="inline-flex items-center justify-center rounded-lg p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
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
              {/* ── Mobile Theme Variants ── */}
              <div className="pt-3 border-t border-neutral-800/50">
                <p className="px-3 pt-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
                  Color Theme
                </p>
                <div className="flex flex-wrap gap-1.5 px-3 pb-1">
                  {themeVariantEntries.map((t) => {
                    const isActive = t.id === variant;
                    return (
                      <button
                        key={t.id}
                        onClick={() => {
                          setVariant(t.id as ThemeVariant);
                          closeMobile();
                        }}
                        className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                          isActive
                            ? 'bg-neutral-800 text-white ring-1 ring-cyan-500/30'
                            : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                        }`}
                      >
                        <span
                          className="h-3 w-3 rounded-full ring-1 ring-white/10"
                          style={{ background: t.preview }}
                        />
                        {t.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 mt-2 border-t border-neutral-800/50 space-y-2">
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
                    <Link
                      to="/signin"
                      onClick={closeMobile}
                      className="block w-full rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800/50"
                    >
                      Sign in
                    </Link>
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