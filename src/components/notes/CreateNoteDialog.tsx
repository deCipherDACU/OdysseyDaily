

'use client';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Note, NoteType } from "@/lib/types";
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';
import { FileText, ListChecks } from 'lucide-react';

interface CreateNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'wordCount'>) => void;
}

export function CreateNoteDialog({ open, onOpenChange, onCreate }: CreateNoteDialogProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<NoteType>('text');

  const handleCreate = () => {
    if (!title.trim()) return;
    const now = new Date();
    onCreate({
      title,
      content,
      type,
    });
    onOpenChange(false);
    setTitle('');
    setContent('');
    setType('text');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-headline">Create New Note</DialogTitle>
          <DialogDescription>
            Capture your thoughts quickly. You can add more details later.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
           <ToggleGroup 
              type="single" 
              defaultValue="text" 
              onValueChange={(value) => setType(value as NoteType)}
              className="w-full justify-start"
            >
                <ToggleGroupItem value="text" aria-label="Text note" className="gap-2">
                    <FileText className="h-4 w-4" />
                    Text
                </ToggleGroupItem>
                <ToggleGroupItem value="checklist" aria-label="Checklist note" className="gap-2">
                    <ListChecks className="h-4 w-4" />
                    Checklist
                </ToggleGroupItem>
            </ToggleGroup>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Note title..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Start writing..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={!title.trim()}>Create Note</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
