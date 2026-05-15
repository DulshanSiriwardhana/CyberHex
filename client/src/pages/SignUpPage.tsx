import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Terminal, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import SignUp from "@/components/signup/signup";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-neutral-950 bg-cyber-grid flex flex-col items-center justify-center px-4 py-12 relative">
      {/* Radial glow */}
      <div className="pointer-events-none fixed inset-0 bg-cyber-radial" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center justify-center gap-2 mb-10 group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-700 shadow-[0_0_20px_rgba(6,182,212,0.4)] group-hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] transition-shadow duration-300">
            <Terminal className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-extrabold text-white">
            Cyber<span className="text-cyan-400">Hex</span>
          </span>
        </Link>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl border border-neutral-800/60 bg-neutral-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-[0_0_40px_rgba(6,182,212,0.06),0_20px_40px_rgba(0,0,0,0.5)]"
        >
          <SignUp />
        </motion.div>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-neutral-500">
          Already have an account?{" "}
          <Link
            to="/"
            className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}