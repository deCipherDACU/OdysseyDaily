

'use client';
import { Note } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '../ui/badge';
import { NoteActions } from './NoteActions';
import { cn } from '@/lib/utils';
import { CheckSquare } from 'lucide-react';
import { motion } from 'framer-motion';

interface NoteCardProps {
    note: Note;
    onUpdate: (note: Partial<Note> & { id: string }) => void;
    onDelete: (id: string) => void;
}

export const NoteCard = ({ note, onUpdate, onDelete }: NoteCardProps) => {
    
    const checklistProgress = note.type === 'checklist' && note.checklistItems ?
        (note.checklistItems.filter(i => i.isCompleted).length / note.checklistItems.length) * 100
        : 0;

    return (
        <motion.div 
            className="flex cursor-pointer flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/20 backdrop-blur-2xl transition-all duration-300 hover:border-primary/50 hover:bg-white/10 transform hover:-translate-y-1"
            layout
        >
            <div className="flex justify-between items-start">
                <h3 className="font-bold text-white pr-4">{note.title}</h3>
                <NoteActions note={note} onUpdate={onUpdate} onDelete={onDelete} />
            </div>
            
            <p className="text-sm leading-relaxed text-white/70 line-clamp-3 flex-grow">
                {note.content}
            </p>

            {note.type === 'checklist' && (note.checklistItems?.length || 0) > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckSquare className="h-4 w-4" />
                    <span>{note.checklistItems?.filter(i => i.isCompleted).length} / {note.checklistItems?.length}</span>
                </div>
            )}

            <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-white/50">
                    {note.updatedAt && formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                </span>
                <div className="flex gap-2">
                    {note.isPinned && <Badge variant="secondary">Pinned</Badge>}
                     {note.tags?.slice(0, 2).map(tag => (
                        <Badge key={tag} variant="secondary">#{tag}</Badge>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};
