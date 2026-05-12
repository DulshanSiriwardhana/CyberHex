import { motion } from 'framer-motion';

export const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <motion.div 
        whileHover={{ y: -4 }}
        className={`bg-zinc-950 border border-zinc-800 rounded-2xl p-6 backdrop-blur-xl ${className}`}
    >
        {children}
    </motion.div>
);
