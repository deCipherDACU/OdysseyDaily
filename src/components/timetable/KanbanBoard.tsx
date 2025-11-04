'use client';

import React, { useState } from 'react';
import './kanban.css';
import { cn } from '@/lib/utils';
import type { Task } from '@/lib/types';
import { Button } from '../ui/button';
import { Plus, X, ChevronDown, CheckCircle2, Circle, Bell, Check, Edit, Trash2, LucideIcon, BookOpen, Briefcase, HeartPulse, Brain, Coins, Heart, Gamepad2, Home, Coffee, User as UserIcon, MoreHorizontal } from 'lucide-react';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/context/UserContext';
import { calculateTaskXP, calculateTaskCoins } from '@/lib/formulas';
import { Progress } from '../ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

export type Subtask = {
  id: string;
  text: string;
  completed: boolean;
};

export type KanbanCard = {
    id:string;
    title: string;
    description: string;
    difficulty: Task['difficulty'];
    category: Task['category'];
    subtasks: Subtask[];
    reminder?: string;
};

export type KanbanColumn = {
    id: string;
    title: string;
    cards: KanbanCard[];
};

export type KanbanData = {
    columns: KanbanColumn[];
}

interface KanbanBoardProps {
    data: KanbanData;
    onChange: (data: KanbanData) => void;
    className?: string;
    style?: React.CSSProperties;
}

const difficultyColors = {
    'Easy': 'border-green-500/50 bg-green-500/10 text-green-300',
    'Medium': 'border-orange-500/50 bg-orange-500/10 text-orange-300',
    'Hard': 'border-red-500/50 bg-red-500/10 text-red-300',
    'N/A': 'border-gray-500/50 bg-gray-500/10 text-gray-400'
};

const categoryIcons: { [key in Task['category']]: LucideIcon } = {
    Education: BookOpen,
    Career: Briefcase,
    Health: HeartPulse,
    'Mental Wellness': Brain,
    Finance: Coins,
    Social: Heart,
    Hobbies: Gamepad2,
    Home: Home,
    Break: Coffee,
    Commitment: UserIcon,
    Reward: UserIcon, // Fallback
};

const EditableCardTitle = ({ initialTitle, onSave }: { initialTitle: string, onSave: (newTitle: string) => void }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(initialTitle);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const handleSave = () => {
        if (title.trim()) {
            onSave(title);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            setTitle(initialTitle);
            setIsEditing(false);
        }
    };

    React.useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
        }
    }, [isEditing]);

    if (isEditing) {
        return (
            <Input
                ref={inputRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                className="kanban-card-title-input"
            />
        );
    }

    return (
        <h4 className="kanban-card-title" onClick={() => setIsEditing(true)}>
            {title}
        </h4>
    );
};

const CardComponent: React.FC<{
    card: KanbanCard;
    columnId: string;
    onDragStart: (e: React.DragEvent<HTMLDivElement>, card: KanbanCard, fromColumnId: string) => void;
    onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
    onUpdateCard: (updatedCard: KanbanCard) => void;
}> = ({ card, columnId, onDragStart, onDragEnd, onUpdateCard }) => {
    const { toast } = useToast();
    const { user, addXp, addCoins } = useUser();
    const [newSubtask, setNewSubtask] = useState('');

    const toggleSubtask = (subtaskId: string) => {
        const newSubtasks = card.subtasks.map(st => st.id === subtaskId ? { ...st, completed: !st.completed } : st);
        const allCompleted = newSubtasks.every(st => st.completed);
        onUpdateCard({ ...card, subtasks: newSubtasks });

        if (allCompleted && newSubtasks.length > 0) {
            const xp = calculateTaskXP(card.difficulty);
            const coins = calculateTaskCoins(card.difficulty, user?.level || 1);
            addXp(xp);
            addCoins(coins);
            toast({
                title: 'Task Complete!',
                description: `You've earned ${xp} XP and ${coins} coins.`
            });
        }
    };
    
    const addSubtask = () => {
        if (!newSubtask.trim()) return;
        const subtask: Subtask = { id: `subtask-${Date.now()}`, text: newSubtask.trim(), completed: false };
        onUpdateCard({ ...card, subtasks: [...card.subtasks, subtask] });
        setNewSubtask('');
    };

    const deleteSubtask = (subtaskId: string) => {
        onUpdateCard({ ...card, subtasks: card.subtasks.filter(st => st.id !== subtaskId) });
    };

    const setReminder = (date: Date | undefined) => {
        onUpdateCard({ ...card, reminder: date?.toISOString() });
    };

    const CardCategoryIcon = categoryIcons[card.category] || Briefcase;
    const completedSubtasks = card.subtasks.filter(st => st.completed).length;
    const subtaskProgress = card.subtasks.length > 0 ? (completedSubtasks / card.subtasks.length) * 100 : 0;
    const isComplete = subtaskProgress === 100 && card.subtasks.length > 0;

    return (
        <div
            className={cn("kanban-card", isComplete && 'is-complete')}
            draggable
            onDragStart={(e) => onDragStart(e, card, columnId)}
            onDragEnd={onDragEnd}
        >
            <div className="flex items-start gap-3">
                <CardCategoryIcon className="w-5 h-5 mt-1 text-primary/70 shrink-0" />
                <div className="flex-1">
                    <EditableCardTitle
                        initialTitle={card.title}
                        onSave={(newTitle) => onUpdateCard({ ...card, title: newTitle })}
                    />
                    <p className="kanban-card-description">{card.description}</p>
                </div>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6"><MoreHorizontal className="h-4 w-4"/></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                         <Popover>
                            <PopoverTrigger asChild>
                                 <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Bell className="mr-2 h-4 w-4"/> Set Reminder
                                </DropdownMenuItem>
                            </PopoverTrigger>
                            <PopoverContent>
                                <Calendar mode="single" selected={card.reminder ? new Date(card.reminder) : undefined} onSelect={setReminder} />
                            </PopoverContent>
                        </Popover>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            {card.subtasks.length > 0 && (
                <div className="mt-2 space-y-2">
                    <Progress value={subtaskProgress} className="h-1" />
                    {card.subtasks.map(subtask => (
                        <div key={subtask.id} className="flex items-center gap-2 group">
                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => toggleSubtask(subtask.id)}>
                                {subtask.completed ? <CheckCircle2 className="text-green-500"/> : <Circle className="text-muted-foreground"/>}
                            </Button>
                            <span className={cn("flex-1 text-sm", subtask.completed && "line-through text-muted-foreground")}>
                                {subtask.text}
                            </span>
                            <Button size="icon" variant="ghost" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => deleteSubtask(subtask.id)}>
                                <Trash2 className="h-4 w-4 text-destructive"/>
                            </Button>
                        </div>
                    ))}
                </div>
            )}
             <div className="mt-2 flex gap-2">
                <Input
                    placeholder="New subtask..."
                    value={newSubtask}
                    onChange={e => setNewSubtask(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addSubtask()}
                    className="h-8 text-xs"
                />
                <Button size="sm" className="h-8" onClick={addSubtask}><Plus className="h-4 w-4"/></Button>
            </div>

            <div className="kanban-card-footer">
                <div className="flex items-center gap-2">
                    {card.reminder && <Bell className="w-4 h-4 text-primary" title={`Reminder: ${format(new Date(card.reminder), 'PPp')}`}/>}
                </div>
                 <Badge variant="outline" className={cn("text-xs", difficultyColors[card.difficulty])}>
                    {card.difficulty}
                </Badge>
            </div>
        </div>
    );
};


export const KanbanBoard: React.FC<KanbanBoardProps> = ({ data, onChange, className, style }) => {
    const isMobile = useIsMobile();
    const [activeTab, setActiveTab] = useState(data.columns[0]?.id);
    const [draggedItem, setDraggedItem] = useState<{ card: KanbanCard; fromColumnId: string } | null>(null);
    const [collapsedColumns, setCollapsedColumns] = useState<string[]>([]);

    const toggleColumnCollapse = (columnId: string) => {
        setCollapsedColumns(prev =>
            prev.includes(columnId) ? prev.filter(id => id !== columnId) : [...prev, columnId]
        );
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, card: KanbanCard, fromColumnId: string) => {
        setDraggedItem({ card, fromColumnId });
        e.dataTransfer.effectAllowed = 'move';
        e.currentTarget.classList.add('is-dragging');
    };

     const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        e.currentTarget.classList.remove('is-dragging');
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, toColumnId: string) => {
        e.preventDefault();
        if (!draggedItem) return;

        const { card, fromColumnId } = draggedItem;

        if (fromColumnId === toColumnId) return;

        const newColumns = [...data.columns];
        const fromColIndex = newColumns.findIndex(col => col.id === fromColumnId);
        const cardIndex = newColumns[fromColIndex].cards.findIndex(c => c.id === card.id);
        
        newColumns[fromColIndex].cards.splice(cardIndex, 1);
        
        const toColIndex = newColumns.findIndex(col => col.id === toColumnId);
        newColumns[toColIndex].cards.push(card);

        onChange({ columns: newColumns });
        setDraggedItem(null);
    };
    
    const updateCard = (updatedCard: KanbanCard) => {
        const newColumns = data.columns.map(col => ({
            ...col,
            cards: col.cards.map(c => c.id === updatedCard.id ? updatedCard : c)
        }));
        onChange({ columns: newColumns });
    };

    const addCard = (columnId: string) => {
         const newCard: KanbanCard = {
            id: `card-${Date.now()}`,
            title: 'New Task',
            description: '',
            difficulty: 'Easy',
            category: columnId as Task['category'],
            subtasks: [],
        };
        const newColumns = data.columns.map(col => {
            if(col.id === columnId) {
                return { ...col, cards: [...col.cards, newCard] };
            }
            return col;
        });
        onChange({ columns: newColumns });
    };

    if (isMobile) {
        return (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                    {data.columns.map(col => (
                        <TabsTrigger key={col.id} value={col.id}>
                            {col.title} ({col.cards.length})
                        </TabsTrigger>
                    ))}
                </TabsList>
                {data.columns.map(col => (
                    <TabsContent key={col.id} value={col.id} className="mt-4">
                        <ScrollArea className="h-[60vh]">
                             <div className="space-y-2">
                                {col.cards.map(card => (
                                    <CardComponent 
                                        key={card.id}
                                        card={card}
                                        columnId={col.id}
                                        onDragStart={() => {}}
                                        onDragEnd={() => {}}
                                        onUpdateCard={updateCard}
                                    />
                                ))}
                             </div>
                        </ScrollArea>
                    </TabsContent>
                ))}
            </Tabs>
        )
    }

    return (
        <div className={cn("kanban-wrapper", className)} style={style}>
            <div className="kanban-board">
                {data.columns.map(column => {
                    const isCollapsed = collapsedColumns.includes(column.id);
                    const CategoryIcon = categoryIcons[column.id as Task['category']] || Briefcase;

                    return (
                        <div
                            key={column.id}
                            id={column.id}
                            className={cn("kanban-column", isCollapsed && "is-collapsed")}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, column.id)}
                        >
                            <div className="kanban-column-header" onClick={() => toggleColumnCollapse(column.id)}>
                                <h3 className="kanban-column-title">
                                    <CategoryIcon className="w-5 h-5 mr-2 text-primary"/>
                                    {column.title}
                                    <Badge variant="secondary" className="ml-2">{column.cards.length}</Badge>
                                </h3>
                                <ChevronDown className="kanban-collapse-icon" />
                            </div>

                            {!isCollapsed && (
                                <>
                                    <ScrollArea className="kanban-column-cards">
                                        <div className="pr-3 space-y-2">
                                        {column.cards.map(card => (
                                            <CardComponent
                                                key={card.id}
                                                card={card}
                                                columnId={column.id}
                                                onDragStart={handleDragStart}
                                                onDragEnd={handleDragEnd}
                                                onUpdateCard={updateCard}
                                            />
                                        ))}
                                        </div>
                                    </ScrollArea>
                                    <div className="mt-auto pt-2">
                                        <Button variant="ghost" className="w-full justify-start text-sm h-8" onClick={() => addCard(column.id)}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add a card
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    );
};
