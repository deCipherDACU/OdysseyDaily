'use client';

import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import { useUser } from "@/context/UserContext";
import { Plus, Zap, Dumbbell, BrainCircuit, Briefcase } from "lucide-react";
import { LiquidGlassCard } from "../ui/LiquidGlassCard";
import { LiquidGlassButton } from "../ui/LiquidGlassButton";

const skillTreeIcons = {
    'Physical': Dumbbell,
    'Mental': BrainCircuit,
    'Life Skills': Briefcase,
};

const SkillTree = () => {
  const { user, levelUpSkill } = useUser();
  if (!user) return null;

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {user.skillTrees.map((tree) => {
        const Icon = skillTreeIcons[tree.name];
        return (
            <LiquidGlassCard key={tree.name} className="p-6">
            <div className="flex items-center gap-2 mb-2">
                {Icon && <Icon className="h-6 w-6 text-primary" />}
                <h3 className="font-headline text-xl font-bold text-white">{tree.name}</h3>
            </div>
            <p className="text-muted-foreground mb-6 text-sm">{tree.description}</p>
            <div className="space-y-6">
                {tree.skills.map((skill) => {
                const canLevelUp = user.skillPoints >= skill.cost && skill.level < skill.maxLevel;
                return (
                    <div key={skill.name}>
                    <div className="flex justify-between items-center mb-1">
                        <h4 className="font-semibold font-headline text-white">{skill.name}</h4>
                        <Badge variant="secondary">Lvl {skill.level} / {skill.maxLevel}</Badge>
                    </div>
                    <Progress value={(skill.level / skill.maxLevel) * 100} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1 min-h-[2.5rem]">{skill.description}</p>
                    <LiquidGlassButton 
                        size="sm"
                        variant="glass"
                        className="mt-2 w-full"
                        disabled={!canLevelUp}
                        onClick={() => levelUpSkill(tree.name, skill.name)}
                    >
                        <Plus className="mr-2"/>
                        Upgrade
                        <span className="ml-auto flex items-center gap-1">
                        {skill.cost} <Zap className="h-3 w-3 text-yellow-400" />
                        </span>
                    </LiquidGlassButton>
                    </div>
                );
                })}
            </div>
            </LiquidGlassCard>
        );
      })}
    </div>
  );
};

export default SkillTree;
