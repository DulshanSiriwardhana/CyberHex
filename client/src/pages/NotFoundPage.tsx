import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-neutral-950 bg-cyber-grid flex flex-col items-center justify-center px-4 relative">
      <div className="pointer-events-none fixed inset-0 bg-cyber-radial" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 text-center max-w-md"
      >
        {/* 404 hex number */}
        <div className="text-[140px] sm:text-[180px] font-extrabold font-mono leading-none tracking-tighter bg-gradient-to-br from-green-400 via-green-300 to-violet-400 bg-clip-text text-transparent select-none">
          404
        </div>

        <h1 className="text-2xl font-extrabold text-white mt-4">
          Page Not Found
        </h1>
        <p className="mt-3 text-neutral-400 leading-relaxed">
          The layer you're looking for doesn't exist in this architecture.
          Check the URL or head back to safety.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/">
            <Button size="lg">
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="outline" size="lg">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}