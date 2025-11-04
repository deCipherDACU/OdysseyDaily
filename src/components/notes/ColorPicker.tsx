
'use client';

import { cn } from "@/lib/utils";

const colors = [
    '#7C5CFF', // Default Purple
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#FFD166', // Yellow
    '#3B82F6', // Blue
    '#EC4899', // Pink
    '#10B981', // Green
    '#F59E0B', // Orange
];

interface ColorPickerProps {
    onColorSelect: (color: string) => void;
}

export const ColorPicker = ({ onColorSelect }: ColorPickerProps) => {
    return (
        <div className="grid grid-cols-4 gap-2 p-2">
            {colors.map(color => (
                <button
                    key={color}
                    onClick={() => onColorSelect(color)}
                    className={cn(
                        "w-8 h-8 rounded-full border-2 border-transparent transition-transform hover:scale-110"
                    )}
                    style={{ backgroundColor: color }}
                />
            ))}
        </div>
    );
}
