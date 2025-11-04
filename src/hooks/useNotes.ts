

'use client';

import { useState, useMemo, useCallback } from 'react';
import type { Note } from '@/lib/types';
import { useDebounce } from './use-debounce';

export type Sort = {
    key: keyof Note;
    direction: 'asc' | 'desc';
};

export const useNotes = (initialNotes: Note[]) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sort, setSort] = useState<Sort>({ key: 'createdAt', direction: 'desc' });
    const [filterCategory, setFilterCategory] = useState<string>('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const filteredNotes = useMemo(() => {
        return initialNotes
            .filter(note => !note.isArchived)
            .filter(note => {
                if (!filterCategory) return true;
                return (note.category || 'Uncategorized') === filterCategory;
            })
            .filter(note => {
                if (!debouncedSearchTerm) return true;
                const lowercasedTerm = debouncedSearchTerm.toLowerCase();
                return (
                    note.title.toLowerCase().includes(lowercasedTerm) ||
                    note.content.toLowerCase().includes(lowercasedTerm) ||
                    (note.tags || []).some(tag => tag.toLowerCase().includes(lowercasedTerm))
                );
            });
    }, [initialNotes, debouncedSearchTerm, filterCategory]);

    const sortedNotes = useMemo(() => {
        const notesToSort = [...filteredNotes];
        notesToSort.sort((a, b) => {
             const aPinned = a.isPinned || false;
            const bPinned = b.isPinned || false;
            if (aPinned !== bPinned) {
                return aPinned ? -1 : 1;
            }

            const aVal = a[sort.key];
            const bVal = b[sort.key];

            if (aVal === undefined || aVal === null) return 1;
            if (bVal === undefined || bVal === null) return -1;

            if (aVal < bVal) return sort.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sort.direction === 'asc' ? 1 : -1;
            
            return 0;
        });
        return notesToSort;
    }, [filteredNotes, sort]);

    const memoizedSetSearchTerm = useCallback((term: string) => setSearchTerm(term), []);
    const memoizedSetSort = useCallback((newSort: Sort) => setSort(newSort), []);
    const memoizedSetFilterCategory = useCallback((category: string) => setFilterCategory(category), []);
    const memoizedSetViewMode = useCallback((mode: 'grid' | 'list') => setViewMode(mode), []);

    return {
        notes: sortedNotes,
        searchTerm,
        setSearchTerm: memoizedSetSearchTerm,
        sort,
        setSort: memoizedSetSort,
        filterCategory,
        setFilterCategory: memoizedSetFilterCategory,
        viewMode,
        setViewMode: memoizedSetViewMode,
    };
};
