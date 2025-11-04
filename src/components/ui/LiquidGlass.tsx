
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LiquidGlassProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'light' | 'medium' | 'heavy' | 'colored';
  effect?: 'shimmer' | 'wave' | 'bubble' | 'float' | 'none';
  color?: 'purple' | 'blue' | 'green' | 'amber' | 'rose';
  animated?: boolean;
  hover?: boolean;
}

export const LiquidGlass: React.FC<LiquidGlassProps> = ({
  children,
  className,
  variant = 'medium',
  effect = 'none',
  color = 'purple',
  animated = true,
  hover = true,
  ...props
}) => {
  const variants = {
    light: 'bg-black/10 backdrop-blur-sm border-white/10',
    medium: 'bg-black/10 backdrop-blur-md border-white/20',
    heavy: 'bg-black/10 backdrop-blur-lg border-white/25',
    colored: getColorVariant(color)
  };

  const effects = {
    shimmer: 'glass-shimmer',
    wave: 'liquid-flow',
    bubble: 'liquid-bubble',
    float: 'glass-float',
    none: ''
  };

  const Component = animated ? motion.div : 'div';

  const animationProps = animated ? {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    whileHover: hover ? { 
      y: -2, 
      scale: 1.02,
      boxShadow: '0 32px 64px rgba(0, 0, 0, 0.15)'
    } : {},
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 30 
    }
  } : {};

  return (
    <Component
      {...animationProps}
      className={cn(
        // Base glass styles
        'relative overflow-hidden rounded-2xl border',
        'shadow-[0_8px_32px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.2)]',
        
        // Variant styles
        variants[variant],
        
        // Effect styles
        effects[effect],
        
        // Hover effects
        hover && 'hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)] transition-all duration-300',
        
        className
      )}
      {...props}
    >
      {/* Top highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Bottom subtle shadow */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-black/5 to-transparent" />
    </Component>
  );
};

function getColorVariant(color: string): string {
  const colorMap = {
    purple: 'bg-purple-500/10 backdrop-blur-md border-purple-500/20',
    blue: 'bg-blue-500/10 backdrop-blur-md border-blue-500/20',
    green: 'bg-green-500/10 backdrop-blur-md border-green-500/20',
    amber: 'bg-amber-500/10 backdrop-blur-md border-amber-500/20',
    rose: 'bg-rose-500/10 backdrop-blur-md border-rose-500/20'
  };
  return colorMap[color as keyof typeof colorMap] || colorMap.purple;
}
