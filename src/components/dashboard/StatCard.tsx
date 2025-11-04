
import { cn } from '@/lib/utils';
import React from 'react';
import { LiquidGlassCard } from '../ui/LiquidGlassCard';

type StatCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  className?: string;
};

const StatCardComponent = ({ title, value, icon, description, className }: StatCardProps) => {
  return (
    <LiquidGlassCard className={cn("p-4", className)}>
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium font-headline text-white">{title}</h3>
            <div className="text-muted-foreground">{icon}</div>
        </div>
        <div>
            <div className="text-2xl font-bold font-headline text-white">{value}</div>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
    </LiquidGlassCard>
  );
};

const StatCard = React.memo(StatCardComponent);
export default StatCard;
