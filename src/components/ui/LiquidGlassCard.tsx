
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LiquidGlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  gradient?: boolean;
  completed?: boolean;
}

export const LiquidGlassCard: React.FC<LiquidGlassCardProps> = ({
  children,
  className,
  hover = true,
  glow = false,
  gradient = false,
  completed = false
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? {
        y: -4,
        scale: 1.02,
        boxShadow: '0 32px 64px rgba(0, 0, 0, 0.15), 0 16px 32px rgba(0, 0, 0, 0.1)'
      } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn(
        // Base glass styles
        'relative overflow-hidden rounded-2xl border backdrop-blur-xl',
        
        // Default background
        'bg-black/10 border-white/20',
        
        // Completed state
        completed && 'bg-green-500/15 border-green-400/30',
        
        // Gradient overlay
        gradient && 'bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-green-500/10',
        
        // Glow effect
        glow && 'shadow-[0_0_30px_rgba(139,92,246,0.3)]',
        
        // Default shadow
        'shadow-[0_8px_32px_rgba(0,0,0,0.1)]',
        
        // Hover effects
        hover && 'hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)] transition-all duration-300',
        
        className
      )}
    >
      {/* Content container */}
      <div className="relative z-10">
        {children}
      </div>
      
    </motion.div>
  );
};
