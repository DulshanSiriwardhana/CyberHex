import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, BrainCircuit } from "lucide-react";
import SignUp from "@/components/signup/signup";

export default function SignUpPage() {
  return (
    <div className="os-canvas min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden font-spectral">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay pointer-events-none z-10" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-blue-500/10 blur-[130px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-1/4 left-1/4 w-[700px] h-[700px] bg-emerald-500/5 blur-[160px] rounded-full pointer-events-none z-0" />

      <div className="relative z-20 w-full max-w-[480px]">
        {/* Logo Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center mb-8 group"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#0a0a0f] border border-white/10 shadow-2xl flex items-center justify-center mb-4 relative overflow-hidden group-hover:border-blue-500/50 transition-colors duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <BrainCircuit className="h-7 w-7 text-blue-400 group-hover:scale-110 transition-transform duration-500" />
          </div>
          <h1 className="text-2xl font-light text-white tracking-tight">
            Cyber<span className="font-semibold text-blue-400">Hex</span>
          </h1>
          <p className="text-neutral-500 text-[10px] mt-2 font-mono tracking-widest uppercase">Engineer Onboarding</p>
        </motion.div>

        {/* Main Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="os-glass-panel p-8 relative overflow-hidden"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
          
          <SignUp />

        </motion.div>

        {/* Footer Link */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-8 text-center flex flex-col items-center gap-4"
        >
          <p className="text-sm text-neutral-500">
            Already registered?{" "}
            <Link to="/signin" className="font-medium text-blue-400 hover:text-blue-300 transition-colors underline decoration-blue-500/30 underline-offset-4">
              Authenticate via Secure Tunnel
            </Link>
          </p>
          <Link to="/" className="inline-flex items-center gap-2 text-[11px] font-mono text-neutral-600 hover:text-neutral-400 transition-colors uppercase tracking-widest">
            <ArrowLeft className="h-3.5 w-3.5" />
            Abort Procedure
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
