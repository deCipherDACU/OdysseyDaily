

'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import '../adhd-mode.css';
import {
  LayoutGrid, BookOpen, GitMerge, User, Trophy, ShoppingBag, CalendarCheck, Notebook, CalendarDays, Timer, Wind, Sword, Bot, Bell, FileText, Plus, Waves, Shield
} from 'lucide-react';

import Header from '@/components/layout/Header';
import { AppSidebar } from '@/components/layout/SidebarNav';
import { useUser } from '@/context/UserContext';
import { Skeleton } from '@/components/ui/skeleton';

const navGroups = [
  {
    name: "Core",
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid, requiredLevel: 1 },
      { href: '/tasks', label: 'Quests', icon: BookOpen, requiredLevel: 1 },
      { href: '/dungeons', label: 'Special Quests', icon: GitMerge, requiredLevel: 5 },
    ]
  },
  {
    name: "Character",
    items: [
      { href: '/character', label: 'Character', icon: User, requiredLevel: 1 },
      { href: '/achievements', label: 'Achievements', icon: Trophy, requiredLevel: 1 },
      { href: '/shop', label: 'Rewards', icon: ShoppingBag, requiredLevel: 1 }
    ]
  },
  {
      name: "Review",
      items: [
        { href: '/journal', label: 'Journal', icon: Notebook, requiredLevel: 1 },
        { href: '/notes', label: 'Notes', icon: FileText, requiredLevel: 1 },
        { href: '/weekly-review', label: 'Weekly Review', icon: CalendarCheck, requiredLevel: 1 },
      ]
  },
  {
      name: "Tools",
      items: [
          { href: '/timetable', label: 'Timetable', icon: CalendarDays, requiredLevel: 1 },
          { href: '/pomodoro', label: 'Pomodoro', icon: Timer, requiredLevel: 1 },
          { href: '/breathing', label: 'Breathing', icon: Wind, requiredLevel: 1 },
          { href: '/soundscapes', label: 'Soundscapes', icon: Waves, requiredLevel: 1 },
      ]
  },
  {
      name: "Habits & Challenges",
      items: [
          { href: '/habits', label: 'Habits & Challenges', icon: BookOpen, requiredLevel: 1 },
          { href: '/boss-fight', label: 'Boss Fight', icon: Sword, requiredLevel: 1 },
          { href: '/notifications', label: 'Notifications', icon: Bell, requiredLevel: 1 }
      ]
  }
];

function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { user, loading } = useUser();

    const unreadNotifications = user?.notifications?.filter(n => !n.read).length || 0;

    React.useEffect(() => {
        if (user?.preferences?.adhdMode) {
            document.body.classList.add('adhd-mode');
        } else {
            document.body.classList.remove('adhd-mode');
        }
    }, [user?.preferences?.adhdMode]);

    return (
        <>
            <div className="flex min-h-screen w-full">
                <div className="sidebar">
                    <AppSidebar
                        navGroups={navGroups}
                        pathname={pathname}
                        userLevel={user?.level ?? 1}
                        unreadNotifications={unreadNotifications}
                    />
                </div>
                <div className="flex flex-1 flex-col">
                    <div className="header">
                        <Header />
                    </div>
                    <main className="main-content flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                        {loading ? (
                            <>
                                <Skeleton className="h-8 w-64 mb-4" />
                                <Skeleton className="h-4 w-96 mb-6" />
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    <Skeleton className="h-32" />
                                    <Skeleton className="h-32" />
                                    <Skeleton className="h-32" />
                                </div>
                            </>
                        ) : (
                            children
                        )}
                    </main>
                </div>
            </div>
        </>
    );
}

export default React.memo(AppLayout);
