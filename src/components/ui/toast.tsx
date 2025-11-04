"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Check, Info, Shield, Star, Swords, TrendingUp, TriangleAlert, X } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

import { cn } from "@/lib/utils"
import { LiquidGlassCard } from "./LiquidGlassCard"

const toastVariants = {
  default: {
    Icon: Info,
    iconClass: "text-blue-400",
    glowClass: "glow-blue"
  },
  success: {
    Icon: Check,
    iconClass: "text-green-400",
    glowClass: "glow-green"
  },
  destructive: {
    Icon: TriangleAlert,
    iconClass: "text-red-400",
    glowClass: "glow-red"
  },
  levelUp: {
    Icon: TrendingUp,
    iconClass: "text-yellow-400",
    glowClass: "glow-yellow"
  },
  questComplete: {
    Icon: Swords,
    iconClass: "text-primary",
    glowClass: "glow-primary"
  },
  newItem: {
    Icon: Shield,
    iconClass: "text-purple-400",
    glowClass: "glow-purple"
  }
};

export type ToastVariant = keyof typeof toastVariants;

export interface ToastProps
  extends React.HTMLAttributes<HTMLDivElement> {
  id: string;
  variant?: ToastVariant;
  title?: React.ReactNode;
  description?: React.ReactNode;
  duration?: number;
  onDismiss: (toastId: string) => void;
}

const Toast = React.forwardRef<
  HTMLDivElement,
  ToastProps
>(({ className, variant = 'default', id, title, description, duration = 5000, onDismiss, ...props }, ref) => {

  const { Icon, iconClass, glowClass } = toastVariants[variant] || toastVariants.default;
  
  React.useEffect(() => {
    if(duration === Infinity) return;
    const timer = setTimeout(() => {
      onDismiss(id)
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onDismiss]);

  return (
    <motion.li
      ref={ref as any}
      layout
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={cn("w-full max-w-sm", className)}
      {...props}
    >
      <LiquidGlassCard className="p-0 overflow-hidden" glow>
        <div className="flex items-start gap-4 p-4">
          <div className={cn("flex-shrink-0 w-12 h-12 rounded-lg bg-card flex items-center justify-center", iconClass)}>
            <Icon className="h-7 w-7" />
          </div>
          <div className="flex-1 space-y-1">
            {title && <p className="text-base font-semibold text-white">{title}</p>}
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
           <button
              onClick={() => onDismiss(id)}
              className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
        </div>
         {duration !== Infinity && (
            <div className="absolute bottom-0 left-0 h-1 bg-primary/20 w-full">
                <motion.div
                    className="h-1 bg-primary"
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: duration / 1000, ease: 'linear' }}
                />
            </div>
        )}
      </LiquidGlassCard>
    </motion.li>
  )
})
Toast.displayName = "Toast"


export { Toast }
