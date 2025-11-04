
'use client';

import { Sparkles, Sword } from 'lucide-react';
import Link from 'next/link';
import AppLogo from '@/components/layout/AppLogo';
import { motion } from 'framer-motion';
import { LiquidGlass } from '@/components/ui/LiquidGlass';
import { LiquidGlassButton } from '@/components/ui/LiquidGlassButton';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 text-center max-w-2xl mx-auto"
      >
        <div className="flex justify-center mb-6">
          <AppLogo />
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-headline font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-secondary tracking-tighter mb-4">
          LifeQuest RPG
        </h1>
        <p className="text-lg md:text-xl font-headline text-muted-foreground mb-8">
          Level Up Your Life, One Quest at a Time
        </p>

        <LiquidGlass
            variant='light'
            effect='float'
            className="mb-8"
        >
          <div className="p-6">
            <h2 className="flex items-center justify-center gap-2 font-headline text-2xl text-white">
              <Sparkles className="text-primary" />
              Transform Your To-Do List
            </h2>
            <p className="font-body text-muted-foreground mt-2">
              Stop surviving, start thriving. Turn your daily tasks into epic quests, gain experience, and build the ultimate version of yourself.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
              <Link href="/welcome" passHref>
                <LiquidGlassButton size="lg" variant='gradient' glow>
                  <Sword className="mr-2 h-5 w-5" />
                  Begin Your Quest
                </LiquidGlassButton>
              </Link>
              <Link href="/dashboard" passHref>
                <LiquidGlassButton size="lg" variant="glass">
                  Continue Adventure
                </LiquidGlassButton>
              </Link>
            </div>
          </div>
        </LiquidGlass>
        
        <div className="text-xs text-muted-foreground font-body">
          <p>This is a fictional application created for demonstration purposes.</p>
          <p>Click any button to enter the app experience.</p>
        </div>
      </motion.div>
    </main>
  );
}
