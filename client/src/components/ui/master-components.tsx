import { motion } from 'framer-motion';
import React from 'react';
import { tokens } from '../../const/designTokens';

export const GlassCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className={`bg-[${tokens.colors.card}] backdrop-blur-xl border border-[${tokens.colors.border}] rounded-[${tokens.borderRadius.lg}] p-[${tokens.spacing.lg}] shadow-2xl hover:border-white/20 transition-all ${className}`}
    >
      {children}
    </motion.div>
  );
};

export const Button = ({ children, onClick, variant = 'primary', className = '' }: { children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'ghost'; className?: string }) => {
  const base = "relative px-6 py-3 rounded-[0.75rem] font-spectral tracking-wider transition-all";
  const styles = variant === 'primary' 
    ? "bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:shadow-[0_0_20px_rgba(52,211,153,0.2)]"
    : "text-gray-400 hover:text-white hover:bg-white/5";

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${base} ${styles} ${className}`}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
};

export const Skeleton = ({ className = '' }: { className?: string }) => (
  <motion.div
    animate={{ opacity: [0.5, 1, 0.5] }}
    transition={{ duration: 1.5, repeat: Infinity }}
    className={`bg-white/5 rounded-md ${className}`}
  />
);
