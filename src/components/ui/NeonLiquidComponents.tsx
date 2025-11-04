// src/components/ui/NeonLiquidComponents.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NeonGlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'cyan' | 'magenta' | 'purple' | 'green' | 'pink' | 'multi';
  glow?: boolean;
  pulse?: boolean;
  flicker?: boolean;
}

export const NeonGlassCard: React.FC<NeonGlassCardProps> = ({
  children,
  className,
  variant = 'cyan',
  glow = false,
  pulse = false,
  flicker = false
}) => {
  const variants = {
    cyan: 'neon-glass-cyan',
    magenta: 'neon-glass-magenta',
    purple: 'neon-glass-purple',
    green: 'neon-glass-green',
    pink: 'neon-glass-pink',
    multi: 'neon-glass'
  };

  const glowVariants = {
    cyan: 'neon-glow-cyan',
    magenta: 'neon-glow-magenta',
    purple: 'neon-glow-purple',
    green: 'neon-glow-green',
    pink: 'shadow-neon-cyan', // fallback
    multi: 'shadow-neon-multi'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ 
        y: -5, 
        scale: 1.02,
        transition: { type: "spring", stiffness: 400, damping: 25 }
      }}
      className={cn(
        'relative overflow-hidden rounded-2xl backdrop-blur-lg',
        variants[variant],
        glow && glowVariants[variant],
        pulse && 'animate-neon-pulse',
        flicker && 'animate-neon-flicker',
        'transition-all duration-300',
        className
      )}
    >
      {/* Animated border gradient */}
      <div className="absolute inset-0 rounded-2xl animate-neon-border-flow" />
      
      {/* Inner glow effect */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-60" />
      
      {/* Content */}
      <div className="relative z-10 p-1">
        {children}
      </div>
    </motion.div>
  );
};

interface NeonGlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'cyan' | 'magenta' | 'purple' | 'green';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
  pulse?: boolean;
}

export const NeonGlassButton: React.FC<NeonGlassButtonProps> = ({
  children,
  className,
  variant = 'cyan',
  size = 'md',
  glow = false,
  pulse = false,
  disabled,
  ...props
}) => {
  const variants = {
    cyan: 'text-neon-cyan border-neon-cyan',
    magenta: 'text-neon-magenta border-neon-magenta',
    purple: 'text-neon-purple border-neon-purple',
    green: 'text-neon-green border-neon-green'
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  const glowColors = {
    cyan: 'hover:shadow-neon-cyan',
    magenta: 'hover:shadow-neon-magenta',
    purple: 'hover:shadow-neon-purple',
    green: 'hover:shadow-neon-green'
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        'neon-button relative overflow-hidden rounded-xl font-medium',
        'backdrop-blur-md transition-all duration-300',
        variants[variant],
        sizes[size],
        glow && glowColors[variant],
        pulse && 'animate-neon-pulse',
        disabled && 'opacity-50 cursor-not-allowed hover:scale-100',
        className
      )}
      disabled={disabled}
      {...props}
    >
      {/* Ripple effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
      
      {/* Content */}
      <span className="relative z-10 flex items-center justify-center space-x-2">
        {children}
      </span>
    </motion.button>
  );
};

interface NeonProgressProps {
  value: number;
  max?: number;
  variant?: 'cyan' | 'magenta' | 'multi';
  animated?: boolean;
  showValue?: boolean;
}

export const NeonProgress: React.FC<NeonProgressProps> = ({
  value,
  max = 100,
  variant = 'cyan',
  animated = true,
  showValue = false
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const progressColors = {
    cyan: 'bg-gradient-to-r from-neon-cyan to-neon-blue',
    magenta: 'bg-gradient-to-r from-neon-magenta to-neon-pink',
    multi: 'bg-gradient-to-r from-neon-cyan via-neon-magenta to-neon-purple'
  };

  return (
    <div className="neon-progress-bar relative w-full h-4 rounded-full overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />
      
      {/* Progress fill */}
      <motion.div
        className={cn(
          'neon-progress-fill h-full rounded-full relative overflow-hidden',
          progressColors[variant]
        )}
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: animated ? 1.5 : 0, ease: "easeOut" }}
      >
        {/* Animated shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
      </motion.div>
      
      {/* Value display */}
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-white drop-shadow-lg">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  );
};
