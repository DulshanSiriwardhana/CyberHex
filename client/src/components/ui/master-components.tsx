import { motion } from 'framer-motion';
import React from 'react';

export const GlassCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`cyber-card-max p-6 ${className}`}
    >
      {children}
    </motion.div>
  );
};

export const Button = ({ children, onClick, variant = 'primary', className = '' }: { children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'ghost' | 'outline'; className?: string }) => {
  const base = "relative px-6 py-3 rounded-xl font-spectral tracking-wider transition-all duration-300 font-bold uppercase text-xs";

  const variants = {
    primary: "bg-green-500 text-black hover:bg-green-400 shadow-[0_0_20px_rgba(34,197,94,0.2)] hover:shadow-[0_0_30px_rgba(34,197,94,0.4)]",
    ghost: "text-neutral-400 hover:text-white hover:bg-white/5",
    outline: "border border-neutral-800 text-neutral-300 hover:border-green-500/50 hover:text-green-400 hover:bg-green-500/5"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02, translateY: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`${base} ${variants[variant]} ${className}`}
      onClick={onClick}
    >
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-transparent via-white/10 to-transparent animate-scan-line" />
      {children}
    </motion.button>
  );
};

export const Skeleton = ({ className = '' }: { className?: string }) => (
  <motion.div
    animate={{ opacity: [0.3, 0.6, 0.3] }}
    transition={{ duration: 2, repeat: Infinity }}
    className={`bg-neutral-800/50 rounded-lg ${className}`}
  />
);
