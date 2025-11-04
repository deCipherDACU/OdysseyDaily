'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ImagePlus, Send, Trash2, Sparkles, Coins } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { JournalEntry } from '@/lib/types';
import { Badge } from '../ui/badge';
import { LiquidGlassCard } from '../ui/LiquidGlassCard';
import { LiquidGlassButton } from '../ui/LiquidGlassButton';

type JournalEditorProps = {
    onSave: (entry: Omit<JournalEntry, 'id' | 'date'>) => void;
};

export function JournalEditor({ onSave }: JournalEditorProps) {
    const [text, setText] = useState('');
    const [image, setImage] = useState<string | null>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setImage(event.target.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        if (text || image) {
            onSave({ text: text || undefined, imageUrl: image || undefined });
            setText('');
            setImage(null);
        } else {
            toast({ title: "Nothing to save", variant: 'destructive' });
        }
    };

    const clearEntry = () => {
        setText('');
        setImage(null);
    };

    return (
        <LiquidGlassCard className="p-0">
            <div className="p-6">
                <h3 className="font-headline text-xl font-semibold text-white">New Journal Entry</h3>
            </div>
            <div className="px-6 space-y-4">
                 <Textarea
                    placeholder="What's on your mind?..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={5}
                />
                {image && (
                    <div className="relative">
                        <img src={image} alt="Preview" className="rounded-lg max-h-60 w-auto" />
                        <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-8 w-8" onClick={() => setImage(null)}><Trash2 /></Button>
                    </div>
                )}
            </div>
            <div className="p-6 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <LiquidGlassButton variant="glass" size="sm" onClick={() => fileInputRef.current?.click()}>
                        <ImagePlus />
                    </LiquidGlassButton>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*,image/gif" onChange={handleImageUpload} />
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-4">
                        <Badge variant="outline" className="text-sm border-primary/50 text-primary">
                            <Sparkles className="mr-2 h-4 w-4" /> +25 XP
                        </Badge>
                         <Badge variant="outline" className="text-sm border-yellow-500/50 text-yellow-500">
                            <Coins className="mr-2 h-4 w-4" /> +5 Coins
                        </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                        {(text || image) && <LiquidGlassButton variant="glass" onClick={clearEntry}>Clear</LiquidGlassButton>}
                        <LiquidGlassButton onClick={handleSave} disabled={!text && !image}>
                            <Send className="mr-2" />
                            Save Entry
                        </LiquidGlassButton>
                    </div>
                </div>
            </div>
        </LiquidGlassCard>
    );
}
