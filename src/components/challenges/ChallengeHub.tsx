
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Plus } from 'lucide-react';
import { CreateChallengeDialog } from './CreateChallengeDialog';
import { useCollection } from '@/firebase';
import { useUser } from '@/firebase/auth/use-user';
import { useFirestore } from '@/firebase';
import { challengesCollection } from '@/lib/firebase/firestore/habits';
import { LiquidGlassCard } from '../ui/LiquidGlassCard';
import { LiquidGlassButton } from '../ui/LiquidGlassButton';

export const ChallengeHub: React.FC = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { user } = useUser();
  const { db } = useFirestore();
  const challengesRef = user ? challengesCollection(db, user.uid) : null;
  const { data: challenges, isLoading } = useCollection(challengesRef);

  return (
    <div className="space-y-6">
       {isLoading && <p>Loading challenges...</p>}
      
       {!isLoading && challenges && challenges.length > 0 && (
         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
           {/* TODO: Render challenges */}
         </div>
       )}

      {!isLoading && (!challenges || challenges.length === 0) && (
        <LiquidGlassCard className="p-8 text-center border-dashed">
            <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-headline font-semibold mb-2 text-white">No Active Challenges</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
              Start a new challenge to track your long-term goals.
            </p>
            <LiquidGlassButton onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Start a New Challenge
            </LiquidGlassButton>
        </LiquidGlassCard>
      )}
      
      <CreateChallengeDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog} 
      />
    </div>
  );
};
