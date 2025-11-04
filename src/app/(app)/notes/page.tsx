

'use client';

import { useState, useMemo, useCallback } from 'react';
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, LayoutGrid, List, Plus, Search, SlidersHorizontal, Tag, X } from "lucide-react";
import { useUser } from '@/context/UserContext';
import { NoteCard } from '@/components/notes/NoteCard';
import { CreateNoteDialog } from '@/components/notes/CreateNoteDialog';
import { useNotes, Sort } from '@/hooks/useNotes';
import { NoteListItem } from '@/components/notes/NoteListItem';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

import { MindMap } from '@/components/notes/MindMap';

type ViewMode = 'grid' | 'list' | 'mindmap';

export default function NotesPage() {
    const { user, notes: initialNotes, addNote, updateNote, deleteNote, loading } = useUser();
    
    const {
        notes,
        searchTerm,
        setSearchTerm,
        sort,
        setSort,
        filterCategory,
        setFilterCategory,
        viewMode,
        setViewMode
    } = useNotes(initialNotes || []);

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    const categories = useMemo(() => {
        const allCategories = initialNotes?.map(n => n.category || 'Uncategorized') || [];
        return ['All', ...Array.from(new Set(allCategories))];
    }, [initialNotes]);

    const sortOptions: { label: string; value: Sort }[] = [
        { label: 'Date Created (Newest)', value: { key: 'createdAt', direction: 'desc' } },
        { label: 'Date Created (Oldest)', value: { key: 'createdAt', direction: 'asc' } },
        { label: 'Date Modified (Newest)', value: { key: 'updatedAt', direction: 'desc' } },
        { label: 'Date Modified (Oldest)', value: { key: 'updatedAt', direction: 'asc' } },
        { label: 'Title (A-Z)', value: { key: 'title', direction: 'asc' } },
        { label: 'Title (Z-A)', value: { key: 'title', direction: 'desc' } },
        { label: 'Priority (High-Low)', value: { key: 'priority', direction: 'desc' } },
    ];
    
    const handleSortChange = useCallback((value: string) => {
        const selectedSort = sortOptions.find(o => `${o.value.key}-${o.value.direction}` === value);
        if (selectedSort) {
            setSort(selectedSort.value);
        }
    }, [sortOptions, setSort]);

    if (loading) {
        return (
            <>
                <PageHeader title="Notes Vault" description="Loading your notes..." />
                <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-64" />)}
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <PageHeader
                title="Notes Vault"
                description="Your personal repository of thoughts, ideas, and knowledge."
                actions={
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Note
                    </Button>
                }
            />

            <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-4 shadow-2xl shadow-black/20 backdrop-blur-2xl flex items-center justify-between gap-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input 
                        placeholder="Search notes..." 
                        className="w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-white placeholder-white/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="flex items-center gap-2">
                                <SlidersHorizontal className="h-4 w-4" />
                                Filter
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-56 p-0">
                             <Command>
                                <CommandInput placeholder="Filter category..." />
                                <CommandEmpty>No category found.</CommandEmpty>
                                <CommandGroup>
                                    {categories.map((category) => (
                                    <CommandItem
                                        key={category}
                                        value={category}
                                        onSelect={(currentValue) => {
                                            setFilterCategory(currentValue === filterCategory || currentValue === 'All' ? '' : currentValue)
                                        }}
                                    >
                                        <Check className={cn("mr-2 h-4 w-4", filterCategory === category ? "opacity-100" : "opacity-0")} />
                                        {category}
                                    </CommandItem>
                                    ))}
                                </CommandGroup>
                            </Command>
                        </PopoverContent>
                    </Popover>

                    <Select onValueChange={handleSortChange} defaultValue={`${sort.key}-${sort.direction}`}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Sort by..." />
                        </SelectTrigger>
                        <SelectContent>
                            {sortOptions.map(option => (
                                <SelectItem key={option.label} value={`${option.value.key}-${option.value.direction}`}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    
                    <div className="flex items-center gap-1 bg-black/20 p-1 rounded-md">
                        <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('grid')}><LayoutGrid /></Button>
                        <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('list')}><List /></Button>
                        <Button variant={viewMode === 'mindmap' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('mindmap')}><span>🧠</span></Button>
                    </div>
                </div>
            </div>

            {filterCategory && (
                <div className="mb-4 flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Filtered by:</span>
                    <div className="flex items-center gap-1 bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-sm">
                        <Tag className="h-4 w-4" />
                        {filterCategory}
                        <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2" onClick={() => setFilterCategory('')}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            {notes.length > 0 ? (
                 <div className={cn(viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4')}>
                    {notes.map(note => (
                         viewMode === 'grid' ? (
                            <NoteCard key={note.id} note={note} onUpdate={updateNote} onDelete={deleteNote} />
                         ) : (
                            <NoteListItem key={note.id} note={note} onUpdate={updateNote} onDelete={deleteNote} />
                         )
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <h3 className="text-xl font-bold">No Notes Yet</h3>
                    <p className="text-muted-foreground">Create your first note to get started.</p>
                </div>
            )}

            {isCreateDialogOpen && <CreateNoteDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} onCreate={addNote} />}

            {viewMode === 'mindmap' && <MindMap notes={notes} />}
        </>
    );
}
