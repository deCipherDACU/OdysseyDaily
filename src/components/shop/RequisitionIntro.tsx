
'use client';

import { Coins } from "lucide-react";
import Image from "next/image";

interface RequisitionIntroProps {
  onClose: () => void;
}

export function RequisitionIntro({ onClose }: RequisitionIntroProps) {
  return (
    <div className="fixed inset-0 z-50 flex min-h-screen w-full flex-col items-center justify-center bg-background-dark/80 p-4 backdrop-blur-xl">
      <div 
        className="relative w-full max-w-4xl rounded-xl border border-primary/20 bg-background-dark/80 p-4 shadow-2xl shadow-primary/10"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>
        <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full border border-primary/30 bg-primary/20 px-4 py-1.5">
          <Coins className="h-5 w-5 text-amber-300" />
          <p className="font-bold text-white"><span className="text-white/60">Your Gold: </span>1,250</p>
        </div>
        <div className="flex flex-col items-center justify-start gap-4 md:flex-row md:items-center">
          <div className="w-full max-w-xs shrink-0 md:max-w-sm">
            <Image 
              width={600}
              height={800}
              className="h-auto w-full rounded-lg object-cover" 
              alt="Stylized illustration of a wise, robed Requisition Master with glowing eyes." 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDcY8mwDfNZBzdXay7yGT0U0N7WWczrkD-t4wyP58v2lJul87oDqW463PiZDF6T-S3CnFFT8SvRggJGPneyuOdV_BduXkrQZ5U8TN5YHixiYswEShXG5JTPCQCRyj2fUwaeYBB-UhIb5GSPVeqK4PCbGeCVK22R16NK7vcIom7f3V_8HjONFLTXZXcWs8Nt31g5AzbE80FfMtGedhaJk8Ae8UC7XT1ZRCNsAYeYaK6VqKkiU9XmGqJt3c8c9i1doGavWI5t21nyhiA"
            />
          </div>
          <div className="flex w-full grow flex-col items-start justify-center gap-4 py-4 text-center md:px-4 md:text-left">
            <div>
              <p className="text-sm font-medium leading-normal text-primary">Welcome, Adventurer!</p>
              <p className="font-headline text-3xl font-bold leading-tight tracking-tighter text-white">Requisitions</p>
            </div>
            <p className="text-base font-normal leading-relaxed text-white/70">
              Here, you can spend the Gold you've earned from completing your goals to acquire powerful upgrades, items, and skills to help you on your journey.
            </p>
            <div className="flex w-full flex-col-reverse items-center justify-center gap-3 pt-2 md:flex-row md:justify-start">
              <button 
                onClick={onClose}
                className="flex h-12 w-full max-w-xs cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-transparent px-5 text-base font-bold leading-normal tracking-[0.015em] text-white/70 transition-colors hover:bg-white/10 hover:text-white md:w-auto"
              >
                <span className="truncate">Skip for now</span>
              </button>
              <button 
                onClick={onClose}
                className="flex h-12 w-full max-w-xs cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-primary px-5 text-base font-bold leading-normal tracking-[0.015em] text-white shadow-lg shadow-primary/30 transition-transform hover:scale-105 md:w-auto"
              >
                <span className="truncate">Explore the Shop</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
