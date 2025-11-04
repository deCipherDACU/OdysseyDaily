
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';

interface LiquidGlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'glass' | 'solid' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
  ripple?: boolean;
  asChild?: boolean;
}

export const LiquidGlassButton = React.forwardRef<HTMLButtonElement, LiquidGlassButtonProps>(({
  children,
  className,
  variant = 'glass',
  size = 'md',
  glow = false,
  ripple = true,
  disabled,
  onClick,
  asChild = false,
  ...props
}, ref) => {
  const [ripples, setRipples] = React.useState<Array<{ x: number; y: number; id: number }>>([]);

  const variants = {
    glass: 'bg-white/15 backdrop-blur-md border-white/20 text-white hover:bg-white/15',
    solid: 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600',
    gradient: 'bg-gradient-to-r from-primary via-accent to-secondary text-white hover:opacity-90'
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (ripple && !disabled) {
      const button = e.currentTarget;
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const newRipple = { x, y, id: Date.now() };
      setRipples(prev => [...prev, newRipple]);
      
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== newRipple.id));
      }, 600);
    }
    
    if (onClick) {
      onClick(e);
    }
  };

  const Comp = asChild ? Slot : 'button';

  return (
    <motion.button
      ref={ref}
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        'relative overflow-hidden rounded-xl border font-medium',
        'shadow-[0_8px_32px_rgba(0,0,0,0.1)]',
        'transition-all duration-300',
        'hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)]',
        disabled && 'opacity-50 cursor-not-allowed hover:scale-100',
        glow && 'gradient-glow-button',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled}
      onClick={handleClick}
      {...props}
    >
      {asChild ? children : (
        <>
          {ripples.map(ripple => (
            <motion.div
              key={ripple.id}
              className="absolute bg-white/30 rounded-full pointer-events-none"
              style={{
                left: ripple.x - 20,
                top: ripple.y - 20,
                width: 40,
                height: 40,
              }}
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 4, opacity: 0 }}
              transition={{ duration: 0.6 }}
            />
          ))}
          
          <span className="relative z-10 flex items-center justify-center space-x-2">
            {children}
          </span>
        </>
      )}
    </motion.button>
  );
});

LiquidGlassButton.displayName = 'LiquidGlassButton';
