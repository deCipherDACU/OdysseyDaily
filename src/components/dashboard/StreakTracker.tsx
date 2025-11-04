
'use client';
import { Flame } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { useUser } from "@/context/UserContext";
import { addDays, format, startOfWeek, getMonth, isSameDay, endOfDay, startOfDay, eachDayOfInterval } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Skeleton } from "../ui/skeleton";
import { LiquidGlass } from "../ui/LiquidGlass";

type Day = {
  date: Date;
  level: number; // 0-4
};

const getLevelColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-primary/30';
      case 2: return 'bg-primary/50';
      case 3: return 'bg-primary/80';
      case 4: return 'bg-primary';
      default: return 'bg-muted/50';
    }
};

const StreakTracker = () => {
  const { user, tasks } = useUser();
  const [activityData, setActivityData] = useState<Day[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
        const endDate = endOfDay(new Date());
        const startDate = startOfDay(addDays(endDate, -120)); // ~4 months
        const dateRange = eachDayOfInterval({ start: startDate, end: endDate });

        const generatedActivity = dateRange.map(date => {
            const tasksOnDay = tasks.filter(task => 
                task.lastCompleted && isSameDay(new Date(task.lastCompleted), date)
            );
            const completedCount = tasksOnDay.length;
            let level = 0;
            if (completedCount > 0 && completedCount <= 2) level = 1;
            else if (completedCount > 2 && completedCount <= 4) level = 2;
            else if (completedCount > 4 && completedCount <= 6) level = 3;
            else if (completedCount > 6) level = 4;
            
            return { date, level };
        });
        setActivityData(generatedActivity);
    }
  }, [tasks, isClient]);

  const weeks = useMemo(() => {
    if (activityData.length === 0) return [];

    const weeksMap: { [key: string]: Day[] } = {};
    let firstDay = activityData[0].date;
    let startOfFirstWeek = startOfWeek(firstDay);

    // Fill in days before the first day of data to complete the week
    for (let i = 0; i < firstDay.getDay(); i++) {
        const date = addDays(startOfFirstWeek, i);
        if (!weeksMap[format(date, 'yyyy-ww')]) {
            weeksMap[format(date, 'yyyy-ww')] = [];
        }
        weeksMap[format(date, 'yyyy-ww')].push({ date, level: -1 }); // -1 for placeholder
    }

    activityData.forEach(day => {
        const weekKey = format(startOfWeek(day.date), 'yyyy-ww');
        if (!weeksMap[weekKey]) {
            weeksMap[weekKey] = Array(7).fill(null).map((_, i) => ({
                date: addDays(startOfWeek(day.date), i),
                level: -1,
            }));
        }
        const dayOfWeek = day.date.getDay();
        const week = weeksMap[weekKey];
        const dayInWeek = week.find(d => d.date.getDay() === dayOfWeek);
        if(dayInWeek) {
            dayInWeek.level = day.level;
        }
    });

    return Object.values(weeksMap);
  }, [activityData]);

  const monthLabels = useMemo(() => {
    if (weeks.length === 0) return [];
    const labels: { name: string, weekIndex: number }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, index) => {
        const firstDayOfMonth = week.find(d => d.date.getDate() === 1);
        if (firstDayOfMonth) {
            const month = getMonth(firstDayOfMonth.date);
            if (month !== lastMonth) {
                labels.push({ name: format(firstDayOfMonth.date, 'MMM'), weekIndex: index });
                lastMonth = month;
            }
        } else {
            const month = getMonth(week[0].date);
             if (month !== lastMonth && index === 0) {
                labels.push({ name: format(week[0].date, 'MMM'), weekIndex: index });
                lastMonth = month;
            }
        }
    });
    return labels;
  }, [weeks]);


  if (!user || !isClient) {
    return (
      <LiquidGlass className="p-6 col-span-1 lg:col-span-2">
        <h3 className="font-headline font-semibold text-white">Streak Counter</h3>
        <p className="text-sm text-muted-foreground">Your daily activity for the last 4 months.</p>
        <div className="mt-4">
          <Skeleton className="h-40" />
        </div>
      </LiquidGlass>
    );
  }

  return (
    <LiquidGlass variant='heavy' className="p-6 col-span-1 lg:col-span-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-headline font-semibold text-white">Contribution Heatmap</h3>
            <p className="text-sm text-muted-foreground">Your daily activity for the last 4 months.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Flame className="w-8 h-8 text-orange-500" />
              <div>
                <div className="text-2xl font-bold font-headline text-white">{user.streak}</div>
                <div className="text-xs text-muted-foreground">Current</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Flame className="w-5 h-5" />
              <div>
                <div className="text-lg font-bold font-headline text-white">{user.longestStreak}</div>
                <div className="text-xs">Longest</div>
              </div>
            </div>
          </div>
        </div>
      <div className="mt-4">
        <TooltipProvider>
            <div className="flex justify-end gap-1 text-xs text-muted-foreground mb-1">
                <span>Less</span>
                <div className={cn("w-3 h-3 rounded-sm", getLevelColor(0))}></div>
                <div className={cn("w-3 h-3 rounded-sm", getLevelColor(1))}></div>
                <div className={cn("w-3 h-3 rounded-sm", getLevelColor(2))}></div>
                <div className={cn("w-3 h-3 rounded-sm", getLevelColor(3))}></div>
                <div className={cn("w-3 h-3 rounded-sm", getLevelColor(4))}></div>
                <span>More</span>
            </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
             <div className="flex flex-col gap-1 text-xs text-muted-foreground pt-5">
                <div className="h-3">Mon</div>
                <div className="h-3">Wed</div>
                <div className="h-3">Fri</div>
            </div>
            <div className="flex gap-1 relative">
                {monthLabels.map(({ name, weekIndex }) => (
                    <div key={name} className="absolute text-xs font-semibold text-white" style={{ left: `${weekIndex * 16}px` }}>{name}</div>
                ))}
                <div className="flex gap-1 pt-5">
                    {weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="grid grid-rows-7 gap-1">
                        {week.map((day, dayIndex) => (
                        <Tooltip key={dayIndex}>
                            <TooltipTrigger asChild>
                            <div className={cn(
                                "w-3 h-3 rounded-sm",
                                day.level === -1 ? 'bg-transparent' : getLevelColor(day.level)
                            )} />
                            </TooltipTrigger>
                            <TooltipContent>
                            <p>{day.level > 0 ? `${tasks.filter(t => t.lastCompleted && isSameDay(new Date(t.lastCompleted), day.date)).length} tasks` : 'No tasks'} on {format(day.date, 'PPP')}</p>
                            </TooltipContent>
                        </Tooltip>
                        ))}
                    </div>
                    ))}
                </div>
            </div>
          </div>
        </TooltipProvider>
      </div>
    </LiquidGlass>
  );
};

export default StreakTracker;
