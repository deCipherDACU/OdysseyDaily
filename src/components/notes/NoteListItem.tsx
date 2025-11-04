

'use client';
import { Note } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '../ui/badge';
import { NoteActions } from './NoteActions';
import { cn } from '@/lib/utils';
import { CheckSquare } from 'lucide-react';

interface NoteListItemProps {
    note: Note;
    onUpdate: (note: Partial<Note> & { id: string }) => void;
    onDelete: (id: string) => void;
}

export const NoteListItem = ({ note, onUpdate, onDelete }: NoteListItemProps) => {

     const checklistProgress = note.type === 'checklist' && note.checklistItems ?
        (note.checklistItems.filter(i => i.isCompleted).length / note.checklistItems.length) * 100
        : 0;

    return (
        <div className={cn(
            "flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/5 shadow-lg backdrop-blur-xl transition-all duration-300",
            note.isPinned && "border-primary/50",
            "hover:border-primary/30 hover:bg-white/10"
        )}>
            <div className="flex-grow">
                 <h3 className="font-bold text-lg text-white">{note.title}</h3>
                <p className="text-sm text-white/70 truncate">
                    {note.content.substring(0, 150)}{note.content.length > 150 ? '...' : ''}
                </p>
                 <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-white/50">
                        Updated {note.updatedAt && formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                    </span>
                     {note.type === 'checklist' && (note.checklistItems?.length || 0) > 0 && (
                        <div className="flex items-center gap-2 text-sm text-white/70">
                            <CheckSquare className="h-4 w-4" />
                            <span>{note.checklistItems?.filter(i => i.isCompleted).length} / {note.checklistItems?.length}</span>
                        </div>
                    )}
                 </div>
            </div>
            <div className="flex items-center gap-2">
                 {note.tags?.slice(0, 2).map(tag => (
                    <Badge key={tag} variant="secondary" className="bg-primary/10 text-primary border-primary/20">#{tag}</Badge>
                ))}
                 {note.tags && note.tags.length > 2 && <Badge variant="outline">+{note.tags.length - 2}</Badge>}
            </div>
             <div className="pr-2">
                <NoteActions note={note} onUpdate={onUpdate} onDelete={onDelete} />
             </div>
        </div>
    );
};
