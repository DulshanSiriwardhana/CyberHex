import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, LogIn, Loader2, AlertCircle, ArrowLeft, BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth";

export default function SignInPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Fill in both fields.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/workspace/data");
    } catch (err: any) {
      setError(err?.message || "Sign in failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="os-canvas min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden font-spectral">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay pointer-events-none z-10" />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-blue-500/5 blur-[150px] rounded-full pointer-events-none z-0" />

      <div className="relative z-20 w-full max-w-[420px]">
        {/* Logo Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center mb-10 group"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#0a0a0f] border border-white/10 shadow-2xl flex items-center justify-center mb-6 relative overflow-hidden group-hover:border-emerald-500/50 transition-colors duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <BrainCircuit className="h-8 w-8 text-emerald-400 group-hover:scale-110 transition-transform duration-500" />
          </div>
          <h1 className="text-3xl font-light text-white tracking-tight">
            Cyber<span className="font-semibold text-emerald-400">Hex</span>
          </h1>
          <p className="text-neutral-500 text-sm mt-2 font-mono tracking-widest uppercase">Omega Engine Access</p>
        </motion.div>

        {/* Main Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="os-glass-panel p-8 relative overflow-hidden"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

          <h2 className="text-xl font-medium text-white mb-6 font-spectral">Authenticate into Workspace</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex items-center gap-3 rounded-lg border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-400 font-mono"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </motion.div>
            )}

            <div className="space-y-2">
              <label className="text-[11px] font-mono uppercase tracking-widest text-neutral-400 flex justify-between">
                <span>Identity</span>
                <span className="text-emerald-500/50">ID_RSA</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="engineer@cyberhex.ai"
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono"
                autoComplete="email"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-mono uppercase tracking-widest text-neutral-400 flex justify-between">
                <span>Passkey</span>
                <span className="text-emerald-500/50">SHA-256</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 pr-10 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-emerald-400 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-medium tracking-wide shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all border border-emerald-400/20 rounded-lg mt-2 font-mono uppercase text-xs"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Establishing Link...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  Initialize Session
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center border-t border-white/5 pt-6">
            <p className="text-sm text-neutral-500">
              New to the platform?{" "}
              <Link to="/signup" className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors underline decoration-emerald-500/30 underline-offset-4">
                Request Access
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-8 text-center"
        >
          <Link to="/" className="inline-flex items-center gap-2 text-[11px] font-mono text-neutral-600 hover:text-neutral-400 transition-colors uppercase tracking-widest">
            <ArrowLeft className="h-3.5 w-3.5" />
            Terminate Connection
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
