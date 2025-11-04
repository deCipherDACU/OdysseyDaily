'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  Settings,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Lock,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

import { cn } from '@/lib/utils';
import AppLogo from './AppLogo';
import { useUser } from '@/context/UserContext';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface NavItem {
    href: string;
    label: string;
    icon: React.ElementType;
    requiredLevel: number;
}

interface NavGroup {
    name: string;
    items: NavItem[];
}

const SidebarContext = createContext<{
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
} | null>(null);

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}

function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(true);
    return (
        <SidebarContext.Provider value={{ isOpen, setIsOpen }}>
        {children}
        </SidebarContext.Provider>
    );
}


function Sidebar({ navGroups, pathname, userLevel, unreadNotifications }: { navGroups: NavGroup[], pathname: string, userLevel: number, unreadNotifications: number }) {
    const { isOpen, setIsOpen } = useSidebar();
    
    return (
        <>
            <motion.div
                layout
                initial={{ width: '5rem' }}
                animate={{ width: isOpen ? '16rem' : '5rem' }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className={cn(
                    "hidden md:flex flex-col bg-card/70 backdrop-blur-lg border-r border-white/10 transition-all duration-300"
                )}
            >
                <div className={cn("flex items-center h-16 border-b border-white/10 px-4", isOpen ? "justify-between" : "justify-center")}>
                    
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2, delay: 0.1 }}
                        >
                            <AppLogo />
                        </motion.div>
                    )}
                    
                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="shrink-0">
                        {isOpen ? <PanelLeftClose /> : <PanelLeftOpen />}
                    </Button>
                </div>
                <ScrollArea className="flex-1">
                    <TooltipProvider>
                        <nav className="py-4 px-2 space-y-2">
                        {navGroups.map(group => (
                            <div key={group.name}>
                                
                                {isOpen && (
                                    <motion.h3 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="px-4 py-2 text-xs font-semibold uppercase text-muted-foreground"
                                    >
                                        {group.name}
                                    </motion.h3>
                                )}
                                
                                <div className="space-y-1">
                                {group.items.map(({ href, label, icon: Icon, requiredLevel }) => {
                                    const isActive = pathname.startsWith(href);
                                    const isLocked = userLevel < requiredLevel;

                                    const linkContent = (
                                        <div className={cn(
                                            "flex items-center gap-4 rounded-md text-foreground/80 transition-colors duration-200",
                                            "group",
                                            isOpen ? "px-4 py-2" : "justify-center p-4",
                                            isLocked ? "text-muted-foreground/60 cursor-not-allowed" : "hover:bg-primary/10 hover:text-foreground",
                                            isActive && !isLocked && "bg-primary/20 text-primary font-semibold"
                                        )}>
                                            <Icon className="h-5 w-5 shrink-0" />
                                            
                                            {isOpen && (
                                                <motion.span 
                                                    initial={{ opacity: 0, width: 0 }}
                                                    animate={{ opacity: 1, width: 'auto' }}
                                                    exit={{ opacity: 0, width: 0 }}
                                                    className="truncate"
                                                >
                                                    {label}
                                                </motion.span>
                                            )}
                                            
                                            {label === 'Notifications' && unreadNotifications > 0 && isOpen && (
                                                <Badge className="ml-auto bg-destructive text-destructive-foreground">{unreadNotifications}</Badge>
                                            )}
                                            {isLocked && isOpen && (
                                                <Lock className="h-4 w-4 ml-auto text-muted-foreground" />
                                            )}
                                        </div>
                                    );
                                    
                                    if (isLocked) {
                                        return (
                                            <Tooltip key={href}>
                                                <TooltipTrigger className="w-full">
                                                    {linkContent}
                                                </TooltipTrigger>
                                                <TooltipContent side="right">
                                                    <p>Unlock at Level {requiredLevel}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        )
                                    }

                                    return (
                                        <Link key={href} href={href} aria-disabled={isLocked} className={cn(isLocked && "pointer-events-none")}>
                                            {linkContent}
                                        </Link>
                                    );
                                })}
                                </div>
                            </div>
                        ))}
                        </nav>
                    </TooltipProvider>
                </ScrollArea>
                <div className="mt-auto p-2 border-t border-white/10">
                    <Link href="/settings" className={cn(
                        "flex items-center gap-4 rounded-md text-foreground/80 transition-colors duration-200 hover:bg-primary/10 hover:text-foreground",
                        "group",
                        isOpen ? "px-4 py-2" : "justify-center p-4",
                        pathname.startsWith('/settings') && "bg-primary/20 text-primary font-semibold"
                    )}>
                        <Settings className="h-5 w-5 shrink-0" />
                        
                        {isOpen && (
                            <motion.span 
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto' }}
                                exit={{ opacity: 0, width: 0 }}
                            >
                                Settings
                            </motion.span>
                        )}
                        
                    </Link>
                </div>
            </motion.div>
        </>
    );
};

export function AppSidebar({ navGroups, pathname, userLevel, unreadNotifications }: { navGroups: NavGroup[], pathname: string, userLevel: number, unreadNotifications: number }) {
    return (
        <SidebarProvider>
            <Sidebar navGroups={navGroups} pathname={pathname} userLevel={userLevel} unreadNotifications={unreadNotifications} />
        </SidebarProvider>
    )
}

export function AppSidebarTrigger() {
    // A placeholder for a potential mobile trigger if needed in the future
    return <div/>
}

    
