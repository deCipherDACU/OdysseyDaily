
'use client';

import React, { useState, useEffect } from 'react';
import { SmartTimetableOutput } from '@/ai/flows/smart-timetable-generation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

type ScheduleItem = SmartTimetableOutput['schedule'][0];

interface EditableTableProps {
  data: ScheduleItem[];
  onChange: (data: ScheduleItem[]) => void;
}

export const EditableTable: React.FC<EditableTableProps> = ({ data, onChange }) => {
  const [tableData, setTableData] = useState(data);

  useEffect(() => {
    setTableData(data);
  }, [data]);

  const handleCellChange = (rowIndex: number, columnId: keyof ScheduleItem, value: string) => {
    const updatedData = [...tableData];
    updatedData[rowIndex] = { ...updatedData[rowIndex], [columnId]: value };
    setTableData(updatedData);
    onChange(updatedData);
  };

  const handleAddRow = () => {
    const newRow: ScheduleItem = {
      time: '12:00 PM - 1:00 PM',
      task: 'New Task',
      category: 'Hobbies',
      difficulty: 'Easy',
    };
    const updatedData = [...tableData, newRow];
    setTableData(updatedData);
    onChange(updatedData);
  };

  const handleRemoveRow = (rowIndex: number) => {
    const updatedData = tableData.filter((_, index) => index !== rowIndex);
    setTableData(updatedData);
    onChange(updatedData);
  };

  const difficultyOptions: ScheduleItem['difficulty'][] = ['Easy', 'Medium', 'Hard', 'N/A'];
  const categoryOptions: ScheduleItem['category'][] = ['Education', 'Career', 'Health', 'Mental Wellness', 'Finance', 'Social', 'Hobbies', 'Home', 'Break', 'Commitment'];

  return (
    <div className="bg-card/70 backdrop-blur-lg border border-white/10 rounded-lg p-4">
      <Table>
        <TableHeader>
          <TableRow className="border-white/10">
            <TableHead className="w-[200px]">Time</TableHead>
            <TableHead>Task</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Difficulty</TableHead>
            <TableHead className="w-[50px] text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tableData.map((row, rowIndex) => (
            <TableRow key={rowIndex} className="border-white/10">
              <TableCell>
                <Input
                  value={row.time}
                  onChange={(e) => handleCellChange(rowIndex, 'time', e.target.value)}
                  className="bg-transparent border-none focus-visible:ring-1"
                />
              </TableCell>
              <TableCell>
                <Input
                  value={row.task}
                  onChange={(e) => handleCellChange(rowIndex, 'task', e.target.value)}
                  className="bg-transparent border-none focus-visible:ring-1"
                />
              </TableCell>
              <TableCell>
                 <Select
                    value={row.category}
                    onValueChange={(value) => handleCellChange(rowIndex, 'category', value)}
                  >
                    <SelectTrigger className="bg-transparent border-none focus:ring-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                    </SelectContent>
                  </Select>
              </TableCell>
              <TableCell>
                  <Select
                    value={row.difficulty}
                    onValueChange={(value) => handleCellChange(rowIndex, 'difficulty', value)}
                  >
                    <SelectTrigger className="bg-transparent border-none focus:ring-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {difficultyOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                    </SelectContent>
                  </Select>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => handleRemoveRow(rowIndex)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="mt-4">
        <Button variant="outline" size="sm" onClick={handleAddRow}>
          <Plus className="mr-2 h-4 w-4" />
          Add Row
        </Button>
      </div>
    </div>
  );
};
